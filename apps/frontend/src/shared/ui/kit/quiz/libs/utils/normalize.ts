export const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*([=+();:,])\s*/g, "$1");
