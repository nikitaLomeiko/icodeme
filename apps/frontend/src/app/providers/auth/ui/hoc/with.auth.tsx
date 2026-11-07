"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/shared/lib/hooks";
import { selectIsAuthenticated } from "@/entities/auth";
import { Loader, useNotification } from "@/shared/ui/kit";

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  redirectTo = "/auth",
) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const isAuth = useAppSelector(selectIsAuthenticated);
    const notification = useNotification();

    useEffect(() => {
      if (isAuth === false) {
        router.replace(redirectTo);
        notification.warning("Authorization is required");
      }
    }, [isAuth, router]);

    if (isAuth === true) {
      return <WrappedComponent {...props} />;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  };
}
