import { FiCheck } from "react-icons/fi";
import { DropdownOption as typeDropdownOption } from "../types";

interface IProps {
  multiple: boolean;
  selectedValue: string | string[];
  renderOption:
    | ((option: typeDropdownOption, isSelected: boolean) => React.ReactNode)
    | undefined;
  handleSelect: (option: typeDropdownOption) => void;
  option: typeDropdownOption;
}

export const DropdownOption: React.FC<IProps> = (props) => {
  const { multiple, renderOption, selectedValue, option, handleSelect } = props;

  const isSelected = multiple
    ? (selectedValue as string[]).includes(option.value)
    : selectedValue === option.value;

  if (renderOption) {
    return (
      <div key={option.value} onClick={() => handleSelect(option)}>
        {renderOption(option, isSelected)}
      </div>
    );
  }

  return (
    <div
      key={option.value}
      onClick={() => handleSelect(option)}
      className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors
            ${option.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--ui-background-secondary)]"}
            ${isSelected ? "bg-[var(--ui-primary)]/10" : ""}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {option.icon && (
          <option.icon className="w-4 h-4 text-[var(--ui-text-muted)] flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-[var(--ui-text)] truncate">
            {option.label}
          </div>
          {option.description && (
            <div className="text-xs text-[var(--ui-text-muted)] truncate">
              {option.description}
            </div>
          )}
        </div>
      </div>
      {isSelected && (
        <FiCheck className="w-4 h-4 text-[var(--ui-primary)] flex-shrink-0" />
      )}
    </div>
  );
};
