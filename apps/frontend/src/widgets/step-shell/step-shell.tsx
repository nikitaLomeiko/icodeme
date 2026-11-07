"use client";

import { ReactNode } from "react";
import { PageLoading } from "@/widgets/layout/ui/page-loading";
import { BackButton } from "@/shared/ui/back-button";
import { StepAssignment } from "./components/step-assignment";
import { StepRuntimeInfo } from "./components/step-runtime-info";
import type { ISettings } from "@/entities/study";

interface IProps {
  children?: ReactNode;
  message?: string;
  loading?: boolean;
  title?: string;
  description?: string;
  content?: string;
  settings?: ISettings;
}

export const StepShell: React.FC<IProps> = (props) => {
  const {
    children,
    message,
    loading,
    content,
    description,
    title,
    settings,
  } = props;

  return (
    <div className="w-full px-4 pb-12 pt-3 sm:px-6">
      <div className="mb-5 flex items-center gap-3">
        <BackButton />
        <span className="text-sm text-[var(--ui-text-muted)]">Учебный шаг</span>
      </div>
      {loading ? (
        <PageLoading />
      ) : message ? (
        <p
          role="status"
          className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] p-6 text-[var(--ui-text-muted)]"
        >
          {message}
        </p>
      ) : (
        <>
          <StepAssignment
            title={title}
            description={description}
            content={content}
          />
          <div className="mt-5">{children}</div>
          <StepRuntimeInfo settings={settings} />
        </>
      )}
    </div>
  );
};
