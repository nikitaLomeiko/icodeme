import { ChangeEvent } from "react";

interface IProps {
  value: string;
  onSubmit: () => void;
  onChange: (
    event: ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>,
  ) => void;
  isNavigate: boolean;
  placeholder?: string;
}

export const AnswerField: React.FC<IProps> = (props) => {
  const { isNavigate, onChange, onSubmit, value, placeholder } = props;

  return (
    <textarea
      value={value}
      onChange={onChange}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey && !isNavigate) {
          event.preventDefault();
          onSubmit();
        }
      }}
      placeholder={placeholder || "Введите ваш ответ..."}
      rows={4}
      className="
                      w-full rounded-xl border-2 border-[var(--ui-border)]
                      bg-[var(--ui-background)] text-[var(--ui-text)]
                      placeholder:text-[var(--ui-placeholder)]
                      p-4 text-sm leading-relaxed resize-y
                      focus:border-[var(--ui-primary)] focus:outline-none
                      transition-colors duration-200
                    "
    />
  );
};
