import {
  FaEllipsisH,
  FaHome,
  FaStore,
  FaTrophy,
  FaUser,
  FaCode,
} from "react-icons/fa";
import { ITab } from "../types/tab.type";

export const tabs: ITab[] = [
  { id: "/", icon: FaHome, label: "Обучение" },
  { id: "profile", icon: FaUser, label: "Профиль" },
  { id: "dev", icon: FaCode, label: "Тренажеры" },
  { id: "shop", icon: FaStore, label: "Магазин" },
  { id: "Other", icon: FaEllipsisH, label: "Еще" },
];
