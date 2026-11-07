import { paddingStyles } from "../styles";
import { CardPadding } from "../types";

export const CardSkeleton: React.FC<{ padding: CardPadding }> = ({
  padding,
}) => (
  <div className={`${paddingStyles[padding]} space-y-4 animate-pulse`}>
    <div className="h-4 bg-[var(--ui-border)] rounded w-1/4"></div>
    <div className="space-y-2">
      <div className="h-3 bg-[var(--ui-border)] rounded w-3/4"></div>
      <div className="h-3 bg-[var(--ui-border)] rounded w-1/2"></div>
    </div>
  </div>
);
