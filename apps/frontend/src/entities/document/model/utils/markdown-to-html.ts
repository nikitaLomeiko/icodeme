import MarkdownIt from "markdown-it";

const escapeHtml = (text: string): string =>
  text.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '\"': "&quot;",
        "'": "&#39;",
      })[char] || char,
  );

const markdown = new MarkdownIt({ html: false, linkify: true, breaks: true });
markdown.validateLink = (url: string) => /^(https?:\/\/|mailto:|#)/i.test(url);
const defaultLinkRenderer = markdown.renderer.rules.link_open;
markdown.renderer.rules.link_open = (tokens, index, options, env, self) => {
  tokens[index].attrSet("target", "_blank");
  tokens[index].attrSet("rel", "noopener noreferrer");
  return defaultLinkRenderer
    ? defaultLinkRenderer(tokens, index, options, env, self)
    : self.renderToken(tokens, index, options);
};

export const convertMarkdownToHtml = (source: string): string =>
  markdown.render(source);

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
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src https: http: data:; base-uri 'none'; form-action 'none'">

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
