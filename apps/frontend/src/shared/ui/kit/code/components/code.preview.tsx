"use client";

import { useEffect, useMemo } from "react";
import { Modal } from "../../modal";
import { Preview } from "../../preview";
import {
  buildPreviewDocument,
  findMainHtmlFile,
} from "../libs/utils/build-document";
import { useEnvironment } from "../store/environment";
import { useFileTree } from "../store/file/use.explorer";
import { getAllFiles } from "../store/file/file.reducer";

export const CodePreview: React.FC = () => {
  const { previewOpen } = useEnvironment();
  return previewOpen ? <OpenCodePreview /> : null;
};

const OpenCodePreview: React.FC = () => {
  const { files } = useFileTree();
  const { previewOpen, dispatch } = useEnvironment();
  const allFiles = useMemo(() => getAllFiles(files), [files]);

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
