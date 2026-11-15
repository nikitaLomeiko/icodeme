import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import type Docker from 'dockerode';
import { Db, MongoServerError } from 'mongodb';
import { randomUUID } from 'crypto';
import { resolveLimit, resolveRuntimeTtl } from '../utils/docker-runtime.utils';

@Injectable()
export class DockerRuntimeCoordinator {
  private readonly logger = new Logger(DockerRuntimeCoordinator.name);
  private readonly runtimeOperations = new Map<string, Promise<void>>();
  private readonly cleanupTimers = new Map<string, NodeJS.Timeout>();
  private readonly executionDeadlines = new Map<string, number>();
  private readonly buildWaiters: Array<() => void> = [];
  private readonly pendingRuntimeKeys = new Set<string>();
  private readonly reservationTimers = new Map<string, NodeJS.Timeout>();
  private capacityOperations: Promise<void> = Promise.resolve();
  private buildSlotsInUse = 0;
  private readonly maxConcurrentBuilds = resolveLimit(
    process.env.DOCKER_MAX_CONCURRENT_BUILDS,
    3,
    1,
    12,
  );
  private readonly maxActiveContainers = resolveLimit(
    process.env.DOCKER_MAX_ACTIVE_CONTAINERS,
    24,
    1,
    200,
  );
  private readonly runtimeTtlMs = resolveRuntimeTtl();

  constructor(@Optional() @Inject(Db) private readonly db?: Db) {}

  async withRuntimeLock<T>(
    runtimeKey: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    if (this.db)
      return this.withLease(`runtime:${runtimeKey}`, () =>
        this.withLocalRuntimeLock(runtimeKey, operation),
      );
    return this.withLocalRuntimeLock(runtimeKey, operation);
  }

  private async withLocalRuntimeLock<T>(
    runtimeKey: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const previous =
      this.runtimeOperations.get(runtimeKey) ?? Promise.resolve();
    let release = (): void => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const queued = previous.catch(() => undefined).then(() => gate);
    this.runtimeOperations.set(runtimeKey, queued);

    await previous.catch(() => undefined);
    try {
      return await operation();
    } finally {
      release();
      if (this.runtimeOperations.get(runtimeKey) === queued) {
        this.runtimeOperations.delete(runtimeKey);
      }
    }
  }

