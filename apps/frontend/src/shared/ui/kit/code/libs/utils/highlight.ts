import { KEYWORDS } from "../../consts/keywords";
import { TYPES } from "../../consts/types";
import { escapeHtml } from "./escape-html";

const S = {
  keyword: 'color:var(--ui-primary)',
  string: 'color:var(--ui-success)',
  number: 'color:var(--ui-warning)',
  comment: 'color:var(--ui-text-muted);font-style:italic',
  function: 'color:var(--ui-info)',
  type: 'color:var(--ui-info)',
  tag: 'color:var(--ui-error)',
  tagName: 'color:var(--ui-warning)',
  attr: 'color:var(--ui-primary-hover)',
  property: 'color:var(--ui-primary-hover)',
  bracket: 'color:var(--ui-warning)',
};

function span(style: string, content: string): string {
  return `<span style="${style}">${content}</span>`;
}

export function highlightCode(code: string): string {
  const lines = code.split('\n');
  return lines
    .map((line) => {
      let escaped = '';
      let i = 0;
      while (i < line.length) {
        if (line[i] === '/' && line[i + 1] === '/') {
          escaped += span(S.comment, escapeHtml(line.slice(i)));
          break;
        }
        if (line[i] === '/' && line[i + 1] === '*') {
          const end = line.indexOf('*/', i + 2);
          if (end !== -1) {
            escaped += span(S.comment, escapeHtml(line.slice(i, end + 2)));
            i = end + 2;
            continue;
          }
        }

        if (line[i] === '"' || line[i] === "'") {
          const quote = line[i];
          let j = i + 1;
          while (j < line.length && line[j] !== quote) {
            if (line[j] === '\\') j++;
            j++;
          }
          escaped += span(S.string, escapeHtml(line.slice(i, j + 1)));
          i = j + 1;
          continue;
        }

        if (line[i] === '`') {
          let j = i + 1;
          let depth = 0;
          while (j < line.length) {
            if (line[j] === '\\') { j += 2; continue; }
            if (line[j] === '$' && line[j + 1] === '{') depth++;
            if (depth > 0 && line[j] === '}') depth--;
            if (depth === 0 && line[j] === '`') break;
            j++;
          }
          const inner = line.slice(i + 1, j);
          let processed = '';
          let k = 0;
          while (k < inner.length) {
            if (inner[k] === '$' && inner[k + 1] === '{') {
              let depth2 = 1;
              let exprStart = k + 2;
              let pos = exprStart;
              while (pos < inner.length && depth2 > 0) {
                if (inner[pos] === '{') depth2++;
                if (inner[pos] === '}') depth2--;
                pos++;
              }
              processed += highlightCode(inner.slice(exprStart, pos - 1));
              k = pos;
            } else {
              processed += escapeHtml(inner[k]);
              k++;
            }
          }
          escaped += span(S.string, '`' + processed + '`');
          i = j + 1;
          continue;
        }

        if (/\d/.test(line[i]) && (i === 0 || /[\s()\[\]{}\+\-\*/=,;:]/.test(line[i - 1]))) {
          let j = i;
          while (j < line.length && /[\d.]/.test(line[j])) j++;
          escaped += span(S.number, escapeHtml(line.slice(i, j)));
          i = j;
          continue;
        }

        if (line[i] === '<' && /[A-Za-z]/.test(line[i + 1])) {
          let j = i + 1;
          while (j < line.length && !/>/.test(line[j]) && line[j] !== '\n') j++;
          const tagEnd = line[j] === '>' ? j + 1 : j;
          const tag = line.slice(i, tagEnd);
          const isClosing = tag.startsWith('</');
          const tagName =  tag.match(/^<\/?([^\s>\/]+)/)?.[1] || ''
          const hasClosingBracket = line[j] === '>';
          if (isClosing) {
            escaped += span(S.tag, '&lt;/') + span(S.tagName, escapeHtml(tagName));
            if (hasClosingBracket) escaped += span(S.tag, '&gt;');
          } else {
            escaped += span(S.tag, '&lt;') + span(S.tagName, escapeHtml(tagName));
            const attrPartStart = tagName.length + 1;
            const attrPartEnd = hasClosingBracket
              ? (tag.endsWith('/>') ? -2 : -1)
              : undefined;
            const attrPart = attrPartEnd !== undefined
              ? tag.slice(attrPartStart, attrPartEnd)
              : tag.slice(attrPartStart);
            if (attrPart) {
              const attrMatch = attrPart.match(/(\w+)(?:=(?:"[^"]*"|'[^']*'|\S+))?/g);
              if (attrMatch) {
                for (const attr of attrMatch) {
                  const [name, ...val] = attr.split('=');
                  escaped += ' ' + span(S.attr, escapeHtml(name));
                  if (val.length) {
                    escaped += '=' + span(S.string, escapeHtml(val.join('=')));
                  }
                }
              }
            }
            if (tag.endsWith('/>')) {
              escaped += span(S.tag, ' /&gt;');
            } else if (hasClosingBracket) {
              escaped += span(S.tag, '&gt;');
            }
          }
          i = tagEnd;
          continue;
        }

        if (line[i] === '(' || line[i] === '[') {
          const close = line[i] === '(' ? ')' : ']';
          let depth = 1;
          let j = i + 1;
          while (j < line.length && depth > 0) {
            if (line[j] === line[i]) depth++;
            if (line[j] === close) depth--;
            if (depth > 0) j++;
          }
          const inner = line.slice(i + 1, j);
          const innerHighlighted = inner ? highlightCode(inner) : '';
          escaped += span(S.bracket, escapeHtml(line[i]) + innerHighlighted + escapeHtml(line[j] || ''));
          i = (j < line.length ? j : j - 1) + 1;
          continue;
        }

        if (line[i] === '<' && line[i + 1] === '/') {
          let j = i + 2;
          while (j < line.length && line[j] !== '>') j++;
          const hasClosingBracket = line[j] === '>';
          const tagContent = escapeHtml(line.slice(i + 2, hasClosingBracket ? j : j));
          escaped += span(S.tag, '&lt;/') + span(S.tagName, tagContent);
          if (hasClosingBracket) escaped += span(S.tag, '&gt;');
          i = (hasClosingBracket ? j : j - 1) + 1;
          continue;
        }

        if (/[A-Za-z_]/.test(line[i])) {
          let j = i;
          while (j < line.length && /[\w$]/.test(line[j])) j++;
          const word = line.slice(i, j);
          if (KEYWORDS.has(word)) {
            escaped += span(S.keyword, escapeHtml(word));
          } else if (TYPES.has(word) || (word[0] >= 'A' && word[0] <= 'Z')) {
            escaped += span(S.type, escapeHtml(word));
          } else if (i > 0 && line[i - 1] === '.') {
            escaped += span(S.property, escapeHtml(word));
          } else {
            const afterWord = line.slice(j).trimStart();
            if (afterWord[0] === '(') {
              escaped += span(S.function, escapeHtml(word));
            } else {
              escaped += escapeHtml(word);
            }
          }
          i = j;
          continue;
        }

        escaped += escapeHtml(line[i]);
        i++;
      }
      return escaped;
    })
    .join('\n');
}
