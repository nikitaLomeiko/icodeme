import { FileNode } from "../../types/types";

const HTML_EXTENSION = ".html";
const CSS_EXTENSION = ".css";
const JS_EXTENSIONS = [".js", ".mjs"];

const EMPTY_DOCUMENT =
  "<!DOCTYPE html>\n<html>\n<head></head>\n<body>\n</body>\n</html>";

const normalizeName = (name: string) => name.toLowerCase();

const flattenFiles = (nodes: FileNode[]): FileNode[] => {
  const result: FileNode[] = [];

  const walk = (list: FileNode[]) => {
    for (const node of list) {
      if (node.type === "file") result.push(node);
      if (node.children) walk(node.children);
    }
  };

  walk(nodes);
  return result;
};

export const isHtmlFile = (file: FileNode) =>
  normalizeName(file.name).endsWith(HTML_EXTENSION);

export const isCssFile = (file: FileNode) =>
  normalizeName(file.name).endsWith(CSS_EXTENSION);

export const isJsFile = (file: FileNode) =>
  JS_EXTENSIONS.some((extension) =>
    normalizeName(file.name).endsWith(extension),
  );

const getAttribute = (tag: string, name: string) =>
  tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1] || "";

const getFileName = (value: string) =>
  normalizeName(value.split("/").pop()?.split("?")[0].split("#")[0] || "");

const isLocalReference = (value: string) =>
  !/^(https?:)?\/\/|^data:|^#|^mailto:|^javascript:/i.test(value);

export const findMainHtmlFile = (files: FileNode[]): FileNode | undefined => {
  const htmlFiles = flattenFiles(files).filter(isHtmlFile);
  const indexFile = `index${HTML_EXTENSION}`;

  return (
    htmlFiles.find((file) => normalizeName(file.name) === indexFile) ||
    htmlFiles[0]
  );
};

export const buildPreviewDocument = (files: FileNode[]): string | null => {
  const flatFiles = flattenFiles(files);
  const htmlFiles = flatFiles.filter(isHtmlFile);

  if (htmlFiles.length === 0) return null;

  const cssFiles = flatFiles.filter(isCssFile);
  const jsFiles = flatFiles.filter(isJsFile);

  const mainFile = findMainHtmlFile(files)!;
  const styles = cssFiles
    .map((file) => file.content)
    .filter(Boolean)
    .join("\n");
  const scripts = jsFiles
    .map((file) => file.content)
    .filter(Boolean)
    .join("\n");

  const cssNames = new Set(cssFiles.map((file) => normalizeName(file.name)));
  const jsNames = new Set(jsFiles.map((file) => normalizeName(file.name)));

  let document = mainFile.content?.trim() ? mainFile.content : EMPTY_DOCUMENT;

  document = document.replace(/<link\b[^>]*>/gi, (tag) => {
    const rel = getAttribute(tag, "rel");
    const href = getAttribute(tag, "href");

    if (!rel.includes("stylesheet") || !href || !isLocalReference(href)) {
      return tag;
    }

    return cssNames.has(getFileName(href)) ? "" : tag;
  });

  document = document.replace(
    /<script\b[^>]*>[\s\S]*?<\/script>/gi,
    (tag) => {
      const src = getAttribute(tag, "src");

      if (!src || !isLocalReference(src)) return tag;

      return jsNames.has(getFileName(src)) ? "" : tag;
    },
  );

  if (styles) {
    const styleTag = `<style data-icodeme-preview>${styles}</style>`;

    document = /<\/head>/i.test(document)
      ? document.replace(/<\/head>/i, () => `${styleTag}</head>`)
      : `${styleTag}${document}`;
  }

  if (scripts) {
    const safeScripts = scripts.replace(/<\/script>/gi, "<\\/script>");
    const scriptTag = `<script data-icodeme-preview>${safeScripts}<\/script>`;

    document = /<\/body>/i.test(document)
      ? document.replace(/<\/body>/i, () => `${scriptTag}</body>`)
      : `${document}${scriptTag}`;
  }

  return document;
};
