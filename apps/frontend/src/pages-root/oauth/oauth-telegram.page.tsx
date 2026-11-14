"use client";

import { useSyncExternalStore } from "react";
import { useOAuthTelegram } from "@/entities/auth/model/hooks/use-oauth-telegram";
import { Loader } from "@/shared/ui/kit";

const subscribeToLocationHash = () => () => undefined;
const getLocationHash = () => window.location.hash.substring(1);
const getServerLocationHash = () => "";

export const OAuthTelegramPage: React.FC = () => {
  const hash = useSyncExternalStore(
    subscribeToLocationHash,
    getLocationHash,
    getServerLocationHash,
  );

  useOAuthTelegram(hash);

  return (
    <div className="flex justify-center items-center h-screen">
      <Loader />
    </div>
  );
};
