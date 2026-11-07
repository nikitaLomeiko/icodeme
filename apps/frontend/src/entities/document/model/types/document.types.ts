export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface IFavorite {
  documentId: string;
  links: LineFavorite[];
}

export interface LineFavorite {
  id: string;
  elementId: string;
  text: string;
  type: string;
  timestamp: number;
  scrollPosition: number;
}

export interface DocumentStats {
  wordCount: number;
  imageCount: number;
  codeBlockCount: number;
  readingTime: number;
}
