import { FaGithub, FaGoogle, FaTelegram } from "react-icons/fa";
import { IOAtuh } from "../types/oauth.types";
import { baseUrl } from "@/shared/api";

export const telegramOrigin =
  process.env.NEXT_PUBLIC_telegramOrigin || "http://127.0.0.1:5173";

export const oauthProviders: IOAtuh[] = [
  {
    id: "google",
    icon: FaGoogle,
    textColor: "!text-red-500",
    url: `${baseUrl}oauth/google`,
  },
  {
    id: "github",
    icon: FaGithub,
    textColor: "!text-gray-700",
    url: `${baseUrl}oauth/github`,
  },
  {
    id: "telegram",
    icon: FaTelegram,
    textColor: "!text-blue-500",
    url: `https://oauth.telegram.org/auth?bot_id=${process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || "8694368343"}`,
  },
];
