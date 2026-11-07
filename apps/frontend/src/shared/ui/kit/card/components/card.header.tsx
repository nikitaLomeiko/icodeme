import { ReactNode } from "react";
import { Title } from "../../title";

export const CardHeader: React.FC<{
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className }) => {
  if (!title && !subtitle && !action) return null;

  return (
    <div
      className={`
        flex items-start justify-between
        border-b border-[var(--ui-border)]
        mb-2
        ${className || ""}
      `}
    >
      <div className="flex-1 min-w-0 px-4 sm:px-5">
        {title && (
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-[var(--ui-primary)] to-[var(--ui-primary-hover)] rounded-full" />
            <Title
              size="lg"
              weight="semibold"
              className="!text-[var(--ui-text)] text-lg sm:text-xl truncate"
            >
              {title}
            </Title>
          </div>
        )}
        {subtitle && (
          <p className="text-xs sm:text-sm text-[var(--ui-text-secondary)] mt-1 ">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0 ml-4 mr-2">{action}</div>}
    </div>
  );
};
