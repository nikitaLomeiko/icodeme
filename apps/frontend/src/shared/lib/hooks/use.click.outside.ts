import { useEffect, useRef } from "react";

export const useClickOutside = <T extends HTMLElement>(
  handler: () => void,
  isOpen: boolean,
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handler, isOpen]);

  return ref;
};
