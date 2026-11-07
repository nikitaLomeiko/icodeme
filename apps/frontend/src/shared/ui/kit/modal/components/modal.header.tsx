import { FiX } from "react-icons/fi";
import { Title } from "../../title";
import { ModalVariant } from "../types";

export const ModalHeader: React.FC<{
  title?: string;
  showCloseButton: boolean;
  onClose: () => void;
  variant: ModalVariant;
}> = ({ title, showCloseButton, onClose, variant }) => {
  if (!title && !showCloseButton) return null;

  const isTransparent = variant === "transparent";
  const isNone = variant === "none";
  const showHeaderBorder = !isTransparent && !isNone;

  return (
    <div
      className={`
        flex items-center justify-between
        px-4
        ${showHeaderBorder ? "border-b border-[var(--ui-border)]" : ""}
      `}
    >
      {title && (
        <Title size="lg" weight="semibold" className="!text-[var(--ui-text)]">
          {title}
        </Title>
      )}
      <div className={!title ? "ml-auto" : ""}>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="
              p-2 rounded-lg
              text-[var(--ui-text-secondary)]
              hover:text-[var(--ui-text)]
              hover:bg-[var(--ui-background-secondary)]
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[var(--ui-primary)]/50
            "
          >
            <FiX size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
