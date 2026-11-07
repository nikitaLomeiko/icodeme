import {
  IInitialLine,
  ITerminalLine,
  TerminalLineKind,
} from "../../types";

const createLineId = () => Math.random().toString(36).substring(2, 9);

export const buildLine = (
  content: string,
  kind: TerminalLineKind = "output",
): ITerminalLine => ({
  id: createLineId(),
  kind,
  content,
});

export const buildLines = (
  source: IInitialLine[] | string[],
): ITerminalLine[] =>
  source.map((item) =>
    typeof item === "string"
      ? buildLine(item)
      : buildLine(item.content, item.kind ?? "output"),
  );

export const buildResultLines = (
  result: string | string[],
  kind: TerminalLineKind = "output",
): ITerminalLine[] =>
  (Array.isArray(result) ? result : [result]).map((content) =>
    buildLine(content, kind),
  );