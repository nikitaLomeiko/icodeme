import { motion } from "framer-motion";
import { FaCrosshairs, FaMap } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { IStudy } from "@/entities/study";

interface IProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  study?: IStudy;
  showCurrentStepButton: boolean;
}

export const ActionsBar: React.FC<IProps> = (props) => {
  const { showCurrentStepButton, contentRef, study } = props;

  const router = useRouter();

  const scrollToStep = (step?: HTMLElement | null) => {
    if (!step) return;
    step.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
    step.focus({ preventScroll: true });
  };

  const handleGoToCurrentStep = () => {
    const currentStep = contentRef.current?.querySelector<HTMLElement>(
      "[data-current-step]",
    );
    if (currentStep) {
      scrollToStep(currentStep);
    }
  };

  const handleOpenModulesMap = () => {
    router.push(
      study ? `/map?studyId=${encodeURIComponent(study._id)}` : "/map",
    );
  };

  return (
    <div className="fixed lg:right-[432px] right-[20px] lg:bottom-8 bottom-24 z-50 flex flex-col gap-3">
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleOpenModulesMap}
        aria-label="Карта модулей"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] text-[var(--ui-text)] shadow-xl backdrop-blur-md transition-colors hover:bg-[var(--ui-background-tertiary)]"
        title="Карта модулей"
      >
        <FaMap size={17} />
      </motion.button>

      {showCurrentStepButton && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleGoToCurrentStep}
          aria-label="К текущему шагу"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] text-[var(--ui-text)] shadow-xl backdrop-blur-md transition-colors hover:bg-[var(--ui-background-tertiary)]"
          title="К текущему шагу"
        >
          <FaCrosshairs size={17} />
        </motion.button>
      )}
    </div>
  );
};
