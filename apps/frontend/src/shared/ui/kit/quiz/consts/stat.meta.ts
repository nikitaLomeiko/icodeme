import { FaCheckCircle, FaHourglass, FaQuestionCircle, FaTimesCircle } from "react-icons/fa";
import { QuestionState } from "../types";

export const stateMeta: Record<
  QuestionState,
  { label: string; icon: React.ComponentType<{ size?: number }>; chip: string }
> = {
  correct: {
    label: "Верно",
    icon: FaCheckCircle,
    chip: "text-white bg-[var(--ui-success)]",
  },
  incorrect: {
    label: "Неверно",
    icon: FaTimesCircle,
    chip: "text-white bg-red-500",
  },
  skipped: {
    label: "Не отвечен",
    icon: FaHourglass,
    chip: "text-[var(--ui-text-muted)] bg-[var(--ui-fill)]",
  },
  ungraded: {
    label: "Без проверки",
    icon: FaQuestionCircle,
    chip: "text-[var(--ui-text-muted)] bg-[var(--ui-fill)]",
  },
};
