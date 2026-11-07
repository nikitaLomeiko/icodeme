import { escapeHtml } from "./escape-html";

export function searchHighlight(searchQuery: string, value: string, currentMatch: number) {
    if (!searchQuery || !value) return '';

    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'gi');
    let result = '';
    let lastIndex = 0;
    let matchIdx = 0;
    let copy = value;
    let m;

    while ((m = regex.exec(copy)) !== null) {
      const before = escapeHtml(copy.slice(lastIndex, m.index));
      const matched = escapeHtml(copy.slice(m.index, m.index + m[0].length));
      const isCurrent = matchIdx === currentMatch;
      const markStyle = isCurrent
        ? 'background:rgba(255,200,0,0.5);border-radius:2px;outline:1px solid rgba(255,200,0,0.8)'
        : 'background:rgba(255,255,0,0.25);border-radius:2px';
      result += before + `<mark style="${markStyle}">${matched}</mark>`;
      lastIndex = m.index + m[0].length;
      matchIdx++;
    }
    
    result += escapeHtml(copy.slice(lastIndex));
    return result;
}