import { FiMoreVertical, FiSearch, FiStar, FiMenu } from "react-icons/fi";
import { DocumentStats } from "@/entities/document/model/types";
import { FavoritesMenu } from "./ui/favorite.menu";
import { OptionMenu } from "./ui/option.menu";
import { observer } from "mobx-react-lite";
import {
  documentFavoriteStore,
  documentOptionStore,
  documentSearchStore,
} from "@/entities/document/model";
import { Button } from "@/shared/ui/kit";
import { DocumentStatistics } from "@/entities/document/ui/components/ui/document.stats";
import { SearchPanel } from "./ui/search.panel";
import { useMemo, useState } from "react";
import { calculateDocumentStats } from "@/entities/document/model/utils";
import { useClickOutside } from "@/shared/lib";
import { Contents } from "@/entities/document/ui/components/contents";

export const HeaderAction: React.FC = observer(() => {
  const { isOpenOptionMenu, toggleOptionMenu, isZenMode, content } =
    documentOptionStore;

  const { isShowFavorites, toggleShowFavorites, lineFavorites } =
    documentFavoriteStore;

  const { toggleShowSearch, isShowSearch } = documentSearchStore;

  const [isMobileContentsOpen, setIsMobileContentsOpen] = useState(false);

  const documentStats = useMemo<DocumentStats>(
    () => calculateDocumentStats(content),
    [content],
  );

  const favoritesRef = useClickOutside<HTMLDivElement>(
    () => toggleShowFavorites(),
    isShowFavorites,
  );

  const optionMenuRef = useClickOutside<HTMLDivElement>(
    () => toggleOptionMenu(),
    isOpenOptionMenu,
  );

  return (
    <>
      <div className="flex items-center gap-1 flex-wrap mt-3">
        <DocumentStatistics documentStats={documentStats} />

        <Button
          icon={FiMenu}
          variant="ghost"
          iconPosition="left"
          onClick={() => setIsMobileContentsOpen(true)}
          className="xl:hidden !px-3"
        />

        <Button
          icon={FiSearch}
          variant="ghost"
          iconPosition="left"
          onClick={toggleShowSearch}
        ></Button>

        {isShowSearch && !isZenMode && <SearchPanel />}

        <div className="relative" ref={favoritesRef}>
          <Button
            onClick={toggleShowFavorites}
            icon={FiStar}
            iconPosition="left"
            className="relative !px-3"
            variant="ghost"
          >
            {lineFavorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-xs flex items-center justify-center bg-yellow-500 text-white rounded-full">
                {lineFavorites.length}
              </span>
            )}
          </Button>
          {isShowFavorites && <FavoritesMenu />}
        </div>

        <div className="relative" ref={optionMenuRef}>
          <Button
            icon={FiMoreVertical}
            iconPosition="left"
            variant="ghost"
            onClick={toggleOptionMenu}
            className="!px-3"
          ></Button>

          {isOpenOptionMenu && <OptionMenu />}
        </div>
      </div>

      <Contents
        isMobile={true}
        isOpen={isMobileContentsOpen}
        onClose={() => setIsMobileContentsOpen(false)}
      />
    </>
  );
});
