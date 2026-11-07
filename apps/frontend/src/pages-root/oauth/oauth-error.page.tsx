"use client";

import { Button, Notification } from "@/shared/ui/kit";
import { useRouter } from "next/navigation";

export const OAuthErrorPage = () => {
  const router = useRouter();

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center pt-10">
      <Notification
        message="an unknown error occurred while trying to log in"
        autoClose={false}
        type="error"
      />
      <Button onClick={() => router.push("/auth")} variant="primary">
        Back
      </Button>
    </div>
  );
};
