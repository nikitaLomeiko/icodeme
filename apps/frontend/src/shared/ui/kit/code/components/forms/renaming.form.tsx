import { RefObject } from "react";

interface IProps {
    inputRef: RefObject<HTMLInputElement | null>
    value: string,
    setValue: (value: string) => void,
    onRename: () => void;
    setIsRenaming: (value: boolean) => void
}

export const RenamingForm: React.FC<IProps> = (props) => {
    const {inputRef, onRename, setIsRenaming, setValue, value} = props
    
    return(
        <input
            ref={inputRef}
            autoFocus
            className="flex-1 bg-[var(--ui-background-tertiary)] text-[var(--ui-text)] text-xs px-1.5 py-0.5 rounded border border-[var(--ui-primary)] outline-none"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onRename();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            onClick={(e) => e.stopPropagation()}
        />
    )
}