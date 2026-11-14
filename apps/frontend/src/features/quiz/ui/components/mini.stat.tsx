"use client";

import { createElement } from "react";

interface IProps {
  icon: React.ComponentType<{ size?: number }>;
  value: string | number;
  label: string;
}

export const MiniStat: React.FC<IProps> = ({ icon, value, label }) => (
  <div className="bg-[var(--ui-background)] border border-[var(--ui-border)] rounded-xl p-4">
    <div className="flex items-center justify-center gap-1.5 text-[var(--ui-primary)]">
      {createElement(icon, { size: 13 })}
      <span className="text-lg font-bold text-[var(--ui-text)]">{value}</span>
    </div>
    <p className="text-[10px] text-[var(--ui-text-muted)] mt-1">{label}</p>
  </div>
);
