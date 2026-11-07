"use client";
import { IDE } from "@/entities/ide";

export const DevPage = () => {
  return (
    <IDE
      userId="4"
      meta={{
        language: "",
        name: "test",
        subtitle: "title",
        title: "title",
      }}
    />
  );
};
