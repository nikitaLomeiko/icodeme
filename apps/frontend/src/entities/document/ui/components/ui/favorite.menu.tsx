import {
  documentFavoriteStore,
  documentOptionStore,
} from "@/entities/document/model";
import { LineFavorite } from "../../../model/types";
import { FiX } from "react-icons/fi";
import { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useDeleteFavoriteMutation } from "@/entities/document/api";
import { isApiError } from "@/shared/api";
import { useNotification } from "@/shared/ui/kit";

export const FavoritesMenu = observer(() => {
  const { isScrollingProgrammaticallyRef, documentId } = documentOptionStore;

  const { lineFavorites, toggleShowFavorites, removeLineFavoriteById } =
    documentFavoriteStore;

  const [deleted] = useDeleteFavoriteMutation();
  const notification = useNotification();

  const handleRemoveLineFavorite = async (id: string) => {
    const result = await deleted({ documentId, favoriteId: id });

    if (result.error && isApiError(result.error)) {
      notification.error("Ошибка при попытки добавить в избранное");
      return;
    }

    removeLineFavoriteById(id);
  };

  const goToFavorite = useCallback(async (favorite: LineFavorite) => {
    const element = document.getElementById(favorite.elementId);
    if (element) {
      isScrollingProgrammaticallyRef.current = true;

      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      element.style.transition = "background-color 0.3s";
      element.style.backgroundColor = "rgba(59, 130, 246, 0.3)";
      setTimeout(() => {
        element.style.backgroundColor = "";
      }, 1500);

      setTimeout(() => {
        isScrollingProgrammaticallyRef.current = false;
      }, 800);

      toggleShowFavorites;
    } else {
      alert("Элемент не найден");
      removeLineFavoriteById(favorite.id);
    }
  }, []);

  return (
    <div className="absolute right-0 mt-2 w-80 bg-[var(--ui-background-secondary)] rounded-lg shadow-xl border border-[var(--ui-border)] overflow-hidden z-50">
      <div className="p-3 border-b border-[var(--ui-border)]">
        <h3 className="text-sm font-semibold text-[var(--ui-text)]">
          Избранное ({lineFavorites.length})
        </h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {lineFavorites.length === 0 ? (
          <div className="p-4 text-center text-[var(--ui-text)]/50 text-sm">
            Нет избранных строк
            <br />
            <span className="text-xs">
              Наведите на любую строку и нажмите ☆
            </span>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {lineFavorites.map((favorite) => (
              <div
                key={favorite.id}
                className="p-3 hover:bg-[var(--ui-background-tertiary)]/20 transition-colors group relative cursor-pointer"
              >
                <button
                  onClick={() => goToFavorite(favorite)}
                  className="w-full text-left pr-6"
                >
                  <div className="text-xs text-[var(--ui-text)]/40 mb-1">
                    {favorite.type}
                  </div>
                  <div className="text-sm text-[var(--ui-text)] line-clamp-2 mb-1">
                    {favorite.text}
                  </div>
                  <div className="text-xs text-[var(--ui-text)]/30">
                    {new Date(favorite.timestamp).toLocaleString()}
                  </div>
                </button>
                <button
                  onClick={() => handleRemoveLineFavorite(favorite.id)}
                  className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--ui-background-tertiary)]/30 rounded cursor-pointer"
                >
                  <FiX className="w-3 h-3 text-[var(--ui-text)]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
