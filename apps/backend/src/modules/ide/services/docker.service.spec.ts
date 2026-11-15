import { BaseFileStorage } from '@core/storage';
import { DockerService } from './docker.service';
import { DockerRuntimeCoordinator } from './docker-runtime-coordinator.service';
import { DockerImageService } from './docker-image.service';
import { DockerSessionStore } from './docker-session.store';
import { DockerWorkspaceService } from './docker-workspace.service';
import { DockerInteractiveSessionService } from './docker-interactive-session.service';

const project = {
  _id: 'project-1',
  userId: 'user-1',
  meta: {
    name: 'nested-project',
    title: 'Nested project',
    subtitle: 'Test project',
    language: 'python',
  },
  dir: [
    {
      id: 'src',
      name: 'src',
      type: 'folder' as const,
      content: '',
      children: [
        {
          id: 'main',
          name: 'main.py',
          type: 'file' as const,
          content: 'print("ok")',
          children: [],
        },
      ],
    },
  ],
};

function storageFixture() {
  const calls: string[] = [];
  const storage = {
    deleteDirAsync: async (target: string) => calls.push(`delete:${target}`),
    createDirAsync: async (target: string) => calls.push(`dir:${target}`),
    writeFileAsync: async (target: string, content: string) =>
      calls.push(`file:${target}:${content}`),
  } as unknown as BaseFileStorage;
  return { calls, storage };
}

function serviceFixture(storage: BaseFileStorage) {
  const coordinator = new DockerRuntimeCoordinator();
  const workspace = new DockerWorkspaceService(storage);
  const sessionStore = new DockerSessionStore();
  const imageService = new DockerImageService(coordinator);
  const interactiveSession = new DockerInteractiveSessionService(sessionStore);
  const service = new DockerService(
    workspace,
    coordinator,
    sessionStore,
    imageService,
    interactiveSession,
  ) as any;
  return {
    coordinator: coordinator as any,
    imageService: imageService as any,
    service,
    sessionStore,
    workspace,
  };
}

