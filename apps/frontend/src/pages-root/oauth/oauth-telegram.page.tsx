"use client";

import { useEffect, useRef } from "react";
import { useTelegramVerifiyMutation } from "@/entities/auth";
import { Loader } from "@/shared/ui/kit";

const DOMAIN = "/";

interface IProps {
  hash: string;
}

export const OAuthTelegramPage: React.FC<IProps> = ({ hash }) => {
  const [verify] = useTelegramVerifiyMutation();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const params = Object.fromEntries(
      new URLSearchParams(hash.replace(/^#/, "")),
    );
    window.history.replaceState(null, "", window.location.pathname);

    const authorize = async () => {
      try {
        const result = await verify(JSON.stringify(params)).unwrap();

        if (!result.success || !result.data) {
          window.location.href = `${DOMAIN}oauth/error`;
          return;
        }

        window.location.replace(`${DOMAIN}oauth/success`);
      } catch {
        window.location.href = `${DOMAIN}oauth/error`;
      }
    };

    authorize();
  }, [hash, verify]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Loader />
    </div>
  );
};
