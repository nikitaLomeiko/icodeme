import {
  selectCurrentPlan,
  selectCurrentModule,
  selectCurrentModuleIndex,
  selectCurrentLevel,
  selectCurrentLevelIndex,
  selectSelectedLevelIndex,
  selectSelectedStep,
  selectSelectedStepIndex,
} from "@/entities/study";
import { useAppSelector } from "@/shared/lib/hooks";
import { Button, ProgressBar } from "@/shared/ui/kit";
import { motion } from "framer-motion";
import { StepIllustration } from "./step.illustration";

interface IProps {
  onStartStep?: () => void;
}

export const SideBar: React.FC<IProps> = (props) => {
  const { onStartStep } = props;

  const study = useAppSelector(selectCurrentPlan);
  const currentModule = useAppSelector(selectCurrentModule);
  const currentModuleIndex = useAppSelector(selectCurrentModuleIndex);
  const currentLevel = useAppSelector(selectCurrentLevel);
  const currentLevelIndex = useAppSelector(selectCurrentLevelIndex);
  const selectedStep = useAppSelector(selectSelectedStep);
  const selectedLevelIndex = useAppSelector(selectSelectedLevelIndex);
  const selectedStepIndex = useAppSelector(selectSelectedStepIndex);

  if (!study) return null;

  const totalLevels = currentModule?.levels.length ?? 0;
  const completedLevels =
    currentModule?.levels.filter((level) => level.isCompleted).length ?? 0;
  const totalSteps = currentLevel?.steps.length ?? 0;
  const completedSteps =
    currentLevel?.steps.filter((step) => step.isCompleted).length ?? 0;

  return (
    <aside data-study-sidebar className="lg:flex hidden fixed right-4 top-4 bottom-4 z-40 w-[400px] flex-col gap-4 overflow-y-auto pr-1">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="relative shrink-0 overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] shadow-xl backdrop-blur-md"
      >
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[var(--ui-primary)]/15 blur-3xl" />
        <div className="relative p-5">
          {currentModule ? (
            <>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--ui-primary),var(--ui-secondary))] text-lg font-black text-white shadow-[var(--ui-brand-shadow)]">
                  {String(currentModuleIndex + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ui-primary)]">
                    Текущий модуль
                  </div>
                  <div className="mt-1 text-lg font-bold leading-tight text-[var(--ui-text)]">
                    {currentModule.title}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--ui-text-muted)]">
                {currentModule.description}
              </p>
              <div className="mt-5 flex items-center justify-between text-xs text-[var(--ui-text-muted)]">
                <span>Пройдено уровней</span>
                <span className="font-bold text-[var(--ui-text)]">
                  {completedLevels} / {totalLevels}
                </span>
              </div>
              <ProgressBar
                value={completedLevels}
                max={Math.max(totalLevels, 1)}
                size="sm"
                trackColor="var(--ui-background-tertiary)"
                className="mt-2 [&>div>div]:bg-gradient-to-r [&>div>div]:from-[var(--ui-primary)] [&>div>div]:to-[var(--ui-secondary)]"
              />
            </>
          ) : (
            <>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ui-text-muted)]">
                Текущий модуль
              </div>
              <p className="mt-2 text-sm text-[var(--ui-text-muted)]">
                Модуль пока не сформирован.
              </p>
            </>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="shrink-0 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] shadow-xl backdrop-blur-md"
      >
        <div className="p-5">
          {currentLevel ? (
            <>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--ui-primary)] bg-[var(--ui-primary)]/10 text-sm font-black text-[var(--ui-primary)]">
                  {currentLevelIndex + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ui-text-muted)]">
                    Текущий уровень
                  </div>
                  <div className="mt-1 text-lg font-bold leading-tight text-[var(--ui-text)]">
                    {currentLevel.title}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--ui-text-muted)]">
                {currentLevel.description}
              </p>
              <div className="mt-5 flex items-center justify-between text-xs text-[var(--ui-text-muted)]">
                <span>Шаги уровня</span>
                <span className="font-bold text-[var(--ui-text)]">
                  {completedSteps} / {totalSteps}
                </span>
              </div>
              {totalSteps > 0 && (
                <ProgressBar
                  value={completedSteps}
                  max={totalSteps}
                  segments={totalSteps}
                  variant="segmented-capsule"
                  state="success"
                  size="md"
                  segmentGap={2}
                  trackColor="var(--ui-background-tertiary)"
                  className="mt-2"
                />
              )}
            </>
          ) : (
            <>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ui-text-muted)]">
                Текущий уровень
              </div>
              <p className="mt-2 text-sm text-[var(--ui-text-muted)]">
                Уровень пока не сформирован.
              </p>
            </>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] shadow-xl backdrop-blur-md"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {selectedStep ? (
              <>
                <StepIllustration type={selectedStep.type} />
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ui-primary)]">
                  Выбранный шаг
                  {selectedLevelIndex >= 0 && selectedStepIndex >= 0
                    ? ` · Уровень ${selectedLevelIndex + 1}, шаг ${selectedStepIndex + 1}`
                    : ""}
                </div>
                <div className="mt-1 text-lg font-bold text-[var(--ui-text)]">
                  {selectedStep.title}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ui-text-muted)]">
                  {selectedStep.description}
                </p>
                {selectedStep.isCompleted && (
                  <p className="mt-4 text-xs font-semibold text-[var(--ui-primary)]">
                    Пройдено
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-[var(--ui-text-muted)]">
                Выберите шаг на карте обучения.
              </p>
            )}
          </div>

          {selectedStep && (
            <div className="border-t border-[var(--ui-border)] p-4">
              <Button
                size="lg"
                className="w-full"
                disabled={!onStartStep}
                onClick={onStartStep}
              >
                Запустить
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </aside>
  );
};
