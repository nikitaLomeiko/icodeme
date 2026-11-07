"use client";

interface ResultStatProps {
  label: string;
  value: string | number;
  color: string;
}

export const ResultStat: React.FC<ResultStatProps> = ({
  label,
  value,
  color,
}) => (
  <div className="bg-[var(--ui-background)] border border-[var(--ui-border)] rounded-xl p-2">
    <p className="text-xl font-bold" style={{ color }}>
      {value}
    </p>
    <p className="text-[10px] text-[var(--ui-text-muted)] mt-0.5">{label}</p>
  </div>
);
