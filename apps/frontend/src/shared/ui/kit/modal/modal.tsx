"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ModalProps } from "./types";
import {
  ModalOverlay,
  ModalContainer,
  ModalContent,
  ModalHeader,
} from "./components";

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  variant = "dark",
  size = "md",
  position = "center",
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = "",
  overlayClassName = "",
  contentClassName = "",
  withAnimation = true,
  blurBackground = false,
  zIndex = 50,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>("light");

  useEffect(() => {
    const getCurrentTheme = () => {
      const htmlTheme = document.documentElement.getAttribute("data-theme");
      const bodyClass = document.body.className;

      if (htmlTheme) return htmlTheme;
      if (bodyClass.includes("dark")) return "dark";
      if (bodyClass.includes("light")) return "light";

      return "light";
    };

    setCurrentTheme(getCurrentTheme());

    const observer = new MutationObserver(() => {
      setCurrentTheme(getCurrentTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === "Escape" && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isVisible, closeOnEsc, onClose]);

  if (!shouldRender) return null;

  const content = (
    <>
      <ModalOverlay
        variant={variant}
        isVisible={withAnimation ? isVisible : true}
        onClose={onClose}
        closeOnOverlayClick={closeOnOverlayClick}
        className={overlayClassName}
        blurBackground={blurBackground}
        zIndex={90}
      />
      <ModalContainer
        position={position}
        isVisible={withAnimation ? isVisible : true}
        className={className}
        zIndex={zIndex}
      >
        <ModalContent
          size={size}
          variant={variant}
          className={contentClassName}
        >
          <ModalHeader
            title={title}
            showCloseButton={showCloseButton}
            onClose={onClose}
            variant={variant}
          />
          {children}
        </ModalContent>
      </ModalContainer>
    </>
  );

  if (typeof document !== "undefined") {
    let modalContainer = document.getElementById("modal-root");
    if (!modalContainer) {
      modalContainer = document.createElement("div");
      modalContainer.id = "modal-root";
      document.body.appendChild(modalContainer);
    }

    modalContainer.setAttribute("data-theme", currentTheme);
    return createPortal(content, modalContainer);
  }

  return content;
};
