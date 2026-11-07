import { motion } from "framer-motion";

interface IProps {
  logoSrc: string;
  logoAlt?: string;
}

export const TypingEffect: React.FC<IProps> = (props) => {
  const { logoAlt, logoSrc } = props;
  return (
    <div className="flex justify-start">
      <img
        src={logoSrc}
        alt={logoAlt}
        className="w-7 h-7 rounded-full mr-2 shrink-0"
      />
      <div className="rounded-xl rounded-bl-sm bg-[var(--ui-background)] border border-[var(--ui-border)] px-3.5 py-2.5 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[var(--ui-text-muted)]"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
};
