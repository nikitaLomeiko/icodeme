import { FiSearch, FiX } from "react-icons/fi";

interface IProps {
    searchQuery: string,
    currentMatch: number,
    matchCounted: number
    searchRef:  React.RefObject<HTMLInputElement | null>
    setCurrentMatch: (value: number) => void
    setSearchQuery: (value: string) => void
    onToggleSearch: () => void
}

export const EditorSearch: React.FC<IProps> = (props) => {
    const {currentMatch, matchCounted, searchQuery, searchRef, setCurrentMatch, setSearchQuery, onToggleSearch} = props

    const handleKeyDown = (e: any) => {
         if (e.key === 'Enter') {
             e.preventDefault();
            if (e.shiftKey) {
                setCurrentMatch((currentMatch - 1 + matchCounted) % matchCounted || 0);
            } else {
                setCurrentMatch((currentMatch + 1) % matchCounted || 0);
            }
        }

        if (e.key === 'Escape') {
            onToggleSearch?.();
        }
    }
    
    return(
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--ui-background)] border-b border-[var(--ui-border)] shrink-0">
            <FiSearch className="w-3 h-3 text-[var(--ui-text-muted)]" />
            <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentMatch(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                className="flex-1 text-xs bg-transparent border-none outline-none text-[var(--ui-text)] placeholder-[var(--ui-text-muted)]"
                autoFocus
            />
            <span className="text-[11px] text-[var(--ui-text-muted)] select-none whitespace-nowrap">
                {searchQuery ? `${currentMatch + 1}/${matchCounted}` : ''}
            </span>
            <button
                onClick={onToggleSearch}
                className="rounded hover:bg-[var(--ui-text)]/5 text-[var(--ui-text-muted)] hover:text-[var(--ui-primary)] transition-all p-0.5"
            >
                <FiX className="w-3 h-3" />
            </button>
        </div>
    )
}