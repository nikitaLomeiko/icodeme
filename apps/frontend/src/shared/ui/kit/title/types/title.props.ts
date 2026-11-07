export type TitleSize =
  | "xs"
  | "sm"
  | "base"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl";

export type TitleWeight =
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold";

export type TitleColor =
  | "default"
  | "emerald-800"
  | "emerald-700"
  | "gray-800"
  | "gray-700"
  | "gray-600"
  | "gray-500"
  | "gradient"
  | "error";

export type TitleAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

export interface TitleProps {
  /** Текст заголовка */
  children: React.ReactNode;
  /** Размер текста */
  size?: TitleSize;
  /** Жирность шрифта */
  weight?: TitleWeight;
  /** Цвет текста */
  color?: TitleColor;
  /** HTML тег или компонент для рендеринга */
  as?: TitleAs;
  /** Дополнительные CSS классы */
  className?: string;
  /** Выравнивание текста */
  align?: "left" | "center" | "right";
  /** Максимальная ширина в строках для обрезки с троеточием */
  lineClamp?: number;
  /** Показывать состояние ошибки */
  isError?: boolean;
}
