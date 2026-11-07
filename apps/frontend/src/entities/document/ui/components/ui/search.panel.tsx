import {
  documentOptionStore,
  documentSearchStore,
} from "@/entities/document/model";
import { TextField } from "@/shared/ui/kit";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect } from "react";
import { FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";

export const SearchPanel = observer(() => {
  const { contentRef, setSearchResultsRef, searchResultsRef } =
    documentOptionStore;

  const {
    setTotalResults,
    setCurrentResultIndex,
    searchQuery,
    setSearchQuery,
    totalResults,
    toggleShowSearch,
    currentResultIndex,
  } = documentSearchStore;

  useEffect(() => {
    if (!contentRef.current) return;

    const marks = contentRef.current.querySelectorAll("mark");
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(
          document.createTextNode(mark.textContent || ""),
          mark,
        );
        parent.normalize();
      }
    });

    if (!searchQuery.trim()) {
      setTotalResults(0);
      setCurrentResultIndex(-1);
      searchResultsRef.current = [];
      return;
    }

    const searchTerm = searchQuery.toLowerCase();
    const walker = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (node.parentElement?.closest("mark, script, style")) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    const textNodes: Node[] = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    const results: HTMLElement[] = [];

    textNodes.forEach((node) => {
      const text = node.textContent || "";
      const lowerText = text.toLowerCase();

      if (lowerText.includes(searchTerm)) {
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        while (true) {
          const index = lowerText.indexOf(searchTerm, lastIndex);
          if (index === -1) break;

          if (index > lastIndex) {
            fragment.appendChild(
              document.createTextNode(text.substring(lastIndex, index)),
            );
          }

          const mark = document.createElement("mark");
          mark.textContent = text.substring(index, index + searchTerm.length);
          mark.style.backgroundColor = "#f59e0b";
          mark.style.color = "#000";
          mark.style.borderRadius = "2px";
          mark.setAttribute("data-result-index", String(results.length));
          fragment.appendChild(mark);

          results.push(mark);

          lastIndex = index + searchTerm.length;
        }

        if (lastIndex < text.length) {
          fragment.appendChild(
            document.createTextNode(text.substring(lastIndex)),
          );
        }

        node.parentNode?.replaceChild(fragment, node);
      }
    });

    searchResultsRef.current = results;
    setTotalResults(results.length);

    if (results.length > 0) {
      setCurrentResultIndex(0);
      scrollToResult(0);
    } else {
      setCurrentResultIndex(-1);
    }
  }, [searchQuery]);

  const scrollToResult = useCallback((index: number) => {
    const results = searchResultsRef.current;

    if (!Array.isArray(results)) return;

    if (index < 0 || index >= results.length) return;

    results.forEach((result, i) => {
      if (i === index) {
        result.style.backgroundColor = "#fbbf24";
        result.style.color = "#000";
      } else {
        result.style.backgroundColor = "#f59e0b";
        result.style.color = "#000";
      }
    });

    const activeResult = results[index];
    if (activeResult) {
      activeResult.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  const goToNextResult = useCallback(() => {
    if (totalResults === 0) return;
    const nextIndex = (currentResultIndex + 1) % totalResults;
    setCurrentResultIndex(nextIndex);
    scrollToResult(nextIndex);
  }, [currentResultIndex, totalResults, scrollToResult]);

  const goToPrevResult = useCallback(() => {
    if (totalResults === 0) return;
    const prevIndex =
      currentResultIndex === 0 ? totalResults - 1 : currentResultIndex - 1;
    setCurrentResultIndex(prevIndex);
    scrollToResult(prevIndex);
  }, [currentResultIndex, totalResults, scrollToResult]);

  return (
    <div className="fixed top-0 left-0 right-0 z-90 bg-[var(--ui-background-tertiary)] border-[var(--ui-border)] border-gray-700 shadow-lg p-4">
      <div className="max-w-4xl mx-auto flex gap-3">
        <TextField
          id="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по документу..."
          fullWidth
          autoFocus
        />

        {searchQuery.trim() && totalResults > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--ui-background-tertiary)]/20 rounded-lg">
            <span className="text-sm text-[var(--ui-text)] whitespace-nowrap">
              {currentResultIndex + 1} / {totalResults}
            </span>
            <button
              onClick={goToPrevResult}
              className="p-1 rounded hover:bg-[var(--ui-background-tertiary)]/40 transition-colors cursor-pointer"
            >
              <FiChevronUp className="w-4 h-4 text-[var(--ui-text)]/40" />
            </button>
            <button
              onClick={goToNextResult}
              className="p-1 rounded hover:bg-[var(--ui-background-tertiary)]/40 transition-colors cursor-pointer"
            >
              <FiChevronDown className="w-4 h-4 text-[var(--ui-text)]/40" />
            </button>
          </div>
        )}

        {searchQuery.trim() && totalResults === 0 && (
          <div className="flex items-center px-3 py-1 bg-[var(--ui-background-tertiary)]/20 rounded-lg">
            <span className="text-sm text-[var(--ui-text)]/40">
              Ничего не найдено
            </span>
          </div>
        )}

        <button
          onClick={() => {
            setSearchQuery("");
            setTotalResults(0);
            setCurrentResultIndex(-1);
            toggleShowSearch();
            setSearchResultsRef({ current: [] });
          }}
          className="px-3 py-2 rounded-lg bg-[var(--ui-background-tertiary)]/60 text-[var(--ui-text)]/40 hover:bg-[var(--ui-background-tertiary)]/40 transition-colors cursor-pointer"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});
