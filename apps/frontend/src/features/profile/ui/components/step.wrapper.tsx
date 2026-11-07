import { motion, AnimatePresence } from "framer-motion";
import { Button, Notification, ProgressBar, Title } from "@/shared/ui/kit";

interface IProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
  handleNext: () => void;
  handleBack: () => void;
  handleSubmit: () => void;
  title: string;
  error?: string | null;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const StepWrapper: React.FC<IProps> = (props) => {
  const {
    currentStep,
    totalSteps,
    handleNext,
    handleBack,
    handleSubmit,
    progress,
    title,
    children,
    isLoading = false,
    error,
  } = props;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h2 className="text-white/80 text-2xl font-bold mb-8">
          Осталось совсем немного
        </h2>
        <ProgressBar
          value={progress}
          size="md"
          segments={totalSteps}
          state="success"
          variant="segmented-capsule"
          trackVariant="solid"
          duration={300}
        />
      </div>

      {error && (
        <Notification
          className="bg-transparent border-none mb-10"
          autoClose={false}
          type="error"
          message={error}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="mb-8"
        >
          <Title
            as="p"
            size="2xl"
            weight="medium"
            color="gray-600"
            align="center"
          >
            {title}
          </Title>
        </motion.div>
      </AnimatePresence>

      <div className="min-h-[200px] mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-3">
        {currentStep > 0 ? (
          <Button
            isLoading={isLoading}
            disabled={isLoading}
            variant="outline"
            size="md"
            onClick={handleBack}
            className="flex-1"
          >
            Назад
          </Button>
        ) : (
          <div className="flex-1" />
        )}

        {currentStep < totalSteps - 1 ? (
          <Button
            isLoading={isLoading}
            disabled={isLoading}
            variant="primary"
            size="md"
            onClick={handleNext}
            className="flex-1"
          >
            Далее
          </Button>
        ) : (
          <Button
            isLoading={isLoading}
            disabled={isLoading}
            variant="primary"
            size="md"
            onClick={handleSubmit}
            className="flex-1"
          >
            Завершить
          </Button>
        )}
      </div>
    </div>
  );
};
