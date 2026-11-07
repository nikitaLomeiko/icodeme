import { ILevel, IStepByLevel } from "../types";

export const useStepByLevel = (levels: ILevel[]) => {
  const allSteps: IStepByLevel[] = levels.flatMap((level, levelIndex) =>
    level.steps.map((step) => ({
      step,
      levelId: level.id ?? String(levelIndex),
      stepIndexInLevel: level.steps.indexOf(step),
    })),
  );

  const stepsGroupedByLevel: Record<string, IStepByLevel[]> = {};

  allSteps.forEach((item) => {
    const key = item.levelId;
    if (!stepsGroupedByLevel[key]) stepsGroupedByLevel[key] = [];
    stepsGroupedByLevel[key].push(item);
  });

  return stepsGroupedByLevel;
};
