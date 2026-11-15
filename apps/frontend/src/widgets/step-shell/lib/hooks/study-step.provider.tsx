"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StudyStepPageData } from "./use.study-step";

const StudyStepContext = createContext<StudyStepPageData | null>(null);

export const StudyStepProvider = ({
  value,
  children,
}: {
  value: StudyStepPageData;
  children: ReactNode;
}) => (
  <StudyStepContext.Provider value={value}>{children}</StudyStepContext.Provider>
);

export const useStudyStepData = (): StudyStepPageData => {
  const value = useContext(StudyStepContext);
  if (!value) {
    throw new Error("useStudyStepData must be used inside StudyStepProvider");
  }
  return value;
};
