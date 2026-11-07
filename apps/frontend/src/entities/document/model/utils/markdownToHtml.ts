// =========================
// ESCAPE HTML
// =========================

const escapeHtml = (text: string): string => {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
};

// =========================
// MARKDOWN → HTML
// =========================

export const convertMarkdownToHtml = (md: string): string => {
  let html = md;

  // =========================
  // TABLES
  // =========================

  const parseMarkdownTable = (tableText: string): string => {
    const lines = tableText.trim().split("\n");

    if (lines.length < 2) return tableText;

    const headers = lines[0]
      .split("|")
      .filter(Boolean)
      .map((cell) => cell.trim());

    const aligns = lines[1]
      .split("|")
      .filter(Boolean)
      .map((cell) => {
        const trimmed = cell.trim();

        if (trimmed.startsWith(":") && trimmed.endsWith(":")) {
          return "center";
        }

        if (trimmed.endsWith(":")) {
          return "right";
        }

        if (trimmed.startsWith(":")) {
          return "left";
        }

        return "left";
      });

    const dataLines = lines.slice(2);

    let table = `
      <div class="table-wrapper">
        <table class="markdown-table">
          <thead>
            <tr>
    `;

    headers.forEach((header, idx) => {
      table += `
        <th style="text-align:${aligns[idx] || "left"}">
          ${escapeHtml(header)}
        </th>
      `;
    });

    table += `
          </tr>
        </thead>
        <tbody>
    `;

    dataLines.forEach((line) => {
      if (!line.trim()) return;

      const cells = line
        .split("|")
        .filter(Boolean)
        .map((cell) => cell.trim());

      table += "<tr>";

      cells.forEach((cell, idx) => {
        let formattedCell = escapeHtml(cell);

        formattedCell = formattedCell.replace(
          /\*\*(.*?)\*\*/g,
          "<strong>$1</strong>",
        );

        formattedCell = formattedCell.replace(/\*(.*?)\*/g, "<em>$1</em>");

        formattedCell = formattedCell.replace(/`(.*?)`/g, "<code>$1</code>");

        table += `
          <td style="text-align:${aligns[idx] || "left"}">
            ${formattedCell}
          </td>
        `;
      });

      table += "</tr>";
    });

    table += `
        </tbody>
      </table>
    </div>
    `;

    return table;
  };

  const tables: string[] = [];

  html = html.replace(/^\|(.+)\|\n\|[-:|\s]+\|\n(?:^\|.+\|\n?)+/gm, (match) => {
    const index = tables.length;
    tables.push(match);

    return `%%TABLE${index}%%`;
  });

  // =========================
  // CODE BLOCKS
  // =========================

  const codeBlocks: string[] = [];

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const index = codeBlocks.length;

    codeBlocks.push(`
        <pre>
          <code class="language-${lang || "plaintext"}">
${escapeHtml(code.trim())}
          </code>
        </pre>
      `);

    return `%%CODEBLOCK${index}%%`;
  });

  // =========================
  // INLINE CODE
  // =========================

  const inlineCodes: string[] = [];

  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const index = inlineCodes.length;

    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);

    return `%%INLINECODE${index}%%`;
  });

  // =========================
  // HEADINGS
  // =========================

  html = html.replace(/^###### (.*)$/gm, "<h6>$1</h6>");
  html = html.replace(/^##### (.*)$/gm, "<h5>$1</h5>");
  html = html.replace(/^#### (.*)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");

  // =========================
  // TEXT FORMAT
  // =========================

  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  html = html.replace(/~~(.*?)~~/g, "<del>$1</del>");

  // =========================
  // IMAGES
  // =========================

  html = html.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
    (match, alt, url, title) => {
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";

      return `
        <img
          src="${escapeHtml(url)}"
          alt="${escapeHtml(alt || "")}"
          ${titleAttr}
          loading="lazy"
        />
      `;
    },
  );

  // =========================
  // LINKS
  // =========================

  html = html.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
    (match, text, url, title) => {
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";

      return `<a href="${escapeHtml(
        url,
      )}"${titleAttr} target="_blank" rel="noopener noreferrer">${escapeHtml(
        text,
      )}</a>`;
    },
  );

  // =========================
  // AUTO LINKS
  // =========================

  html = html.replace(
    /<((https?:\/\/)[^>]+)>/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // =========================
  // EMAIL LINKS
  // =========================

  html = html.replace(
    /<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/g,
    '<a href="mailto:$1">$1</a>',
  );

  // =========================
  // HORIZONTAL RULES
  // =========================

  html = html.replace(/^---$/gm, "<hr>");
  html = html.replace(/^___$/gm, "<hr>");
  html = html.replace(/^\*\*\*$/gm, '<hr class="fancy-hr">');

  // =========================
  // QUOTES
  // =========================

  const processQuotes = (text: string): string => {
    const lines = text.split("\n");

    const result: string[] = [];

    let quoteDepth = 0;

    for (const line of lines) {
      const match = line.match(/^(>+)\s+(.*)$/);

      if (match) {
        const depth = match[1].length;
        const content = match[2];

        while (quoteDepth < depth) {
          quoteDepth++;

          result.push(`<blockquote class="quote-level-${quoteDepth}">`);
        }

        while (quoteDepth > depth) {
          result.push("</blockquote>");
          quoteDepth--;
        }

        result.push(content);
      } else {
        while (quoteDepth > 0) {
          result.push("</blockquote>");
          quoteDepth--;
        }

        result.push(line);
      }
    }

    while (quoteDepth > 0) {
      result.push("</blockquote>");
      quoteDepth--;
    }

    return result.join("\n");
  };

  html = processQuotes(html);

  // =========================
  // NESTED LISTS
  // =========================

  const processLists = (text: string): string => {
    const lines = text.split("\n");

    const result: string[] = [];

    const stack: {
      type: "ul" | "ol";
      level: number;
    }[] = [];

    for (const line of lines) {
      const ulMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
      const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);

      const match = ulMatch || olMatch;

      if (match) {
        const spaces = match[1].length;

        const level = Math.floor(spaces / 2);

        const content = match[2];

        const type = ulMatch ? "ul" : "ol";

        while (stack.length && stack[stack.length - 1].level > level) {
          const last = stack.pop();

          if (last) {
            result.push(`</${last.type}>`);
          }
        }

        const current = stack[stack.length - 1];

        if (!current || current.level !== level || current.type !== type) {
          result.push(`<${type} class="nested-list">`);

          stack.push({
            type,
            level,
          });
        }

        result.push(`<li>${content}</li>`);
      } else {
        while (stack.length) {
          const last = stack.pop();

          if (last) {
            result.push(`</${last.type}>`);
          }
        }

        result.push(line);
      }
    }

    while (stack.length) {
      const last = stack.pop();

      if (last) {
        result.push(`</${last.type}>`);
      }
    }

    return result.join("\n");
  };

  html = processLists(html);

  // =========================
  // PARAGRAPHS
  // =========================

  const paragraphs = html.split(/\n\s*\n/);

  html = paragraphs
    .map((para) => {
      const trimmed = para.trim();

      if (!trimmed) return "";

      const blockTags = [
        "<h",
        "<ul",
        "<ol",
        "<blockquote",
        "<pre",
        "<hr",
        "<div",
        "<img",
      ];

      const isBlock = blockTags.some((tag) => trimmed.startsWith(tag));

      if (
        isBlock ||
        trimmed.includes("%%TABLE") ||
        trimmed.includes("%%CODEBLOCK") ||
        trimmed.includes("%%INLINECODE")
      ) {
        return trimmed;
      }

      return `<p>${trimmed}</p>`;
    })
    .join("\n");

  // =========================
  // RESTORE TABLES
  // =========================

  html = html.replace(/%%TABLE(\d+)%%/g, (match, index) => {
    return parseMarkdownTable(tables[Number(index)]);
  });

  // =========================
  // RESTORE CODEBLOCKS
  // =========================

  html = html.replace(/%%CODEBLOCK(\d+)%%/g, (match, index) => {
    return codeBlocks[Number(index)] || "";
  });

  // =========================
  // RESTORE INLINE CODES
  // =========================

  html = html.replace(/%%INLINECODE(\d+)%%/g, (match, index) => {
    return inlineCodes[Number(index)] || "";
  });

  // =========================
  // CLEANUP
  // =========================

  html = html.replace(/<\/li>\s*<li>/g, "</li><li>");

  return html;
};

