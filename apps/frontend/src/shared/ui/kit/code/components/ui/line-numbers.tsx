interface IProps {
    scrollTop: number,
    lineCount: number,
    activeLine: number
}

export const LineNumbers: React.FC<IProps> = (props) => {
    const {activeLine, lineCount,scrollTop} = props
    
    return(
        <div
            className="select-none text-right overflow-hidden shrink-0 border-r border-[var(--ui-border)]"
            style={{ width: 52, minWidth: 52, padding: '0px 0' }}
          >
            <div style={{ transform: `translateY(-${scrollTop}px)` }}>
              {Array.from({ length: lineCount }, (_, i) => (
                <div
                  key={i}
                  className={`px-1 ${
                    i === activeLine
                      ? 'text-[var(--ui-primary)] font-semibold'
                      : 'text-[var(--ui-text-muted)]/40'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
        </div>
    )
}