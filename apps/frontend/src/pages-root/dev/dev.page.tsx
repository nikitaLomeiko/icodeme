"use client";
import { IdeWidget } from "@/widgets/ide";

export const DevPage: React.FC = () => {
  return (
    <IdeWidget
      userId="4"
      stepId="dev"
      meta={{
        language: "",
        name: "test",
        subtitle: "title",
        title: "title",
      }}
    />
  );
};
