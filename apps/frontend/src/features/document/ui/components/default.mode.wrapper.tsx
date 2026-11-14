import React from "react";
import { HeaderAction } from "./header.action";
import { ReadProgress } from "@/entities/document/ui/components/read.progress";
import { Card } from "@/shared/ui/kit";
import { Contents } from "@/entities/document/ui/components/contents";

interface IProps {
  children: React.ReactNode;
  title: string;
}

export const DefaultModeWrapper: React.FC<IProps> = (props) => {
  const { children, title } = props;

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <Card title={title} headerAction={<HeaderAction />}>
          <div>
            <ReadProgress />

            <div className="flex gap-8 mt-6">
              <div className={`flex-1 min-w-0 max-w-4xl mx-auto px-2`}>
                {children}
              </div>

              <Contents />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
