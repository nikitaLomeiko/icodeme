import { ITab } from "../../../model/types/tab.type";

interface IProps extends Omit<ITab, "id"> {
  onActive: () => void;
  isActive: boolean;
  isCenter?: boolean;
}

export const Tab: React.FC<IProps> = (props) => {
  const { isActive, onActive, icon, label, isCenter = false } = props;

  const IconComponent = icon;

  if (isCenter) {
    return (
      <button
        onClick={onActive}
        className="relative w-full group -translate-y-[14px] focus:outline-none"
      >
        {isActive && (
          <div
            className="absolute -inset-3 rounded-full transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle, var(--ui-primary) 0%, transparent 70%)`,
              opacity: 0.3,
            }}
          />
        )}

        <div
          className="w-24 h-24 rounded-full !border-6 !border-[var(--ui-background)] flex items-center justify-center shadow-lg relative z-10 transition-all duration-200"
          style={{
            backgroundColor: isActive
              ? "var(--ui-primary)"
              : "var(--ui-background-secondary)",
            border: `2px solid var(--ui-background)`,
            boxShadow: isActive
              ? `0 2px 5px var(--ui-brand-shadow)`
              : `0 2px 8px rgba(0,0,0,0.1)`,
            transform: isActive ? "scale(0.99)" : "scale(1) translateY(0)",
          }}
        >
          <IconComponent
            className="text-2xl transition-colors duration-200"
            style={{
              color: isActive
                ? "var(--ui-text-inverse)"
                : "var(--ui-text-secondary)",
            }}
          />
        </div>

        <span
          className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
            isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
          }`}
          style={{ color: "var(--ui-primary)" }}
        >
          {label}
        </span>
      </button>
    );
  }

  return (
    <button onClick={onActive} className="relative group focus:outline-none">
      <div
        className="flex flex-col items-center rounded-xl transition-colors duration-200"
        style={{
          color: isActive ? "var(--ui-primary)" : "var(--ui-text-muted)",
        }}
      >
        <IconComponent className="text-xl w-[45px]" />
        <span className="text-[10px] mt-1 font-medium">{label}</span>

        {isActive && (
          <div
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-200"
            style={{ backgroundColor: "var(--ui-primary)" }}
          />
        )}
      </div>
    </button>
  );
};
