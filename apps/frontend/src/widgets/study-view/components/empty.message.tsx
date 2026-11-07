import { Button, Title } from "@/shared/ui/kit";
import { FaBookOpen, FaPlus } from "react-icons/fa";

interface IProps {
  onAddLanguage: () => void;
}

export const EmptyMessage: React.FC<IProps> = ({ onAddLanguage }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-[var(--ui-primary)]/10 flex items-center justify-center mb-4">
        <FaBookOpen className="text-[var(--ui-primary)] text-3xl" />
      </div>
      <Title
        as="h3"
        size="sm"
        weight="semibold"
        color="default"
        className="mb-2"
      >
        Еще нет планов обучения
      </Title>
      <p className="text-sm text-[var(--ui-text-secondary)] mb-6 max-w-sm">
        Добавьте свой первый язык программирования, чтобы начать обучение
      </p>
      <Button
        variant="primary"
        size="md"
        onClick={onAddLanguage}
        className="gap-2"
      >
        <FaPlus size={14} />
        Добавить язык
      </Button>
    </div>
  );
};
