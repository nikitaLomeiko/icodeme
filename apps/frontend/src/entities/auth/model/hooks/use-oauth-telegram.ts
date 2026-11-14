"use client";

import { useEffect, useRef } from "react";
import { useTelegramVerifiyMutation } from "../../api/oauth.api";

export const useOAuthTelegram = (hash: string) => {
  const [verify] = useTelegramVerifiyMutation();
  const started = useRef(false);

  useEffect(() => {
    if (!hash || started.current) return;
    started.current = true;

    const params = Object.fromEntries(
      new URLSearchParams(hash.replace(/^#/, "")),
    );
    window.history.replaceState(null, "", window.location.pathname);

    void verify(JSON.stringify(params))
      .unwrap()
      .then((result) => {
        window.location.replace(
          result.success && result.data ? "/oauth/success" : "/oauth/error",
        );
      })
      .catch(() => window.location.replace("/oauth/error"));
  }, [hash, verify]);
};
