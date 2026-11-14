"use client";

import { observer } from "mobx-react-lite";
import { Document } from "@/entities/document";
import { documentOptionStore } from "@/entities/document/model";
import {
  DefaultModeWrapper,
  FavoriteWrapper,
  ZenModeWrapper,
} from "@/features/document";
import { Button } from "@/shared/ui/kit";

interface IProps {
  className?: string;
  title: string;
  content: string;
  documentId?: string;
}

export const DocumentView: React.FC<IProps> = observer((props) => {
  const { isZenMode } = documentOptionStore;

  return (
    <div className={props.className}>
      {isZenMode && (
        <ZenModeWrapper>
          <Document {...props} />
        </ZenModeWrapper>
      )}
      <FavoriteWrapper>
        <DefaultModeWrapper title={props.title}>
          <Document {...props} />
        </DefaultModeWrapper>
        <Button fullWidth className="mt-4 hover:!scale-100">
          Далее
        </Button>
      </FavoriteWrapper>
    </div>
  );
});
