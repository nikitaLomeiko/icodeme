import { Injectable } from '@nestjs/common';
import type Docker from 'dockerode';
import { resolveLimit, resolveRuntimeTtl } from '../utils/docker-runtime.utils';

@Injectable()
export class DockerRuntimeCoordinator {
  private readonly runtimeOperations = new Map<string, Promise<void>>();
  private readonly cleanupTimers = new Map<string, NodeJS.Timeout>();
  private readonly buildWaiters: Array<() => void> = [];
  private readonly pendingRuntimeKeys = new Set<string>();
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

  async withRuntimeLock<T>(
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
      if (
        active.length + this.pendingRuntimeKeys.size >=
        this.maxActiveContainers
      ) {
        return false;
      }

      this.pendingRuntimeKeys.add(runtimeKey);
      return true;
    });
  }

  hasReservation(runtimeKey: string): boolean {
    return this.pendingRuntimeKeys.has(runtimeKey);
  }

  releaseRuntimeSlot(runtimeKey: string): void {
    this.pendingRuntimeKeys.delete(runtimeKey);
  }

  scheduleCleanup(containerId: string, cleanup: () => void): void {
    this.clearCleanupTimer(containerId);
    const timer = setTimeout(() => {
      this.cleanupTimers.delete(containerId);
      cleanup();
    }, this.runtimeTtlMs);
    timer.unref?.();
    this.cleanupTimers.set(containerId, timer);
  }

  clearCleanupTimer(containerId: string): void {
    const timer = this.cleanupTimers.get(containerId);
    if (timer) clearTimeout(timer);
    this.cleanupTimers.delete(containerId);
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
}
