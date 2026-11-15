import type { ISettings } from '../models/study.model';

type Runtime = Pick<
  ISettings,
  | 'language'
  | 'dockerFile'
  | 'startCommand'
  | 'entryFile'
  | 'memoryLimitMb'
  | 'timeLimitMs'
>;

const python: Runtime = {
  language: 'python',
  dockerFile:
    'FROM python:3.11-slim\nWORKDIR /workspace\nRUN useradd -u 10001 -m learner\nCOPY --chown=10001:10001 . .\nUSER 10001\nCMD ["tail", "-f", "/dev/null"]',
  startCommand: ['python', '-u', 'main.py'],
  entryFile: 'main.py',
  memoryLimitMb: 256,
  timeLimitMs: 30_000,
};

const javascript: Runtime = {
  language: 'javascript',
  dockerFile:
    'FROM node:22-alpine\nWORKDIR /workspace\nRUN adduser -D -u 10001 learner\nCOPY --chown=10001:10001 . .\nUSER 10001\nCMD ["tail", "-f", "/dev/null"]',
  startCommand: ['node', 'index.js'],
  entryFile: 'index.js',
  memoryLimitMb: 256,
  timeLimitMs: 30_000,
};

export function runtimeForStudy(context: string): Runtime | null {
  const value = context.toLowerCase();
  if (/python|питон|пайтон/.test(value)) return { ...python };
  if (/javascript|java script|js\b|джаваскрипт|жаваскрипт/.test(value))
    return { ...javascript };
  return null;
}
