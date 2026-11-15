const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const Docker = require('dockerode');
const { DockerService } = require('../src/modules/ide/services/docker.service');
const { BaseFileStorage } = require('../src/core/storage');
const {
  DockerRuntimeCoordinator,
} = require('../src/modules/ide/services/docker-runtime-coordinator.service');
const {
  DockerImageService,
} = require('../src/modules/ide/services/docker-image.service');
const {
  DockerSessionStore,
} = require('../src/modules/ide/services/docker-session.store');
const {
  DockerWorkspaceService,
} = require('../src/modules/ide/services/docker-workspace.service');
const {
  DockerInteractiveSessionService,
} = require('../src/modules/ide/services/docker-interactive-session.service');

const userId = 'runtime-integration-user';
const stepId = 'runtime-integration-step';
const runtimeKey = crypto
  .createHash('sha1')
  .update(`${userId}\0${stepId}`)
  .digest('hex');
const imageNames = new Set();
const workspace = path.join('data', 'containers', userId, runtimeKey);
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const fileStorage = new BaseFileStorage();
const coordinator = new DockerRuntimeCoordinator();
const sessionStore = new DockerSessionStore();
const service = new DockerService(
  new DockerWorkspaceService(fileStorage),
  coordinator,
  sessionStore,
  new DockerImageService(coordinator),
  new DockerInteractiveSessionService(sessionStore),
);
const terminalUserId = 'runtime-integration-terminal-user';
const terminalStepId = 'runtime-integration-terminal-step';
const terminalRuntimeKey = crypto
  .createHash('sha1')
  .update(`${terminalUserId}\0${terminalStepId}`)
  .digest('hex');
const terminalImageNames = new Set();
const terminalWorkspace = path.join(
  'data',
  'containers',
  terminalUserId,
  terminalRuntimeKey,
);

function project(message, includeObsolete, ownerId = userId) {
  return {
    _id: 'runtime-integration-project',
    userId: ownerId,
    meta: {
      name: 'runtime-integration-project',
      title: 'Runtime integration project',
      subtitle: 'Repeated multi-file build',
      language: 'python',
    },
    dir: [
      {
        id: 'main',
        name: 'main.py',
        type: 'file',
        content:
          'import os\nfrom lib.message import MESSAGE\n' +
          'print(f"{MESSAGE}|stale={os.path.exists(\'obsolete/old.txt\')}")\n',
        children: [],
      },
      {
        id: 'lib',
        name: 'lib',
        type: 'folder',
        content: '',
        children: [
          {
            id: 'message',
            name: 'message.py',
            type: 'file',
            content: `MESSAGE = ${JSON.stringify(message)}\n`,
            children: [],
          },
        ],
      },
      ...(includeObsolete
        ? [
            {
              id: 'obsolete',
              name: 'obsolete',
              type: 'folder',
              content: '',
              children: [
                {
                  id: 'old',
                  name: 'old.txt',
                  type: 'file',
                  content: 'must disappear',
                  children: [],
                },
              ],
            },
          ]
        : []),
    ],
  };
}

async function cleanup() {
  const containers = await docker.listContainers({
    all: true,
    filters: { label: [`project.runtime=${runtimeKey}`] },
  });
  for (const item of containers) {
    const container = docker.getContainer(item.Id);
    await container.remove({ force: true, v: true }).catch(() => undefined);
  }
  for (const imageName of imageNames) {
    await docker
      .getImage(imageName)
      .remove({ force: true })
      .catch(() => undefined);
  }
  new BaseFileStorage().deleteDir(workspace);
}

async function cleanupTerminal() {
  const containers = await docker.listContainers({
    all: true,
    filters: { label: [`project.runtime=${terminalRuntimeKey}`] },
  });
  for (const item of containers) {
    await docker
      .getContainer(item.Id)
      .remove({ force: true, v: true })
      .catch(() => undefined);
  }
  for (const imageName of terminalImageNames) {
    await docker
      .getImage(imageName)
      .remove({ force: true })
      .catch(() => undefined);
  }
  new BaseFileStorage().deleteDir(terminalWorkspace);
}

