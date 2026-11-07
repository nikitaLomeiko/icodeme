import { useCallback, useEffect } from "react";
import { documentFavoriteStore, documentOptionStore } from "../../model";
import { observer } from "mobx-react-lite";
import { LineFavorite } from "../../model/types";
import {
  useCreateNewFavoriteMutation,
  useDeleteFavoriteMutation,
} from "../../api";
import { useNotification } from "@/shared/ui/kit";
import { isApiError } from "@/shared/api";

interface IProps {
  children: React.ReactNode;
}

export const FavoriteWrapper: React.FC<IProps> = observer(({ children }) => {
  const { contentRef, documentId } = documentOptionStore;

  const { lineFavorites, setLineFavorites, removeLineFavoriteById } =
    documentFavoriteStore;

  const [create] = useCreateNewFavoriteMutation();
  const [deleted] = useDeleteFavoriteMutation();
  const notification = useNotification();

  const addLineToFavorites = useCallback(
    async (element: HTMLElement) => {
      const text = element.textContent?.trim() || "Элемент";

      const indicator = document.createElement("span");
      indicator.innerHTML = "⭐";
      indicator.style.cssText = `
          position: absolute;
          left: -24px;
          top: 40%;
          transform: translateY(-50%);
          font-size: 14px;
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
        `;
      element.style.position = "relative";
      element.appendChild(indicator);

      setTimeout(() => {
        indicator.style.opacity = "1";
        setTimeout(() => {
          indicator.style.opacity = "0";
          setTimeout(() => indicator.remove(), 500);
        }, 1500);
      }, 10);

      const newFavorite: LineFavorite = {
        id: Date.now().toString(),
        elementId: element.id,
        text: text.slice(0, 100) + (text.length > 100 ? "..." : ""),
        type: element.tagName.toLowerCase(),
        timestamp: Date.now(),
        scrollPosition: window.scrollY,
      };

      const result = await create({
        documentId: documentId,
        favorite: newFavorite,
      });

      if (result.error && isApiError(result.error)) {
        notification.error("Ошибка при попытки добавить в избранное");
        return;
      }

      setLineFavorites([...lineFavorites, newFavorite]);
    },
    [lineFavorites],
  );

  useEffect(() => {
    if (!contentRef.current) return;

    let currentButton: HTMLButtonElement | null = null;
    let currentElement: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const isInsideQuote = target.closest("blockquote");
      const isInsideTable = target.closest("table");

      let lineElement: HTMLElement | null = null;

      if (isInsideQuote) {
        lineElement = isInsideQuote;
      } else if (isInsideTable) {
        lineElement = isInsideTable;
      } else {
        lineElement = target.closest(
          "p, h1, h2, h3, h4, h5, h6, li, figcaption",
        );
      }

      if (lineElement && contentRef.current?.contains(lineElement)) {
        if (currentElement === lineElement) return;

        if (currentButton && currentButton.parentNode) {
          currentButton.remove();
        }
        currentElement = lineElement;

        const isAlreadyFavorite = lineFavorites.some(
          (f) => f.elementId === lineElement.id,
        );

        const button = document.createElement("button");
        currentButton = button;
        button.className = "favorite-line-btn";
        button.innerHTML = isAlreadyFavorite ? "⭐" : "☆";

        let rightOffset = "-10px";

        if (lineElement.tagName === "TABLE") {
          rightOffset = "8px";
        } else if (lineElement.tagName === "BLOCKQUOTE") {
          rightOffset = "16px";
        }

        button.style.cssText = `
              position: absolute;
              right: ${rightOffset};
              top: 15px;
              transform: translateY(-50%);
              opacity: 0;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: var(--ui-background-secondary);
              border: none;
              color: var(--ui-text);
              cursor: pointer;
              font-size: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.4s;
              z-index: 100;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              pointer-events: auto;
            `;

        setTimeout(() => {
          button.style.opacity = "1";
        }, 100);
        button.title = isAlreadyFavorite
          ? "Удалить из избранного"
          : "Добавить в избранное";

        button.addEventListener("mouseenter", () => {
          button.style.transform = "translateY(-50%) scale(1.1)";
        });

        button.addEventListener("mouseleave", () => {
          button.style.transform = "translateY(-50%) scale(1)";
        });

        button.addEventListener("click", async (e) => {
          e.stopPropagation();
          e.preventDefault();

          if (isAlreadyFavorite) {
            const fav = lineFavorites.find(
              (f) => f.elementId === lineElement.id,
            );
            if (fav) {
              const result = await deleted({
                documentId: documentId,
                favoriteId: fav.id,
              });

              if (result.error && isApiError(result.error)) {
                notification.error("Ошибка при попытки удалить из избранного");
                return;
              }

              removeLineFavoriteById(fav.id);
              button.innerHTML = "☆";
              button.title = "Добавить в избранное";
            }
          } else {
            addLineToFavorites(lineElement);
            button.innerHTML = "⭐";
            button.title = "Удалить из избранного";
          }
        });

        lineElement.style.position = "relative";
        lineElement.appendChild(button);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      const target = e.target as HTMLElement;

      const isInsideQuote = target.closest("blockquote");
      const isInsideTable = target.closest("table");

      let lineElement: HTMLElement | null = null;

      if (isInsideQuote) {
        lineElement = isInsideQuote;
      } else if (isInsideTable) {
        lineElement = isInsideTable;
      } else {
        lineElement = target.closest(
          "p, h1, h2, h3, h4, h5, h6, li, figcaption",
        );
      }

      if (
        lineElement &&
        currentButton &&
        currentButton.parentNode === lineElement
      ) {
        if (!relatedTarget || !lineElement.contains(relatedTarget)) {
          setTimeout(() => {
            if (currentButton && currentButton.parentNode === lineElement) {
              const isHovering = lineElement.matches(":hover");
              if (!isHovering) {
                currentButton.remove();
                currentButton = null;
                currentElement = null;
              }
            }
          }, 100);
        }
      }
    };

    const container = contentRef.current;
    container.addEventListener("mouseover", handleMouseOver);
    container.addEventListener("mouseout", handleMouseOut);

    return () => {
      container.removeEventListener("mouseover", handleMouseOver);
      container.removeEventListener("mouseout", handleMouseOut);
      if (currentButton && currentButton.parentNode) {
        currentButton.remove();
      }
    };
  }, [lineFavorites, addLineToFavorites, contentRef]);

  return children;
});
