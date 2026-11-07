// utils/markdownToPdf.ts

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

(pdfMake as any).vfs = pdfFonts.vfs;

// ================================
// TYPES
// ================================

type Content = string | any;

interface ListItem {
  level: number;
  text: string;
  type: "bullet" | "numbered";
  number?: number;
  children?: Content[];
  indentLevel?: number;
  isCheckbox?: boolean;
  isChecked?: boolean;
}

interface TextFragment {
  text: string;
  bold?: boolean;
  italics?: boolean;
  decoration?: string;
  color?: string;
  fillColor?: string;
  fontSize?: number;
  link?: string;
}

interface QuoteLine {
  level: number;
  content: Content[];
  indentLevel: number;
}

// ================================
// HELPERS
// ================================

const createHorizontalLine = () => ({
  canvas: [
    {
      type: "line",
      x1: 0,
      y1: 5,
      x2: 515,
      y2: 5,
      lineWidth: 1,
      lineColor: "#cbd5e1",
    },
  ],
  margin: [0, 14, 0, 14],
});

// Функция для определения уровня отступа
const getIndentLevel = (line: string): number => {
  const match = line.match(/^[\s\t]*/);
  if (!match) return 0;

  const indentStr = match[0];
  let level = 0;

  for (let i = 0; i < indentStr.length; i++) {
    if (indentStr[i] === "\t") {
      level += 2;
    } else if (indentStr[i] === " ") {
      level += 0.5;
    }
  }

  return Math.floor(level);
};

// ================================
// ADVANCED INLINE PARSER
// ================================

