"use client";

import React, { memo, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";
import { FiExternalLink, FiLink } from "react-icons/fi";
import { CopyButton } from "./components/copy.button";
import { sizeStyle } from "./styles/markdown.styles";
import { fontSize } from "./types/markdown.types";

interface IProps {
  content: string;
  fontSize?: fontSize;
}

const generateDeterministicId = (
  text: string,
  tagName: string,
  index: number,
): string => {
  const cleanText = text.trim().toLowerCase().slice(0, 100);

  let hash = 0;
  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Берем абсолютное значение и преобразуем в строку
  const hashStr = Math.abs(hash).toString(36);

  return `${tagName}-${hashStr}-${index}`;
};

export const Markdown: React.FC<IProps> = memo((props) => {
  const { content, fontSize = "md" } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef<Set<string>>(new Set());

  const sizeClasses = sizeStyle[fontSize];

  useEffect(() => {
    if (!contentRef.current) return;

    processedRef.current.clear();

    const selectors = [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "li",
      "blockquote",
      "table",
      "figcaption",
    ];

    selectors.forEach((selector) => {
      const elements = contentRef.current?.querySelectorAll(selector);

      elements?.forEach((element, idx) => {
        // Если у элемента уже есть ID и он совпадает с нашим форматом - не меняем
        if (element.id && element.id.match(/^[a-z]+-\w+-\d+$/)) {
          return;
        }

        const contentKey = element.textContent || "";
        if (processedRef.current.has(contentKey)) {
          if (!element.id) {
            const tagName = element.tagName.toLowerCase();
            const uniqueId = generateDeterministicId(contentKey, tagName, idx);
            element.id = uniqueId;
            processedRef.current.add(contentKey);
          }
          return;
        }

        const tagName = element.tagName.toLowerCase();
        const text = element.textContent || "";
        const uniqueId = generateDeterministicId(text, tagName, idx);
        element.id = uniqueId;
        processedRef.current.add(contentKey);
      });
    });
  }, [content]);

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";
      const isInline = !className;
      const codeString = String(children).replace(/\n$/, "");

      if (!isInline && language) {
        return (
          <div className="relative group my-6 rounded-xl overflow-hidden shadow-lg transition-all duration-200 hover:shadow-2xl hover:ring-2 hover:ring-[var(--ui-primary)]/50">
            <div className="flex items-center justify-between px-4 py-2 border-[var(--ui-border)] border-b bg-[var(--ui-background-tertiary)]/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-xs font-mono ml-2 text-[var(--ui-text-muted)]/50">
                  {language}
                </span>
              </div>
              <CopyButton code={codeString} />
            </div>
            <SyntaxHighlighter
              // @ts-ignore
              style={vscDarkPlus}
              language={language}
              PreTag="div"
              className="!m-0"
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize:
                  fontSize === "sm"
                    ? "12px"
                    : fontSize === "md"
                      ? "14px"
                      : fontSize === "lg"
                        ? "16px"
                        : "18px",
                backgroundColor: "#1e1e1e",
              }}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code
          className={`px-1.5 py-0.5 rounded-md font-mono bg-[var(--ui-background-tertiary)]/30 text-[var(--ui-primary)] border border-[var(--ui-border)] ${sizeClasses.code}`}
        >
          {children}
        </code>
      );
    },
    h1: ({ children, ...props }) => {
      const text = typeof children === "string" ? children : "";
      return (
        <h1
          {...props}
          className={`${sizeClasses.h1} font-bold !mt-6 mb-6 tracking-tight text-[var(--ui-primary)]`}
        >
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }) => (
      <h2
        {...props}
        className={`${sizeClasses.h2} font-bold mt-10 mb-4 pb-2 text-[var(--ui-text)]`}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        {...props}
        className={`${sizeClasses.h3} font-semibold mt-8 mb-3 text-[var(--ui-text-secondary)]`}
      >
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4
        {...props}
        className={`${sizeClasses.h4} font-semibold mt-6 mb-2 text-[var(--ui-text-muted)]`}
      >
        {children}
      </h4>
    ),
    p: ({ children, ...props }) => (
      <p
        {...props}
        className={`${sizeClasses.p} mb-4 leading-relaxed text-[var(--ui-text)]`}
      >
        {children}
      </p>
    ),
    a: ({ href, children }) => {
      const isExternal = href?.startsWith("http");
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-1 transition-colors duration-200 opacity-80 text-[var(--ui-primary)] border-b border-[var(--ui-primary)] hover:opacity-100"
        >
          {children}
          {isExternal ? (
            <FiExternalLink className="w-3.5 h-3.5 inline-block" />
          ) : (
            <FiLink className="w-3.5 h-3.5 inline-block" />
          )}
        </a>
      );
    },
    ul: ({ children }) => (
      <ul
        className={`list-disc list-outside mb-4 pl-6 space-y-2 text-[var(--ui-text)]`}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className={`list-decimal list-outside mb-4 pl-6 space-y-2 text-[var(--ui-text)]`}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li
        {...props}
        className={`pl-1 leading-relaxed text-[var(--ui-text)] ${sizeClasses.li}`}
      >
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }) => {
      const text = typeof children === "string" ? children : "";
      return (
        <blockquote
          {...props}
          className={`relative border-l-4 border-[var(--ui-primary)] text-[var(--ui-text-secondary)] pl-5 my-6 p-3 bg-[var(--ui-background-tertiary)]/30 rounded-r-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:bg-[var(--ui-background-tertiary)]/50 cursor-pointer`}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1"></div>
          {children}
        </blockquote>
      );
    },
    hr: () => (
      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--ui-border)]"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-[var(--ui-background)] text-[var(--ui-text-muted)]">
            ✦
          </span>
        </div>
      </div>
    ),
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-6 rounded-xl shadow-lg border border-[var(--ui-border)] transition-all duration-200 hover:shadow-2xl hover:ring-2 hover:ring-[var(--ui-primary)]/50">
        <table
          {...props}
          className="min-w-full divide-y border-[var(--ui-border)]"
        >
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }) => (
      <th
        {...props}
        className={`px-6 py-3 text-left font-semibold border-[var(--ui-border)] text-[var(--ui-text)] bg-[var(--ui-background-secondary)] ${sizeClasses.p}`}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td
        {...props}
        className={`px-6 py-3 border-t text-[var(--ui-text-secondary)] border-[var(--ui-border)] ${sizeClasses.p}`}
      >
        {children}
      </td>
    ),
    img: ({ src, alt }) => (
      <figure className="my-8 transition-all duration-200 hover:scale-[1.02]">
        <div className="relative overflow-hidden rounded-xl shadow-xl transition-all duration-200 hover:shadow-2xl hover:ring-2 hover:ring-[var(--ui-primary)]/50">
          <img
            src={src}
            alt={alt}
            className="max-w-full h-auto rounded-xl transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </div>
        {alt && (
          <figcaption
            className={`text-center text-sm mt-3 italic text-[var(--ui-text-muted)] ${sizeClasses.p}`}
          >
            {alt}
          </figcaption>
        )}
      </figure>
    ),
    strong: ({ children }) => (
      <strong className="font-bold px-1 rounded text-[var(--ui-text)] bg-[var(--ui-primary)]/20">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic border-b border-dashed border-[var(--ui-border)] text-[var(--ui-text-secondary)]">
        {children}
      </em>
    ),
    del: ({ children }) => (
      <del className="line-through text-[var(--ui-text-muted)]">{children}</del>
    ),
  };

  return (
    <div ref={contentRef}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
});