describe('DockerService runtime lifecycle', () => {
  it('uses one stable runtime and fully refreshes a nested project tree', async () => {
    const { calls, storage } = storageFixture();
    const { coordinator, imageService, service } = serviceFixture(storage);
    const images: string[] = [];
    const runtimeKeys: string[] = [];
    imageService.buildImage = jest.fn(
      async (_docker: unknown, _path: string, image: string) => {
        images.push(image);
      },
    );
    coordinator.reserveRuntimeSlot = jest.fn(async () => true);
    coordinator.hasReservation = jest.fn(() => false);
    imageService.hasImage = jest.fn(async () => false);
    service.createAndStartContainer = jest.fn(
      async (image: string, _project: unknown, runtimeKey: string) => {
        runtimeKeys.push(runtimeKey);
        return { id: 'a'.repeat(64), image };
      },
    );
    service.startInteractiveSession = jest.fn(async () => ({
      status: 'running',
      running: 'false',
      exitCode: '0',
      output: 'ok',
      requiresInput: false,
      startedAt: 'start',
      finishedAt: 'finish',
    }));
    service.scheduleCleanup = jest.fn();
    const changedProject = structuredClone(project);
    changedProject.dir[0].children[0].content = 'print("changed")';

    await service.createAndRunContainer(
      changedProject,
      'FROM python:3.11-slim',
      ['python', 'src/main.py'],
      'step-1',
    );
    await service.createAndRunContainer(
      project,
      'FROM python:3.11-slim',
      ['python', 'src/main.py'],
      'step-1',
    );

    expect(images[0]).not.toBe(images[1]);
    expect(runtimeKeys[0]).toBe(runtimeKeys[1]);
    expect(images[0]).toMatch(
      new RegExp(`^icodeme-runtime-${runtimeKeys[0]}-[a-f0-9]{64}:latest$`),
    );
    expect(calls.filter((call) => call.startsWith('delete:'))).toHaveLength(2);
    expect(calls).toContainEqual(expect.stringMatching(/dir:.*\/src$/));
    expect(calls).toContainEqual(
      expect.stringMatching(/file:.*\/src\/main\.py:print\("ok"\)$/),
    );
    expect(calls).toContainEqual(
      expect.stringMatching(/file:.*\/requirements\.txt:$/),
    );
  });

  it('replaces only the exact previous runtime and removes its obsolete image', async () => {
    const { storage } = storageFixture();
    const { service } = serviceFixture(storage);
    const runtimeKey = 'b'.repeat(40);
    const oldContainerId = 'c'.repeat(64);
    const oldImageId = `sha256:${'d'.repeat(64)}`;
    const newImageId = `sha256:${'e'.repeat(64)}`;
    const stop = jest.fn(async () => undefined);
    const remove = jest.fn(async () => undefined);
    const start = jest.fn(async () => undefined);
    const removeImage = jest.fn(async () => undefined);
    const created: any[] = [];
    const oldContainer = {
      inspect: async () => ({
        Image: oldImageId,
        Config: {
          Labels: {
            'project.user': project.userId,
            'project.runtime': runtimeKey,
          },
        },
      }),
      stop,
      remove,
    };
    const newContainer = {
      id: 'f'.repeat(64),
      start,
      inspect: async () => ({ Image: newImageId }),
    };
    service.docker = {
      listContainers: async () => [
        {
          Id: oldContainerId,
          Names: [`/icodeme-runtime-${runtimeKey}`],
          State: 'running',
        },
        {
          Id: '0'.repeat(64),
          Names: [`/icodeme-runtime-${runtimeKey}-other`],
          State: 'running',
        },
      ],
      getContainer: () => oldContainer,
      createContainer: async (options: unknown) => {
        created.push(options);
        return newContainer;
      },
      getImage: () => ({ remove: removeImage }),
      listImages: async () => [],
    };

    const result = await service.createAndStartContainer(
      `icodeme-runtime-${runtimeKey}:latest`,
      project,
      runtimeKey,
    );

    expect(result).toBe(newContainer);
    expect(stop).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledTimes(1);
    expect(created).toHaveLength(1);
    expect(created[0].name).toBe(`icodeme-runtime-${runtimeKey}`);
    expect(created[0].RestartPolicy).toBeUndefined();
    expect(created[0].HostConfig.RestartPolicy.Name).toBe('no');
    expect(created[0].HostConfig.NetworkMode).toBe('none');
    expect(created[0].HostConfig.PortBindings).toBeUndefined();
    expect(created[0].HostConfig.CapDrop).toContain('ALL');
    expect(removeImage).toHaveBeenCalledTimes(1);
  });

  it('removes the container, workspace and unused runtime image', async () => {
    const { calls, storage } = storageFixture();
    const { service } = serviceFixture(storage);
    const containerId = '1'.repeat(64);
    const runtimeKey = '2'.repeat(40);
    const stop = jest.fn(async () => undefined);
    const remove = jest.fn(async () => undefined);
    const removeImage = jest.fn(async () => undefined);
    service.docker = {
      getContainer: () => ({
        inspect: async () => ({
          Image: `sha256:${'3'.repeat(64)}`,
          Config: {
            Image: `icodeme-runtime-${runtimeKey}:latest`,
            Labels: {
              'project.user': project.userId,
              'project.runtime': runtimeKey,
            },
          },
        }),
        stop,
        remove,
      }),
      getImage: () => ({ remove: removeImage }),
      listContainers: async () => [],
    };

    const result = await service.stopContainer(containerId);

    expect(result.success).toBe(true);
    expect(stop).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith({ force: true, v: true });
    expect(removeImage).toHaveBeenCalledWith({ force: false });
    expect(calls).toContainEqual(
      expect.stringMatching(new RegExp(`delete:.*${runtimeKey}$`)),
    );
  });

  it('limits simultaneous image builds and queues the remaining work', async () => {
    const coordinator = new DockerRuntimeCoordinator() as any;
    coordinator.maxConcurrentBuilds = 2;
    let active = 0;
    let peak = 0;
    await Promise.all(
      Array.from({ length: 7 }, (_, index) =>
        coordinator.withBuildSlot(async () => {
          void index;
          active++;
          peak = Math.max(peak, active);
          await new Promise((resolve) => setTimeout(resolve, 10));
          active--;
        }),
      ),
    );

    expect(peak).toBe(2);
    expect(coordinator.buildSlotsInUse).toBe(0);
    expect(coordinator.buildWaiters).toHaveLength(0);
  });

  it('caps active managed containers and releases capacity after cleanup', async () => {
    const coordinator = new DockerRuntimeCoordinator() as any;
    coordinator.maxActiveContainers = 2;
    coordinator.pendingRuntimeKeys = new Set();
    coordinator.capacityOperations = Promise.resolve();
    const running = new Set<string>();
    const docker = {
      listContainers: async (options: any) => {
        const label = options.filters.label[0];
        if (label.startsWith('project.runtime=')) {
          const runtimeKey = label.slice('project.runtime='.length);
          return running.has(runtimeKey) ? [{ Id: runtimeKey }] : [];
        }
        return Array.from(running, (runtimeKey) => ({ Id: runtimeKey }));
      },
    };

    expect(await coordinator.reserveRuntimeSlot(docker, 'runtime-1')).toBe(
      true,
    );
    expect(await coordinator.reserveRuntimeSlot(docker, 'runtime-2')).toBe(
      true,
    );
    expect(await coordinator.reserveRuntimeSlot(docker, 'runtime-3')).toBe(
      false,
    );
    coordinator.releaseRuntimeSlot('runtime-1');
    expect(await coordinator.reserveRuntimeSlot(docker, 'runtime-3')).toBe(
      true,
    );
  });
});
