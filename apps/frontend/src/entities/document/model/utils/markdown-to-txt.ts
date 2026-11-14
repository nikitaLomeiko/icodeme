export const downloadMarkdownAsTxt = (content: string, title: string) => {
  let plainText = content;

  plainText = plainText.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (match, lang, code) => {
      return `\n[${lang || "code"}]\n${code.trim()}\n[/${lang || "code"}]\n`;
    },
  );

  plainText = plainText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 [$2]");
  plainText = plainText.replace(/!\[(.*?)\]\([^)]+\)/g, "[Изображение: $1]");

  plainText = plainText
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "• ")
    .replace(/^\d+\.\s+/gm, "");

  const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `${title.replace(/[^\w\sа-яё]/gi, "_")}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
