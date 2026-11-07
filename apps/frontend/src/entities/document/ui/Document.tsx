"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { Markdown } from "@/shared/ui/kit/markdown";
import { Button } from "@/shared/ui/kit";
import { documentFavoriteStore, documentOptionStore } from "../model";
import { observer } from "mobx-react-lite";
import { ZenModeWrapper } from "./components/zen.mode.wrapper";
import { FavoriteWrapper } from "./components/favorite.wrapper";
import { DefaultModeWrapper } from "./components/default.mode.wrapper";
import { useLazyGetDocumentFavoriteQuery } from "../api";

interface IProps {
  className?: string;
  title: string;
  content: string;
  documentId?: string;
}

export const Document: React.FC<IProps> = observer((props) => {
  const { content, title, documentId = title, className } = props;

  const contentRef = useRef<HTMLDivElement>(null);

  const { fontSize, setContentRef, isZenMode, setContent, setDocumentId } =
    documentOptionStore;

  const { setLineFavorites } = documentFavoriteStore;

  const [getFavorite] = useLazyGetDocumentFavoriteQuery();

  useEffect(() => {
    const fetch = async () => {
      const result = await getFavorite({ documentId });

      console.log(result);

      if (result.data) {
        setLineFavorites(result.data.data?.links || []);
      }
    };

    fetch();
  }, [documentId]);

  useEffect(() => {
    if (!contentRef.current) return;

    setContentRef(contentRef);
    setContent(content);
    setDocumentId(documentId);
  }, [contentRef]);

  const markdown = useMemo(
    () => (
      <div className="prose prose-invert prose-lg max-w-none" ref={contentRef}>
        <Markdown fontSize={fontSize} content={content} />
      </div>
    ),
    [fontSize, content],
  );

  return (
    <div className={className}>
      {isZenMode && <ZenModeWrapper>{markdown}</ZenModeWrapper>}

      <FavoriteWrapper>
        <DefaultModeWrapper title={title}>{markdown}</DefaultModeWrapper>
        <Button fullWidth className="mt-4 hover:!scale-100">
          Далее
        </Button>
      </FavoriteWrapper>
    </div>
  );
});
