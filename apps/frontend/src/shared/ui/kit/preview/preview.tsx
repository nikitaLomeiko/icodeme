"use client";

import { useCallback, useEffect, useState } from "react";
import { previewDeviceWidths } from "./consts";
import { IPreviewProps, PreviewDevice } from "./types";
import { PreviewFrame, PreviewHeader } from "./ui";

const updateDelay = 300;

interface IProps extends IPreviewProps {}

export const Preview: React.FC<IProps> = (props) => {
  const {
    document,
    address = "index.html",
    height = "60vh",
    className = "",
    withDevices = true,
    onClose,
  } = props;

  const [reloadKey, setReloadKey] = useState(0);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [frameDocument, setFrameDocument] = useState(document);

  useEffect(() => {
    const timer = setTimeout(() => setFrameDocument(document), updateDelay);

    return () => clearTimeout(timer);
  }, [document]);

  const handleRefresh = useCallback(() => {
    setFrameDocument(document);
    setReloadKey((key) => key + 1);
  }, [document]);

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] ${className}`}
      style={{ height }}
    >
      <PreviewHeader
        address={address}
        device={device}
        withDevices={withDevices}
        onDeviceChange={setDevice}
        onRefresh={handleRefresh}
        onClose={onClose}
      />

      <div className="flex-1 flex justify-center overflow-auto bg-[var(--ui-background-tertiary)]">
        <div
          key={reloadKey}
          className="h-full w-full transition-all duration-300 ease-in-out"
          style={{ maxWidth: previewDeviceWidths[device] }}
        >
          <PreviewFrame document={frameDocument} />
        </div>
      </div>
    </div>
  );
};
