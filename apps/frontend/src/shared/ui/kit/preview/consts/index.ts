import { IconType } from "react-icons";
import { FiMonitor, FiSmartphone, FiTablet } from "react-icons/fi";
import { PreviewDevice } from "../types";

export const previewDevices: {
  id: PreviewDevice;
  title: string;
  icon: IconType;
}[] = [
  { id: "desktop", title: "Desktop", icon: FiMonitor },
  { id: "tablet", title: "Tablet", icon: FiTablet },
  { id: "mobile", title: "Mobile", icon: FiSmartphone },
];

export const previewDeviceWidths: Record<PreviewDevice, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};
