import { motion } from "framer-motion";

interface IProps {
  messageId: string;
  sender: "me" | "user";
  logoSrc: string;
  logoAlt?: string;
  text: string;
}

export const Message: React.FC<IProps> = (props) => {
  const { messageId, sender, logoSrc, logoAlt, text } = props;

  return (
    <motion.div
      key={messageId}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${sender === "me" ? "justify-end" : "justify-start"}`}
    >
      {sender === "user" && (
        <img
          src={logoSrc}
          alt={logoAlt}
          className="w-7 h-7 rounded-full mr-2 mt-1 shrink-0 self-end"
        />
      )}
      <div
        className={`max-w-[85%] rounded-xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-line ${
          sender === "user"
            ? "text-[var(--ui-text)] border border-[var(--ui-border)] rounded-bl-sm"
            : "bg-[var(--ui-primary)] text-white rounded-br-sm"
        }`}
      >
        {text}
      </div>
    </motion.div>
  );
};
