interface IProps {
  logoSrc: string;
  logoAlt?: string;
  username: string;
}

export const ChatHeader: React.FC<IProps> = (props) => {
  const { logoSrc, username, logoAlt } = props;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--ui-border)]">
      <img
        src={logoSrc}
        alt={logoAlt}
        className="w-9 h-9 rounded-full shrink-0"
      />
      <span className="text-lg font-semibold text-[var(--ui-text)]">
        {username}
      </span>
    </div>
  );
};