async function main() {
  await cleanup();
  try {
    const dockerfile = [
      'FROM python:3.11-slim',
      'WORKDIR /app',
      'ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_DISABLE_PIP_VERSION_CHECK=1',
      'COPY requirements.txt ./',
      'RUN if [ -s requirements.txt ]; then python -m pip install --no-cache-dir -r requirements.txt; fi',
      'COPY . .',
      'CMD ["tail", "-f", "/dev/null"]',
    ].join('\n');
    const command = ['python', '-u', 'main.py'];
    const first = await service.createAndRunContainer(
      project('first', true),
      dockerfile,
      command,
      stepId,
    );
    assert.equal(first.success, true);
    imageNames.add(first.data.imageName);
    assert.match(first.data.output, /first\|stale=True/);

    const second = await service.createAndRunContainer(
      project('second', false),
      dockerfile,
      command,
      stepId,
    );
    assert.equal(second.success, true);
    imageNames.add(second.data.imageName);
    assert.match(second.data.output, /second\|stale=False/);
    assert.notEqual(second.data.imageName, first.data.imageName);
    assert.notEqual(second.data.containerId, first.data.containerId);
    assert.equal(fs.existsSync(path.join(workspace, 'obsolete')), false);

    const third = await service.createAndRunContainer(
      project('second', false),
      dockerfile,
      command,
      stepId,
    );
    assert.equal(third.success, true);
    assert.equal(third.data.imageName, second.data.imageName);
    assert.notEqual(third.data.containerId, second.data.containerId);

    const active = await docker.listContainers({
      all: true,
      filters: { label: [`project.runtime=${runtimeKey}`] },
    });
    assert.equal(active.length, 1);
    assert.equal(active[0].Id, third.data.containerId);

    const stopped = await service.stopContainer(third.data.containerId);
    assert.equal(stopped.success, true);
    const remaining = await docker.listContainers({
      all: true,
      filters: { label: [`project.runtime=${runtimeKey}`] },
    });
    assert.equal(remaining.length, 0);
    assert.equal(fs.existsSync(workspace), false);
    await assert.rejects(
      () => docker.getImage(second.data.imageName).inspect(),
      (error) => error.statusCode === 404,
    );

    const terminal = await service.createAndRunContainer(
      project('terminal-test', false, terminalUserId),
      'FROM ubuntu:24.04\nWORKDIR /workspace\nCOPY . .\nCMD ["tail", "-f", "/dev/null"]',
      ['/bin/bash'],
      terminalStepId,
      undefined,
      true,
    );
    assert.equal(terminal.success, true);
    terminalImageNames.add(terminal.data.imageName);

    const terminalSocket = new EventEmitter();
    terminalSocket.readyState = 1;
    terminalSocket.frames = [];
    terminalSocket.send = (frame) => terminalSocket.frames.push(frame);
    terminalSocket.close = () => {
      terminalSocket.readyState = 3;
    };
    assert.equal(
      service.attachTerminalSocket(terminal.data.containerId, terminalSocket),
      true,
    );
    terminalSocket.emit(
      'message',
      Buffer.from(JSON.stringify({ type: 'resize', cols: 100, rows: 30 })),
    );
    terminalSocket.emit(
      'message',
      Buffer.from(
        JSON.stringify({
          type: 'input',
          data: "printf 'websocket-tty-ok\\n'\n",
        }),
      ),
    );
    const outputDeadline = Date.now() + 5000;
    while (
      !terminalSocket.frames.some((frame) =>
        String(frame).includes('websocket-tty-ok'),
      ) &&
      Date.now() < outputDeadline
    ) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    assert.ok(
      terminalSocket.frames.some((frame) =>
        String(frame).includes('websocket-tty-ok'),
      ),
    );

    const firstCommand = await service.sendInputToContainer(
      terminal.data.containerId,
      "printf 'linux-terminal-ok\\n'; pwd",
    );
    assert.equal(firstCommand.success, true);
    assert.match(firstCommand.data.output, /linux-terminal-ok/);
    assert.match(firstCommand.data.output, /\/workspace/);
    assert.equal(firstCommand.data.running, 'true');

    const secondCommand = await service.sendInputToContainer(
      terminal.data.containerId,
      "printf 'same-shell-ok\\n'",
    );
    assert.equal(secondCommand.success, true);
    assert.match(secondCommand.data.output, /same-shell-ok/);
    assert.equal(secondCommand.data.running, 'true');

    const terminalStopped = await service.stopContainer(
      terminal.data.containerId,
    );
    assert.equal(terminalStopped.success, true);
    assert.equal(fs.existsSync(terminalWorkspace), false);
    await assert.rejects(
      () => docker.getImage(terminal.data.imageName).inspect(),
      (error) => error.statusCode === 404,
    );

    console.log('Docker runtime integration test passed');
  } finally {
    await cleanup();
    await cleanupTerminal();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
