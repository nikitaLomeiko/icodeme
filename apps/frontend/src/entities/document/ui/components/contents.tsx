import { documentOptionStore } from "@/entities/document/model";
import { Heading } from "../../model/types/document.types";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "@/shared/ui/kit";

interface ContentsProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Contents = ({
  isMobile = false,
  isOpen = true,
  onClose,
}: ContentsProps) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const headingsRef = useRef<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const activeIdRef = useRef<string>("");
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const { content, contentRef, isScrollingProgrammaticallyRef } =
    documentOptionStore;

  useEffect(() => {
    const extractHeadings = () => {
      if (!contentRef.current) return;

      const headingElements = contentRef.current.querySelectorAll(
        "h1, h2, h3, h4, h5, h6",
      );
      const newHeadings: Heading[] = [];

      headingElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        const text = htmlElement.textContent || "";

        if (!htmlElement.id) {
          htmlElement.id = `heading-${newHeadings.length}-${Date.now()}`;
        }

        newHeadings.push({
          id: htmlElement.id,
          text: text,
          level: parseInt(htmlElement.tagName[1]),
        });
      });

      setHeadings(newHeadings);
      headingsRef.current = newHeadings;
    };

    const timeout = setTimeout(extractHeadings, 150);
    return () => clearTimeout(timeout);
  }, [content]);

  const scrollToHeading = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        isScrollingProgrammaticallyRef.current = true;

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        setActiveId(id);
        activeIdRef.current = id;

        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingProgrammaticallyRef.current = false;

          const finalScrollPosition = window.scrollY + 150;
          let currentHeadingId = "";

          for (let i = headingsRef.current.length - 1; i >= 0; i--) {
            const heading = headingsRef.current[i];
            const el = document.getElementById(heading.id);
            if (el) {
              const offsetTop = el.getBoundingClientRect().top + window.scrollY;
              if (offsetTop <= finalScrollPosition) {
                currentHeadingId = heading.id;
                break;
              }
            }
          }

          if (currentHeadingId && currentHeadingId !== activeIdRef.current) {
            activeIdRef.current = currentHeadingId;
            setActiveId(currentHeadingId);
          }
        }, 1500);

        if (isMobile && onClose) {
          onClose();
        }
      } else {
        console.warn(`Элемент с ID "${id}" не найден для прокрутки`);
      }
    },
    [isMobile, onClose],
  );

  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      if (isScrollingProgrammaticallyRef.current) return;

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const scrollPosition = window.scrollY + 150;
        let currentHeadingId = "";

        for (let i = headingsRef.current.length - 1; i >= 0; i--) {
          const heading = headingsRef.current[i];
          const element = document.getElementById(heading.id);

          if (element) {
            const rect = element.getBoundingClientRect();
            const offsetTop = rect.top + window.scrollY;

            if (offsetTop <= scrollPosition) {
              currentHeadingId = heading.id;
              break;
            }
          }
        }

        if (currentHeadingId && currentHeadingId !== activeIdRef.current) {
          activeIdRef.current = currentHeadingId;
          setActiveId(currentHeadingId);
        }
      });
    };

    setTimeout(handleScroll, 200);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [headings.length]);

  useEffect(() => {
    headingsRef.current = headings;
  }, [headings]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (isMobile) {
    if (!isOpen) return null;

    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
        <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 z-50 shadow-xl animate-slide-in">
          <div className="p-4 border-b border-[var(--ui-border)] flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-200">Содержание</h3>
            <Button
              icon={FiX}
              variant="ghost"
              onClick={onClose}
              className="!p-1"
            />
          </div>
          <div className="p-4 h-[calc(100%-60px)] overflow-y-auto">
            <ul className="space-y-1">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <button
                    onClick={() => scrollToHeading(heading.id)}
                    className={`
                      w-full text-left px-2 py-1.5 text-sm rounded-md transition-all duration-200
                      ${
                        activeId === heading.id
                          ? "bg-blue-600/20 text-blue-400 font-medium"
                          : "text-gray-400 hover:text-gray-200 hover:bg-[var(--ui-background-tertiary)]/10 cursor-pointer"
                      }
                    `}
                    style={{ paddingLeft: `${heading.level * 12}px` }}
                  >
                    <span className="line-clamp-2">{heading.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="hidden xl:block w-72 flex-shrink-0 border-l border-[var(--ui-border)] pl-2">
      <div className="sticky top-20">
        <h3 className="text-sm font-semibold text-[var(--ui-text)] mb-3 px-2">
          Содержание
        </h3>
        <ul className="space-y-1 max-h-[calc(100vh-150px)] overflow-y-auto">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`
                    w-full text-left px-2 py-1.5 text-sm rounded-md transition-all duration-200
                    ${
                      activeId === heading.id
                        ? "bg-blue-600/20 text-blue-400 font-medium"
                        : "text-[var(--ui-text)]/70 hover:text-[var(--ui-text)] hover:bg-[var(--ui-background-tertiary)]/10 cursor-pointer"
                    }
                  `}
                style={{ paddingLeft: `${heading.level * 12}px` }}
              >
                <span className="line-clamp-2">{heading.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
