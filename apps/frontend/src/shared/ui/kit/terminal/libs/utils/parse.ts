export interface IParsedCommand {
  name: string;
  args: string[];
  raw: string;
}

export const buildPrompt = (user: string, host: string): string =>
  `${user}@${host}:~$`;

export const parseCommand = (input: string): IParsedCommand => {
  const raw = input.trim();
  if (!raw) return { name: "", args: [], raw };

  const [name, ...args] = raw.split(/\s+/);

  return { name: name.toLowerCase(), args, raw };
};