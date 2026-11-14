"use client";

import { createElement, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/shared/lib";
import { selectIsAuthenticated } from "@/entities/auth";
import { Loader, useNotification } from "@/shared/ui/kit";

export const withAuth = <P extends object>(
  wrappedComponent: React.ComponentType<P>,
  redirectTo = "/auth",
) => {
  type IProps = P;

  const AuthenticatedComponent: React.FC<IProps> = (props) => {
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
      return createElement(wrappedComponent, props);
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  };

  return AuthenticatedComponent;
};
