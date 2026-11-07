"use client";

import { OAuthSuccessPage } from "@/pages-root/oauth";
import { Loader } from "@/shared/ui/kit";
import { Suspense } from "react";

const OAuthSuccessClientPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Loader />
        </div>
      }
    >
      <OAuthSuccessPage />
    </Suspense>
  );
};

export default OAuthSuccessClientPage;
