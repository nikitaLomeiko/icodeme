"use client";

import { useCallback, useEffect, useState } from "react";
import { PREVIEW_DEVICE_WIDTHS } from "./consts";
import { IPreviewProps, PreviewDevice } from "./types";
import { PreviewFrame, PreviewHeader } from "./ui";

const UPDATE_DELAY = 300;

export const Preview: React.FC<IPreviewProps> = (props) => {
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
    const timer = setTimeout(() => setFrameDocument(document), UPDATE_DELAY);

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
          style={{ maxWidth: PREVIEW_DEVICE_WIDTHS[device] }}
        >
          <PreviewFrame document={frameDocument} />
        </div>
      </div>
    </div>
  );
};
