import {
  Level,
  Module,
  Step,
  StepLine,
  getStepPosition,
  type IModule,
} from "@/entities/study";

interface IProps {
  module: IModule;
  moduleIndex: number;
  onSelectStep: (levelIndex: number, stepIndex: number) => void;
}

export const StudyModuleMap = ({
  module,
  moduleIndex,
  onSelectStep,
}: IProps) => (
  <div className="w-full px-4 py-6">
    <Module
      {...module}
      index={moduleIndex + 1}
      levelsCount={module.levels.length}
      variant="header"
    />

    {module.levels.length === 0 ? (
      <p className="text-sm text-[var(--ui-text-muted)]">
        Уровни пока не добавлены.
      </p>
    ) : (
      module.levels.map((level, levelIndex) => {
        const maxY = Math.max(
          350,
          ...level.steps.map(
            (step, index) => getStepPosition(step.position, index).y + 180,
          ),
        );

        return (
          <Level
            key={level.id ?? levelIndex}
            {...level}
            maxY={maxY}
            index={levelIndex + 1}
          >
            <StepLine steps={level.steps} />
            {level.steps.map((step, stepIndex) => (
              <Step
                {...step}
                key={step.id ?? stepIndex}
                onSelect={() => onSelectStep(levelIndex, stepIndex)}
                stepNumber={stepIndex + 1}
              />
            ))}
          </Level>
        );
      })
    )}
  </div>
);
