"use client";

import { isApiError } from "@/shared/api";
import { createElement, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader, useNotification } from "@/shared/ui/kit";
import { useGetProfileQuery } from "@/entities/profile";

export const withAccount = <P extends object>(
  wrappedComponent: React.ComponentType<P>,
  redirectTo = "/auth/profile",
) => {
  type IProps = P;

  const AuthenticatedComponent: React.FC<IProps> = (props) => {
    const router = useRouter();
    const notification = useNotification();
    const hasWarnedRef = useRef(false);
    const { isError, isLoading, error, refetch } = useGetProfileQuery(null);

    useEffect(() => {
      if (
        error &&
        isApiError(error) &&
        error.status === 404 &&
        !hasWarnedRef.current
      ) {
        hasWarnedRef.current = true;
        router.replace(redirectTo);
        notification.warning(
          "It is necessary to fill in the users primary information",
        );
      }
    }, [router, error, notification]);

    if (isError && (!error || !isApiError(error) || error.status !== 404))
      return (
        <div role="alert">
          Не удалось загрузить профиль.{" "}
          <button onClick={() => refetch()}>Повторить</button>
        </div>
      );

    if (!isLoading && !isError) return createElement(wrappedComponent, props);

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  };

  return AuthenticatedComponent;
};