const parseInlineFormatting = (text: string): TextFragment[] => {
  const fragments: TextFragment[] = [];

  const regex =
    /(\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\))|(\*\*\*(.*?)\*\*\*)|(\*\*(.*?)\*\*)|(\*(.*?)\*)|(~~(.*?)~~)|(`([^`]+)`)/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      fragments.push({
        text: text.slice(lastIndex, match.index),
      });
    }

    if (match[2]) {
      fragments.push({
        text: match[2],
        link: match[3],
        color: "#2563eb",
        decoration: "underline",
      });
    } else if (match[6]) {
      fragments.push({
        text: match[6],
        bold: true,
        italics: true,
      });
    } else if (match[8]) {
      fragments.push({
        text: match[8],
        bold: true,
      });
    } else if (match[10]) {
      fragments.push({
        text: match[10],
        italics: true,
      });
    } else if (match[12]) {
      fragments.push({
        text: match[12],
        decoration: "lineThrough",
        color: "#777777",
      });
    } else if (match[14]) {
      fragments.push({
        text: match[14],
        fillColor: "#e2e8f0",
        color: "#111827",
        fontSize: 10,
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    fragments.push({
      text: text.slice(lastIndex),
    });
  }

  return fragments;
};

// ================================
// PARSER FOR QUOTE CONTENT
// ================================

const parseQuoteContent = (
  content: string,
  baseIndentLevel: number = 0,
): Content[] => {
  const lines = content.split("\n");
  const result: Content[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trimStart();

    // Заголовки
    if (trimmedLine.startsWith("# ")) {
      const headingText = trimmedLine.replace(/^# /, "");
      const formattedHeading = parseInlineFormatting(headingText);
      result.push({
        text: formattedHeading,
        style: "h1",
        margin: [baseIndentLevel * 10, 10, 0, 5],
      });
      i++;
      continue;
    }

    if (trimmedLine.startsWith("## ")) {
      const headingText = trimmedLine.replace(/^## /, "");
      const formattedHeading = parseInlineFormatting(headingText);
      result.push({
        text: formattedHeading,
        style: "h2",
        margin: [baseIndentLevel * 10, 10, 0, 5],
      });
      i++;
      continue;
    }

    if (trimmedLine.startsWith("### ")) {
      const headingText = trimmedLine.replace(/^### /, "");
      const formattedHeading = parseInlineFormatting(headingText);
      result.push({
        text: formattedHeading,
        style: "h3",
        margin: [baseIndentLevel * 10, 8, 0, 4],
      });
      i++;
      continue;
    }

    // Горизонтальная линия
    if (trimmedLine === "---" || trimmedLine === "***") {
      result.push(createHorizontalLine());
      i++;
      continue;
    }

    // Списки внутри цитаты
    const bulletMatch = trimmedLine.match(/^([-*+])\s+(.*)$/);
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);
    const checkboxMatch = trimmedLine.match(/^(-|\*)\s+\[([ xX])\]\s+(.*)$/);

    if (checkboxMatch) {
      const isChecked = checkboxMatch[2].toLowerCase() === "x";
      const text = checkboxMatch[3];
      const checkbox = isChecked ? "☑" : "☐";
      const formattedText = parseInlineFormatting(text);

      // Создаем фрагменты для чекбокса и текста
      const checkboxFragment: TextFragment[] = [
        { text: `${checkbox} ` },
        ...formattedText,
      ];

      result.push({
        text: checkboxFragment,
        margin: [baseIndentLevel * 10 + 10, 2, 0, 2],
        fontSize: 11,
      });
      i++;
      continue;
    }

    if (bulletMatch) {
      const text = bulletMatch[2];
      const formattedText = parseInlineFormatting(text);

      // Создаем фрагменты для маркера и текста
      const bulletFragment: TextFragment[] = [{ text: "• " }, ...formattedText];

      result.push({
        text: bulletFragment,
        margin: [baseIndentLevel * 10 + 10, 2, 0, 2],
        fontSize: 11,
      });
      i++;
      continue;
    }

    if (numberedMatch) {
      const number = numberedMatch[1];
      const text = numberedMatch[2];
      const formattedText = parseInlineFormatting(text);

      // Создаем фрагменты для номера и текста
      const numberFragment: TextFragment[] = [
        { text: `${number}. ` },
        ...formattedText,
      ];

      result.push({
        text: numberFragment,
        margin: [baseIndentLevel * 10 + 10, 2, 0, 2],
        fontSize: 11,
      });
      i++;
      continue;
    }

    // Блоки кода внутри цитаты
    if (trimmedLine.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Пропускаем закрывающий ```

      result.push({
        text: codeLines.join("\n"),
        style: "code",
        margin: [baseIndentLevel * 10 + 10, 8, 10, 8],
      });
      continue;
    }

    // Ссылки и изображения внутри цитаты
    const imageMatch = trimmedLine.match(
      /^!\[(.*?)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)$/,
    );
    if (imageMatch) {
      const alt = imageMatch[1];
      const url = imageMatch[2];
      const title = imageMatch[3];
      result.push({
        stack: [
          {
            text: `🖼 ${alt || "Изображение"}`,
            bold: true,
            margin: [baseIndentLevel * 10, 5, 0, 2],
          },
          {
            text: url,
            link: url,
            color: "#2563eb",
            decoration: "underline",
            margin: [baseIndentLevel * 10, 0, 0, 0],
          },
          ...(title
            ? [
                {
                  text: title,
                  italics: true,
                  color: "#64748b",
                  fontSize: 10,
                  margin: [baseIndentLevel * 10, 2, 0, 0],
                },
              ]
            : []),
        ],
        margin: [0, 5],
      });
      i++;
      continue;
    }

    // Обычный текст с форматированием
    if (trimmedLine) {
      const formattedText = parseInlineFormatting(trimmedLine);
      result.push({
        text: formattedText,
        style: "paragraph",
        margin: [baseIndentLevel * 10, 2, 0, 2],
      });
    } else {
      result.push({
        text: " ",
        margin: [0, 2],
      });
    }

    i++;
  }

  return result;
};

// ================================
// QUOTE PROCESSING
// ================================

