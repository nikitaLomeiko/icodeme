export interface IContainerResponse {
  containerId: string;
  imageName: string;
  status: string;
  running: string;
  exitCode: string;
  output: string;
  startedAt: string;
  finishedAt: string;
  requiresInput: boolean;
}
