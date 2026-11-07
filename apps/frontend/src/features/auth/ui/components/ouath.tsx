"use client";

import { Button } from "@/shared/ui/kit";
import { oauthProviders, TELEGRAM_ORIGIN } from "../../model/data/oauth.data";
import { useState } from "react";

export const OAuth = () => {
  const [isLoading, setLoading] = useState<boolean>(false);

  const handleOauth = (endpoint: string) => {
    setLoading(true);
    const url = new URL(endpoint);
    if (url.hostname === "oauth.telegram.org") {
      const origin = new URL(TELEGRAM_ORIGIN).origin;
      url.searchParams.set("origin", origin);
      url.searchParams.set("return_to", `${origin}/oauth/telegram`);
    }
    window.location.assign(url.toString());
  };

  return (
    <div className="grid grid-cols-3 gap-2 mb-3 mt-3">
      {oauthProviders.map((provider) => {
        const Icon = provider.icon;
        return (
          <Button
            key={provider.id}
            variant="ghost"
            onClick={() => handleOauth(provider.url)}
            icon={Icon}
            disabled={isLoading}
            isLoading={isLoading}
            sizeIcon={24}
            disableHoverScale
            className={provider.textColor}
          ></Button>
        );
      })}
    </div>
  );
};
