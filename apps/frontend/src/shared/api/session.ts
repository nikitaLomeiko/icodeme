let queue: Promise<unknown> = Promise.resolve();
let revision = 0;
export const sessionRevision = () => revision;
export const invalidateSession = () => ++revision;
export function sessionLock<T>(work: () => Promise<T>): Promise<T> {
  const run = async (): Promise<T> =>
    typeof navigator !== "undefined" && navigator.locks
      ? await navigator.locks.request("icodeme-session", work)
      : await work();
  const result = queue.then(run, run);
  queue = result.catch(() => undefined);
  return result;
}
let channel: BroadcastChannel | null = null;
function sessionChannel() {
  if (typeof BroadcastChannel === "undefined") return null;
  return (channel ??= new BroadcastChannel("icodeme-session"));
}
export function announceSession() {
  sessionChannel()?.postMessage("changed");
}
export function subscribeSession(listener: () => void) {
  const current = sessionChannel();
  current?.addEventListener("message", listener);
  return () => current?.removeEventListener("message", listener);
}
