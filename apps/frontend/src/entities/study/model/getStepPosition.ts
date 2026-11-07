import { IStep } from "./types";

export const getStepPosition = (
  position: IStep["position"] | undefined,
  index: number,
) =>
  position ?? {
    x: index % 2 === 0 ? 15 : 60,
    y: 60 + index * 220,
  };