const processQuoteBlock = (quoteLines: QuoteLine[]): any => {
  if (quoteLines.length === 0) return null;

  const baseLevel = quoteLines[0].level;
  const processedContent: any[] = [];

  for (const quoteLine of quoteLines) {
    const relativeLevel = quoteLine.level - baseLevel;
    const baseIndent = quoteLine.indentLevel * 10;
    const indent = relativeLevel * 20 + baseIndent;

    // Парсим содержимое цитаты рекурсивно
    const quoteContent = quoteLine.content;

    if (relativeLevel > 0) {
      // Для вложенных цитат оборачиваем в дополнительный блок с отступом
      processedContent.push({
        stack: quoteContent,
        margin: [indent + 12, 4, 10, 4],
        italics: true,
        color: "#475569",
      });
    } else {
      processedContent.push({
        stack: quoteContent,
        margin: [indent + 12, 4, 10, 4],
      });
    }
  }

  const colors = ["#94a3b8", "#64748b", "#334155", "#0f172a"];
  const bgColors = ["#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1"];
  const colorIndex = Math.min(baseLevel - 1, colors.length - 1);

  const firstIndent = quoteLines[0].indentLevel * 10;

  return {
    table: {
      widths: [4, "*"],
      body: [
        [
          {
            text: "",
            fillColor: colors[colorIndex],
            border: [false, false, false, false],
          },
          {
            stack: processedContent,
            fillColor: bgColors[colorIndex],
            border: [false, false, false, false],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 4,
      paddingBottom: () => 4,
    },
    margin: [baseLevel * 10 + firstIndent, 6, 0, 6],
  };
};

// ================================
// CODE BLOCK PROCESSING
// ================================

const processCodeBlock = (
  codeLines: string[],
  indentLevel: number = 0,
): any => {
  const indent = indentLevel * 10;
  return {
    text: codeLines.join("\n"),
    style: "code",
    margin: [indent + 10, 10, 10, 10],
  };
};

// ================================
// LIST PROCESSING
// ================================

const processListItems = (items: ListItem[]): any[] => {
  const result: any[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const baseIndent = (item.indentLevel || 0) * 10;
    const marginLeft = 10 + (item.level - 1) * 20 + baseIndent;

    let bulletSymbol = "";
    if (item.isCheckbox) {
      bulletSymbol = item.isChecked ? "☑" : "☐";
    } else if (item.type === "bullet") {
      const bulletSymbols = ["•", "◦", "▪", "▫", "➢", "➣"];
      bulletSymbol =
        bulletSymbols[Math.min(item.level - 1, bulletSymbols.length - 1)];
    } else if (item.type === "numbered") {
      bulletSymbol = `${item.number}.`;
    }

    const spaces = "  ".repeat(item.level - 1);
    const displayText = item.isCheckbox
      ? `${bulletSymbol} ${item.text}`
      : `${spaces}${bulletSymbol} ${item.text}`;
    const formattedFragments = parseInlineFormatting(displayText);

    result.push({
      text: formattedFragments,
      margin: [marginLeft, 2, 0, 2],
      fontSize: 11,
    });

    if (item.children && item.children.length > 0) {
      result.push(...item.children);
    }
  }

  return result;
};

// ================================
// MARKDOWN -> PDFMAKE
// ================================

const markdownToPdfContent = (markdown: string): Content[] => {
  const lines = markdown.split("\n");
  const content: Content[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeBlockIndent: number = 0;

  let listItems: ListItem[] = [];
  let inList = false;

  let quoteLines: QuoteLine[] = [];
  let inQuote = false;
  let quoteBuffer: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      content.push(...processListItems(listItems));
      listItems = [];
      inList = false;
    }
  };

  const flushQuote = () => {
    if (quoteBuffer.length > 0) {
      const quoteContent = parseQuoteContent(
        quoteBuffer.join("\n"),
        quoteLines[0]?.indentLevel || 0,
      );
      quoteLines.push({
        level: quoteLines[0]?.level || 1,
        content: quoteContent,
        indentLevel: quoteLines[0]?.indentLevel || 0,
      });

      const quoteBlock = processQuoteBlock(quoteLines);
      if (quoteBlock) {
        if (inList && listItems.length > 0) {
          if (!listItems[listItems.length - 1].children) {
            listItems[listItems.length - 1].children = [];
          }
          listItems[listItems.length - 1].children!.push(quoteBlock);
        } else {
          content.push(quoteBlock);
        }
      }
      quoteBuffer = [];
      quoteLines = [];
      inQuote = false;
    }
  };

  const flushCodeBlock = () => {
    if (codeBuffer.length > 0) {
      const codeBlock = processCodeBlock(codeBuffer, codeBlockIndent);
      if (inList && listItems.length > 0) {
        if (!listItems[listItems.length - 1].children) {
          listItems[listItems.length - 1].children = [];
        }
        listItems[listItems.length - 1].children!.push(codeBlock);
      } else {
        content.push(codeBlock);
      }
      codeBuffer = [];
      codeBlockIndent = 0;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    const indentLevel = getIndentLevel(originalLine);
    const trimmedLine = originalLine.trimStart();

    // ================================
    // CODE BLOCK START/END
    // ================================

    if (trimmedLine.startsWith("```")) {
      if (!inCodeBlock) {
        flushList();
        flushQuote();
        inCodeBlock = true;
        codeBuffer = [];
        codeBlockIndent = indentLevel;
      } else {
        inCodeBlock = false;
        flushCodeBlock();
      }
      continue;
    }

    // ================================
    // INSIDE CODE BLOCK
    // ================================

    if (inCodeBlock) {
      codeBuffer.push(originalLine);
      continue;
    }

    // ================================
    // QUOTES - собираем содержимое
    // ================================

    const quoteMatch = trimmedLine.match(/^(>+)\s?(.*)$/);

    if (quoteMatch && !inCodeBlock) {
      flushList();

      const quoteLevel = quoteMatch[1].length;
      const quoteText = quoteMatch[2];

      if (!inQuote) {
        inQuote = true;
        quoteBuffer = [quoteText];
        quoteLines = [{ level: quoteLevel, content: [], indentLevel }];
      } else {
        const lastQuoteLevel = quoteLines[quoteLines.length - 1].level;

        if (quoteLevel !== lastQuoteLevel) {
          // Завершаем текущую цитату и начинаем новую
          flushQuote();
          inQuote = true;
          quoteBuffer = [quoteText];
          quoteLines = [{ level: quoteLevel, content: [], indentLevel }];
        } else {
          quoteBuffer.push(quoteText);
        }
      }
      continue;
    } else if (inQuote) {
      // Завершаем цитату при пустой строке или не цитате
      flushQuote();
    }

    // ================================
    // EMPTY LINE
    // ================================

    if (!trimmedLine) {
      flushList();
      content.push({
        text: " ",
        margin: [0, 4],
      });
      continue;
    }

    // ================================
    // HORIZONTAL RULE
    // ================================

    if (trimmedLine === "---" || trimmedLine === "***") {
      flushList();
      flushQuote();
      content.push(createHorizontalLine());
      continue;
    }

    // ================================
    // TABLES - исправленная версия
    // ================================

    const nextLine = lines[i + 1];
    const trimmedNextLine = nextLine ? nextLine.trimStart() : "";

    if (
      trimmedLine.includes("|") &&
      trimmedNextLine &&
      /^\|?[\s\-:|]+\|?$/.test(trimmedNextLine)
    ) {
      flushList();
      flushQuote();

      const tableRows: string[][] = [];
      let tableIndex = i;

      while (tableIndex < lines.length) {
        const currentTrimmed = lines[tableIndex].trimStart();
        if (!currentTrimmed.includes("|")) break;

        if (/^\|?[\s\-:|]+\|?$/.test(currentTrimmed)) {
          tableIndex++;
          continue;
        }

        const row = currentTrimmed
          .split("|")
          .map((cell) => cell.trim())
          .filter(Boolean);

        if (row.length > 0) {
          tableRows.push(row);
        }
        tableIndex++;
      }

      if (tableRows.length > 0) {
        // Всегда парсим форматирование для каждой ячейки
        const parsedBody = tableRows.map((row) =>
          row.map((cell) => {
            const fragments = parseInlineFormatting(cell);
            // Всегда возвращаем объект с форматированием, даже если это простой текст
            return { text: fragments };
          }),
        );

        content.push({
          table: {
            headerRows: 1,
            widths: Array(tableRows[0].length).fill("*"),
            body: parsedBody,
          },
          layout: {
            fillColor: (rowIndex: number) => {
              if (rowIndex === 0) return "#e2e8f0";
              return rowIndex % 2 === 0 ? "#f8fafc" : undefined;
            },
            hLineColor: () => "#cbd5e1",
            vLineColor: () => "#cbd5e1",
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 6,
            paddingBottom: () => 6,
          },
          margin: [indentLevel * 10, 10, 0, 10],
        });
      }

      i = tableIndex - 1;
      continue;
    }
    // ================================
    // HEADINGS
    // ================================

    const headingMatch = trimmedLine.match(/^(#{1,4})\s+(.*)$/);

    if (headingMatch && !inCodeBlock) {
      flushList();
      flushQuote();

      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      const formattedHeading = parseInlineFormatting(headingText);

      const headingStyle = `h${level}` as const;
      content.push({
        text: formattedHeading,
        style: headingStyle,
        margin: [indentLevel * 10, 20, 0, 10],
      });
      continue;
    }

    // ================================
    // CHECKBOXES (GFM)
    // ================================

    const checkboxMatch = trimmedLine.match(/^(-|\*)\s+\[([ xX])\]\s+(.*)$/);

    if (checkboxMatch && !inCodeBlock) {
      flushQuote();

      const isChecked = checkboxMatch[2].toLowerCase() === "x";
      const text = checkboxMatch[3];

      listItems.push({
        level: indentLevel + 1,
        text,
        type: "bullet",
        indentLevel,
        isCheckbox: true,
        isChecked,
      });
      inList = true;
      continue;
    }

    // ================================
    // LISTS
    // ================================

    const bulletMatch = trimmedLine.match(/^([-*+])\s+(.*)$/);
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);

    if ((bulletMatch || numberedMatch) && !inCodeBlock && !checkboxMatch) {
      flushQuote();

      let level = indentLevel + 1;
      let text = "";
      let type: "bullet" | "numbered" = "bullet";
      let number: number | undefined = undefined;

      if (bulletMatch) {
        text = bulletMatch[2];
        type = "bullet";
      } else if (numberedMatch) {
        text = numberedMatch[2];
        type = "numbered";
        number = parseInt(numberedMatch[1], 10);
      }

      if (inList && listItems.length > 0) {
        const lastLevel = listItems[listItems.length - 1].level;
        if (level <= lastLevel) {
          flushList();
        }
      }

      listItems.push({ level, text, type, number, indentLevel });
      inList = true;
      continue;
    }

    // Если мы в списке, но строка не является элементом списка
    if (
      inList &&
      !bulletMatch &&
      !numberedMatch &&
      !checkboxMatch &&
      trimmedLine &&
      !inCodeBlock
    ) {
      const formattedFragments = parseInlineFormatting(trimmedLine);
      const paragraph = {
        text: formattedFragments,
        style: "paragraph",
        margin: [indentLevel * 10 + 20, 4, 10, 4],
      };

      if (listItems.length > 0) {
        if (!listItems[listItems.length - 1].children) {
          listItems[listItems.length - 1].children = [];
        }
        listItems[listItems.length - 1].children!.push(paragraph);
      }
      continue;
    }

    if (inList && !bulletMatch && !numberedMatch) {
      flushList();
    }

    // ================================
    // IMAGE
    // ================================

    flushList();
    flushQuote();

    const imageMatch = trimmedLine.match(
      /^!\[(.*?)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)$/,
    );

    if (imageMatch) {
      const alt = imageMatch[1];
      const url = imageMatch[2];
      const title = imageMatch[3];

      content.push({
        stack: [
          {
            text: `🖼 ${alt || "Изображение"}`,
            bold: true,
            margin: [indentLevel * 10, 10, 0, 4],
          },
          {
            text: url,
            link: url,
            color: "#2563eb",
            decoration: "underline",
            margin: [indentLevel * 10, 0, 0, 0],
          },
          ...(title
            ? [
                {
                  text: title,
                  italics: true,
                  color: "#64748b",
                  fontSize: 10,
                  margin: [indentLevel * 10, 4, 0, 0],
                },
              ]
            : []),
        ],
        fillColor: "#f8fafc",
        margin: [0, 8],
      });
      continue;
    }

    // ================================
    // REGULAR PARAGRAPH
    // ================================

    flushList();
    flushQuote();

    const formattedFragments = parseInlineFormatting(trimmedLine);

    content.push({
      text: formattedFragments,
      style: "paragraph",
      margin: [indentLevel * 10, 4, 0, 4],
    });
  }

  // Завершаем все незакрытые блоки
  flushList();
  flushQuote();
  flushCodeBlock();

  return content;
};

// ================================
// MAIN EXPORT
// ================================

export const downloadMarkdownAsPdf = async (
  markdown: string,
  title: string,
) => {
  try {
    const content = markdownToPdfContent(markdown);

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      info: {
        title,
        author: "Your App",
        subject: "Markdown PDF Export",
      },
      header: {
        text: title,
        alignment: "center",
        margin: [0, 20, 0, 0],
        fontSize: 10,
        color: "#666666",
      },
      footer: (currentPage: number, pageCount: number) => ({
        text: `${currentPage} / ${pageCount}`,
        alignment: "center",
        margin: [0, 0, 0, 20],
        fontSize: 9,
        color: "#999999",
      }),
      content: [
        {
          text: title,
          style: "title",
        },
        createHorizontalLine(),
        ...content,
      ],
      styles: {
        title: {
          fontSize: 24,
          bold: true,
          margin: [0, 0, 0, 20],
        },
        h1: {
          fontSize: 22,
          bold: true,
          margin: [0, 20, 0, 10],
        },
        h2: {
          fontSize: 18,
          bold: true,
          margin: [0, 16, 0, 8],
        },
        h3: {
          fontSize: 15,
          bold: true,
          margin: [0, 12, 0, 6],
        },
        h4: {
          fontSize: 13,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        paragraph: {
          fontSize: 11,
          lineHeight: 1.5,
          margin: [0, 4],
        },
        code: {
          fontSize: 9,
          fillColor: "#f8fafc",
          color: "#111827",
          margin: [0, 10],
        },
      },
      defaultStyle: {
        fontSize: 11,
      },
    };

    const safeFileName = title.replace(/[^\w\sа-яё]/gi, "_").substring(0, 50);

    //@ts-ignore
    pdfMake.createPdf(docDefinition).download(`${safeFileName}.pdf`);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
