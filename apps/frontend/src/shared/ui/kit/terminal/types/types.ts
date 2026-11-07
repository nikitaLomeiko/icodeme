export type TerminalLineKind =
  | "input"
  | "output"
  | "success"
  | "error"
  | "system";

export interface ITerminalLine {
  id: string;
  kind: TerminalLineKind;
  content: string;
}

export interface IInitialLine {
  kind?: TerminalLineKind;
  content: string;
}

export interface ITerminalContext {
  user: string;
  host: string;
}

export type TerminalResult =
  | string
  | string[]
  | void
  | undefined
  | Promise<string | string[] | void | undefined>;

export interface ITerminalProps {
  user?: string;
  host?: string;
  initialLines?: IInitialLine[] | string[];
  onCommand?: (input: string, context: ITerminalContext) => TerminalResult;
  onInput?: (input: string) => void;
  onChange?: (draft: string) => void;
  readonly?: boolean;
  bodyClassName?: string;
}

export interface ITerminalHandle {
  push: (content: string | string[], kind?: TerminalLineKind) => void;
  clear: () => void;
  execute: (command: string) => Promise<void>;
  getLines: () => ITerminalLine[];
  getHistory: () => string[];
  focus: () => void;
}

export interface ITerminalState {
  lines: ITerminalLine[];
  history: string[];
  busy: boolean;
}