  async withBuildSlot<T>(operation: () => Promise<T>): Promise<T> {
    if (this.db) {
      const waitUntil = Date.now() + 120_000;
      for (;;) {
        for (let slot = 0; slot < this.maxConcurrentBuilds; slot++) {
          const release = await this.tryLease(`build:${slot}`);
          if (release) {
            try {
              return await operation();
            } finally {
              await release();
            }
          }
        }
        if (Date.now() >= waitUntil)
          throw new Error('Timed out waiting for a Docker build slot');
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    await this.acquireBuildSlot();
    try {
      return await operation();
    } finally {
      this.releaseBuildSlot();
    }
  }

  async reserveRuntimeSlot(
    docker: Docker,
    runtimeKey: string,
  ): Promise<boolean> {
    return this.withCapacityLock(async () => {
      const existing = await docker.listContainers({
        all: false,
        filters: { label: [`project.runtime=${runtimeKey}`] },
      });
      if (existing.length > 0) return true;

      const active = await docker.listContainers({
        all: false,
        filters: { label: ['project.managed=icodeme'] },
      });
      const pending = this.db
        ? await this.db
            .collection<{
              _id: string;
              expiresAt: Date;
            }>('dockerRuntimeReservations')
            .countDocuments({ expiresAt: { $gt: new Date() } })
        : this.pendingRuntimeKeys.size;
      if (active.length + pending >= this.maxActiveContainers) {
        return false;
      }

      if (this.db) {
        await this.db
          .collection<{
            _id: string;
            expiresAt: Date;
          }>('dockerRuntimeReservations')
          .updateOne(
            { _id: runtimeKey },
            { $set: { expiresAt: new Date(Date.now() + 30 * 60 * 1000) } },
            { upsert: true },
          );
      }
      this.pendingRuntimeKeys.add(runtimeKey);
      if (this.db) {
        const db = this.db;
        const timer = setInterval(
          () => {
            void db
              .collection<{ _id: string; expiresAt: Date }>(
                'dockerRuntimeReservations',
              )
              .updateOne(
                { _id: runtimeKey },
                { $set: { expiresAt: new Date(Date.now() + 30 * 60 * 1000) } },
              )
              .catch((error: unknown) =>
                this.logger.error(
                  `Reservation renewal failed: ${String(error)}`,
                ),
              );
          },
          5 * 60 * 1000,
        );
        timer.unref?.();
        this.reservationTimers.set(runtimeKey, timer);
      }
      return true;
    });
  }

  hasReservation(runtimeKey: string): boolean {
    return this.pendingRuntimeKeys.has(runtimeKey);
  }

  releaseRuntimeSlot(runtimeKey: string): void {
    this.pendingRuntimeKeys.delete(runtimeKey);
    const timer = this.reservationTimers.get(runtimeKey);
    if (timer) clearInterval(timer);
    this.reservationTimers.delete(runtimeKey);
    if (this.db)
      void this.db
        .collection<{ _id: string; expiresAt: Date }>(
          'dockerRuntimeReservations',
        )
        .deleteOne({ _id: runtimeKey })
        .catch((error: unknown) =>
          this.logger.warn(`Reservation cleanup failed: ${String(error)}`),
        );
  }

  scheduleCleanup(
    containerId: string,
    cleanup: () => void,
    timeLimitMs?: number,
  ): void {
    this.clearCleanupTimer(containerId);
    if (timeLimitMs !== undefined && Number.isFinite(timeLimitMs)) {
      this.executionDeadlines.set(
        containerId,
        Date.now() + Math.max(1000, Math.min(timeLimitMs, this.runtimeTtlMs)),
      );
    }
    const deadline = this.executionDeadlines.get(containerId);
    const delay =
      deadline === undefined
        ? this.runtimeTtlMs
        : Math.min(this.runtimeTtlMs, Math.max(0, deadline - Date.now()));
    const timer = setTimeout(() => {
      this.cleanupTimers.delete(containerId);
      this.executionDeadlines.delete(containerId);
      cleanup();
    }, delay);
    timer.unref?.();
    this.cleanupTimers.set(containerId, timer);
  }

  clearCleanupTimer(containerId: string): void {
    const timer = this.cleanupTimers.get(containerId);
    if (timer) clearTimeout(timer);
    this.cleanupTimers.delete(containerId);
  }

  forgetRuntime(containerId: string): void {
    this.clearCleanupTimer(containerId);
    this.executionDeadlines.delete(containerId);
  }

  private async acquireBuildSlot(): Promise<void> {
    if (this.buildSlotsInUse < this.maxConcurrentBuilds) {
      this.buildSlotsInUse += 1;
      return;
    }
    await new Promise<void>((resolve) => this.buildWaiters.push(resolve));
  }

  private releaseBuildSlot(): void {
    const next = this.buildWaiters.shift();
    if (next) next();
    else this.buildSlotsInUse = Math.max(0, this.buildSlotsInUse - 1);
  }

  private async withCapacityLock<T>(operation: () => Promise<T>): Promise<T> {
    if (this.db) return this.withLease('capacity', operation);
    const previous = this.capacityOperations;
    let release = (): void => undefined;
    this.capacityOperations = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }

  private async withLease<T>(
    key: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const release = await this.acquireLease(key);
    try {
      return await operation();
    } finally {
      await release().catch((error: unknown) =>
        this.logger.warn(`Docker lease release failed: ${String(error)}`),
      );
    }
  }

  private async acquireLease(key: string): Promise<() => Promise<void>> {
    const until = Date.now() + 60_000;
    while (Date.now() < until) {
      const release = await this.tryLease(key);
      if (release) return release;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Timed out acquiring Docker lease: ${key}`);
  }

  private async tryLease(key: string): Promise<(() => Promise<void>) | null> {
    if (!this.db) return null;
    const collection = this.db.collection<{
      _id: string;
      owner: string;
      expiresAt: Date;
    }>('dockerRuntimeLeases');
    const owner = randomUUID();
    try {
      const acquired = await collection.updateOne(
        { _id: key, expiresAt: { $lte: new Date() } },
        { $set: { owner, expiresAt: new Date(Date.now() + 90_000) } },
        { upsert: true },
      );
      if (!acquired.matchedCount && !acquired.upsertedCount) return null;
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000)
        return null;
      throw error;
    }
    const heartbeat = setInterval(() => {
      void collection
        .updateOne(
          { _id: key, owner },
          { $set: { expiresAt: new Date(Date.now() + 90_000) } },
        )
        .catch((error: unknown) =>
          this.logger.error(`Docker lease renewal failed: ${String(error)}`),
        );
    }, 30_000);
    heartbeat.unref?.();
    return async () => {
      clearInterval(heartbeat);
      await collection.deleteOne({ _id: key, owner });
    };
  }
}