// =========================
// DOWNLOAD HTML
// =========================

export const downloadMarkdownAsHtml = (markdown: string, title: string) => {
  const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>${escapeHtml(title)}</title>

<style>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 40px;
  font-family: Arial, sans-serif;
  line-height: 1.7;
  color: #1a1a1a;
  background: white;
}

h1,h2,h3,h4,h5,h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

p {
  margin: 1em 0;
}

code {
  background: #f4f4f4;
  padding: 2px 6px;
  border-radius: 4px;
}

pre {
  background: #f4f4f4;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
}

pre code {
  background: none;
  padding: 0;
}

blockquote {
  border-left: 4px solid #ccc;
  padding-left: 16px;
  margin: 1em 0;
  color: #666;
}

ul,
ol {
  margin: 1em 0;
  padding-left: 2em;
}

li {
  margin: 0.3em 0;
}

.table-wrapper {
  overflow-x: auto;
  margin: 1.5em 0;
}

.markdown-table {
  width: 100%;
  border-collapse: collapse;
}

.markdown-table th,
.markdown-table td {
  border: 1px solid #ddd;
  padding: 12px;
}

.markdown-table th {
  background: #f5f5f5;
}

a {
  color: #2563eb;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1em 0;
}

hr {
  margin: 2em 0;
}

</style>
</head>

<body>
${convertMarkdownToHtml(markdown)}
</body>
</html>
`;

  const blob = new Blob([htmlContent], {
    type: "text/html;charset=utf-8",
  });

  const link = document.createElement("a");

  const url = URL.createObjectURL(blob);

  link.href = url;

  link.download = `${title.replace(/[^\w\sа-яё]/gi, "_")}.html`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
