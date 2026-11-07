export type PreviewDevice = "desktop" | "tablet" | "mobile";

export interface IPreviewProps {
  document: string;
  address?: string;
  height?: string;
  className?: string;
  withDevices?: boolean;
  onClose?: () => void;
}
