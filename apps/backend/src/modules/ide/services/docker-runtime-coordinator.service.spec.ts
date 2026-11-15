import { DockerRuntimeCoordinator } from './docker-runtime-coordinator.service';

describe('DockerRuntimeCoordinator execution deadline', () => {
  afterEach(() => jest.useRealTimers());

  it('does not extend the step deadline when input refreshes cleanup', () => {
    jest.useFakeTimers();
    const coordinator = new DockerRuntimeCoordinator();
    const cleanup = jest.fn();

    coordinator.scheduleCleanup('container-1', cleanup, 5000);
    jest.advanceTimersByTime(2000);
    coordinator.scheduleCleanup('container-1', cleanup);
    jest.advanceTimersByTime(2999);
    expect(cleanup).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
