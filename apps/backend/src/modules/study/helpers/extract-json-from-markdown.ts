export function extractJsonFromMarkdown(text: string): string {
  let cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '');

  cleaned = cleaned.replace(/`{3}\w*\n?/gi, '').replace(/`{3}\n?/gi, '');

  cleaned = cleaned.trim();

  return cleaned;
}
