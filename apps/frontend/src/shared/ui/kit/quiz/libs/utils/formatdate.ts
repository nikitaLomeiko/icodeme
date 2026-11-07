export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.max(Math.round(seconds % 60), 0);
  return `${m}:${s.toString().padStart(2, "0")}`;
};
