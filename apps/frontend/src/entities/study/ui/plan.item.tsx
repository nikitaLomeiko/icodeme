"use client";

import { Button } from "@/shared/ui/kit";
import { FiBriefcase, FiCode, FiTrash2 } from "react-icons/fi";
import { IStudy } from "../model/types";
import { FaRocket } from "react-icons/fa";

interface IProps {
  study: IStudy;
  onContinue: () => void;
  onDelete: () => void;
}

export const PlanItem: React.FC<IProps> = ({ study, onContinue, onDelete }) => {
  return (
    <div className="group relative overflow-hidden bg-gradient-to-r from-[var(--ui-background)] to-[var(--ui-background-secondary)] border border-[var(--ui-border)] rounded-xl transition-all duration-300 hover:shadow-lg">
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors z-10"
        title="Удалить план"
      >
        <FiTrash2 size={16} />
      </button>

      <div className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-shrink-0 self-start rounded-lg bg-[var(--ui-primary)]/10 p-2">
            <FiCode className="text-lg text-[var(--ui-primary)]" />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <h3 className="mb-1 text-base font-bold text-[var(--ui-text)]">
              {study.title}
            </h3>
            <p className="mb-2 text-sm leading-relaxed text-[var(--ui-text-secondary)]">
              {study.description}
            </p>
            <div className="my-2 grid grid-cols-2 gap-2">
              <div className="min-w-0 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-background)]/70 px-2.5 py-2">
                <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ui-text-muted)]">
                  Модуль
                </div>
                <div className="truncate text-xs font-semibold text-[var(--ui-text)]">
                  {study.study.moduleTitle || "Не начато"}
                </div>
              </div>
              <div className="min-w-0 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-background)]/70 px-2.5 py-2">
                <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ui-text-muted)]">
                  Уровень
                </div>
                <div className="truncate text-xs font-semibold text-[var(--ui-text)]">
                  {study.study.levelTitle || "Не начато"}
                </div>
              </div>
            </div>
            <div className="mb-3 mt-2">
              <span className="flex w-full items-center gap-1.5 rounded-lg border border-[var(--ui-primary)]/20 bg-[var(--ui-primary)]/10 px-3 py-2 text-xs font-semibold text-[var(--ui-primary)]">
                <FiBriefcase size={12} />
                {study.level.positionName}
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={onContinue}
              className="w-full"
            >
              <FaRocket size={14} /> Перейти
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
