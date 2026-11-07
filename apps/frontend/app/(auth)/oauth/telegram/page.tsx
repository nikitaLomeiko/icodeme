"use client";

import { useEffect, useState } from "react";
import { OAuthTelegramPage } from "@/pages-root/oauth";
import { Loader } from "@/shared/ui/kit";

const OAuthTelegramClientPage: React.FC = () => {
  const [hash, setHash] = useState<string>("");

  useEffect(() => {
    const hashValue = window.location.hash.substring(1);
    setHash(hashValue);
  }, []);

  if (!hash) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return <OAuthTelegramPage hash={hash} />;
};

export default OAuthTelegramClientPage;
