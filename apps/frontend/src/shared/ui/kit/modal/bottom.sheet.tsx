"use client";

import { useRef, type TouchEvent } from "react";
import { Modal } from "./modal";
import type { ModalProps } from "./types";

type BottomSheetProps = Omit<ModalProps, "position"> & {
  swipeToClose?: boolean;
  swipeThreshold?: number;
};

export const BottomSheet: React.FC<BottomSheetProps> = ({
  swipeToClose = true,
  swipeThreshold = 80,
  onClose,
  children,
  contentClassName = "",
  className = "",
  overlayClassName = "",
  ...props
}) => {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!swipeToClose || !start) return;

    const touch = event.changedTouches[0];
    const deltaY = touch.clientY - start.y;
    const deltaX = Math.abs(touch.clientX - start.x);
    const target = event.target;
    const scrollable =
      target instanceof Element
        ? target.closest<HTMLElement>("[data-bottom-sheet-scroll]")
        : null;

    if (
      deltaY >= swipeThreshold &&
      deltaY > deltaX &&
      (!scrollable || scrollable.scrollTop <= 0)
    ) {
      onClose();
    }
  };

  return (
    <Modal
      {...props}
      onClose={onClose}
      position="bottom"
      className={`!items-end !pb-0 ${className}`}
      contentClassName={`!mx-0 !mb-0 !max-w-none !rounded-b-none !rounded-t-3xl ${contentClassName}`}
      overlayClassName={`!z-[90] ${overlayClassName}`}
      zIndex={100}
      showCloseButton={false}
    >
      <div
        data-bottom-sheet-scroll
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="max-h-[85dvh] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-auto mb-4 mt-3 h-1.5 w-12 rounded-full bg-[var(--ui-text-muted)]/40" />
        {children}
      </div>
    </Modal>
  );
};
