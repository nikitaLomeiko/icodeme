import { motion } from "framer-motion";
import { ITab } from "../../../model/types/tab.type";

interface IProps extends Omit<ITab, "id"> {
  onActive: () => void;
  isActive: boolean;
  isCollapsed?: boolean;
}

export const Tab: React.FC<IProps> = (props) => {
  const { isActive, onActive, icon, label, isCollapsed = false } = props;

  const IconComponent = icon;

  return (
    <button
      onClick={onActive}
      title={isCollapsed ? label : undefined}
      className={`
        relative w-full flex items-center rounded-xl py-3 transition-all duration-200
        ${isCollapsed ? "justify-center px-2" : "space-x-3 px-4"}
        ${
          isActive
            ? "bg-[var(--ui-primary)] text-[var(--ui-text)] shadow-md"
            : "text-[var(--ui-text-secondary)] hover:bg-[var(--ui-primary)]/10"
        }
      `}
    >
      <IconComponent
        className={`text-xl transition-colors duration-200 ${
          isActive
            ? "text-[var(--ui-text)]"
            : "text-[var(--ui-text-muted)] group-hover:text-[var(--ui-primary)]"
        }`}
      />
      <span className={isCollapsed ? "sr-only" : "font-medium"}>{label}</span>
      {isActive && (
        <span
          className={`${isCollapsed ? "absolute right-2" : "ml-auto"} h-2 w-2 rounded-full bg-[var(--ui-text)]`}
        />
      )}
    </button>
  );
};
