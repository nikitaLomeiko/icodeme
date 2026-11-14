"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { Markdown } from "@/shared/ui/kit";
import { documentFavoriteStore, documentOptionStore } from "../model";
import { observer } from "mobx-react-lite";
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

  const { fontSize, setContentRef, setContent, setDocumentId } =
    documentOptionStore;

  const { setLineFavorites } = documentFavoriteStore;

  const [getFavorite] = useLazyGetDocumentFavoriteQuery();

  useEffect(() => {
    const fetch = async () => {
      const result = await getFavorite({ documentId });

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
      <div className={`prose prose-invert prose-lg max-w-none ${className ?? ""}`} ref={contentRef}>
        <Markdown fontSize={fontSize} content={content} />
      </div>
    ),
    [fontSize, content],
  );

  return <article aria-label={title}>{markdown}</article>;
});
