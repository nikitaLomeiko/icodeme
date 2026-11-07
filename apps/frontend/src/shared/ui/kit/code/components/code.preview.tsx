"use client";

import { useEffect, useMemo } from "react";
import { Modal } from "../../modal";
import { Preview } from "../../preview";
import {
  buildPreviewDocument,
  findMainHtmlFile,
} from "../libs/utils/build-document";
import { useEnviroment } from "../store/enviroment";
import { useExplorer } from "../store/file/use.explorer";

export const CodePreview: React.FC = () => {
  const { allFiles } = useExplorer();
  const { previewOpen, dispatch } = useEnviroment();

  const previewDocument = useMemo(
    () => buildPreviewDocument(allFiles),
    [allFiles],
  );
  const mainFile = useMemo(() => findMainHtmlFile(allFiles), [allFiles]);

  const isOpen = previewOpen && !!previewDocument;

  useEffect(() => {
    if (previewOpen && !previewDocument) {
      dispatch?.({ type: "TOGGLE_PREVIEW" });
    }
  }, [previewOpen, previewDocument, dispatch]);

  const handleClose = () => dispatch?.({ type: "TOGGLE_PREVIEW" });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      variant="dark"
      size="full"
      withAnimation
      closeOnEsc
      closeOnOverlayClick
      blurBackground
      showCloseButton={false}
      overlayClassName="w-full"
      contentClassName="overflow-hidden"
    >
      <Preview
        document={previewDocument || ""}
        address={mainFile?.name}
        height="80vh"
        className="rounded-none border-0"
        onClose={handleClose}
      />
    </Modal>
  );
};
