import { createHash } from 'crypto';
import type { FileNode } from '@modules/project';

export const createRuntimeKey = (userId: string, stepId: string): string =>
  createHash('sha1').update(`${userId}\0${stepId}`).digest('hex');

export const createSourceHash = (
  nodes: FileNode[],
  dockerfileContent: string,
): string => {
  const hash = createHash('sha256');
  hash.update(dockerfileContent);

  const visit = (entries: FileNode[]): void => {
    for (const node of entries) {
      hash.update(node.type === 'folder' ? 'D\0' : 'F\0');
      hash.update(node.name).update('\0');
      if (node.type === 'folder') visit(node.children ?? []);
      else hash.update(node.content ?? '');
      hash.update('\0');
    }
  };

  visit(nodes);
  return hash.digest('hex');
};

export const resolveLimit = (
  configured: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number => {
  const parsed = Number(configured);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, parsed));
};

export const resolveMemoryLimitMb = (requested?: number): number => {
  const defaultMb = resolveLimit(
    process.env.DOCKER_DEFAULT_MEMORY_MB,
    256,
    64,
    512,
  );
  if (!Number.isFinite(requested)) return defaultMb;
  return Math.max(64, Math.min(512, Math.floor(requested as number)));
};

export const resolveRuntimeTtl = (): number => {
  const configured = Number(process.env.DOCKER_RUNTIME_TTL_MS);
  return Number.isFinite(configured) && configured >= 60_000
    ? configured
    : 30 * 60 * 1000;
};

export const normalizeContainerId = (containerId: unknown): string => {
  const id = typeof containerId === 'string' ? containerId.trim() : '';
  return /^[0-9a-fA-F]{12,64}$/.test(id) ? id : '';
};

export const isDockerNotFound = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as {
    statusCode?: unknown;
    json?: { statusCode?: unknown };
    message?: unknown;
  };

  return (
    candidate.statusCode === 404 ||
    candidate.json?.statusCode === 404 ||
    (typeof candidate.message === 'string' &&
      /no such (?:container|image)/i.test(candidate.message))
  );
};

export const computeRequiresInput = (
  output: string,
  running: boolean,
): boolean => {
  if (!running) return false;
  const lastLine = (
    output.split('\n').filter(Boolean).pop() ?? ''
  ).toLowerCase();
  return (
    lastLine.includes('?') ||
    lastLine.includes('enter') ||
    lastLine.includes('input') ||
    !output.endsWith('\n')
  );
};

export const createOutputDecoder = (
  onText: (text: string) => void,
): ((chunk: Buffer) => void) => {
  let pending = Buffer.alloc(0);
  let framed = true;

  return (chunk) => {
    pending = Buffer.concat([pending, chunk]);

    if (framed) {
      while (pending.length >= 8) {
        const streamType = pending.readUInt8(0);
        const length = pending.readUInt32BE(4);
        const validHeader =
          (streamType === 1 || streamType === 2) &&
          pending.readUInt8(1) === 0 &&
          pending.readUInt8(2) === 0 &&
          pending.readUInt8(3) === 0;

        if (!validHeader || pending.length < 8 + length) {
          if (!validHeader) framed = false;
          break;
        }

        onText(pending.slice(8, 8 + length).toString('utf8'));
        pending = pending.slice(8 + length);
      }
    }

    if (!framed && pending.length > 0) {
      onText(pending.toString('utf8'));
      pending = Buffer.alloc(0);
    }
  };
};
