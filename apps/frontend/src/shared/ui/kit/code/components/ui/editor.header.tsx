interface IProps {
    fileName: string,
    lineCount: number
}

export const EditorHeader: React.FC<IProps> = (props) => {
    const {fileName, lineCount} = props
    
    return(
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--ui-background)] border-b border-[var(--ui-border)]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--ui-error)]/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--ui-warning)]/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--ui-success)]/70" />
          </div>
          <span className="text-xs text-[var(--ui-text-secondary)] ml-2 font-mono">
            {fileName}
          </span>
          <span className="text-[10px] text-[var(--ui-text-muted)] ml-auto opacity-50">
            {lineCount} lines
          </span>
        </div>
    )
}