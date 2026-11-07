export type typeMode =
  | "login"
  | "register"
  | "forgot"
  | "verify"
  | "verify-reset"
  | "reset";

export interface IModeMeta {
  title: string;
  buttonTitle?: string;
}

export type IModeData = Record<typeMode, IModeMeta>;
