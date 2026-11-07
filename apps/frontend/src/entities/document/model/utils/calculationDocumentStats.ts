export const calculationDocumentStats = (content: string) => {
  let cleanText = content;

  cleanText = cleanText.replace(/```[\s\S]*?```/g, "");
  cleanText = cleanText.replace(/`([^`]+)`/g, "");
  cleanText = cleanText.replace(/!\[.*?\]\(.*?\)/g, "");
  cleanText = cleanText.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  cleanText = cleanText
    .replace(/(#{1,6})\s+/g, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/>\s+/g, "")
    .replace(/[-*+]\s+/g, "")
    .replace(/\d+\.\s+/g, "")
    .replace(/\|/g, " ")
    .replace(/-{3,}/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleanText.split(/\s+/).filter((word) => word.length > 0).length;

  const chars = cleanText.replace(/\s/g, "").length;
  const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
  const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
  const headings = (content.match(/^#{1,6}\s+.+$/gm) || []).length;
  const paragraphs = content
    .split(/\n\s*\n/)
    .filter(
      (p) =>
        p.trim().length > 0 &&
        !p.startsWith("#") &&
        !p.startsWith("```") &&
        !p.startsWith(">") &&
        !p.match(/^[-*+]\s/),
    ).length;

  console.log(words);
  const readingTime = Math.max(1, Math.ceil(words / 60));

  return {
    wordCount: words,
    charCount: chars,
    imageCount: images,
    codeBlockCount: codeBlocks,
    headingCount: headings,
    paragraphCount: paragraphs,
    readingTime,
  };
};
