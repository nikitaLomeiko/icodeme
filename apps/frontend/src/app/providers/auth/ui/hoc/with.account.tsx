"use client";

import { isApiError } from "@/shared/api";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader, useNotification } from "@/shared/ui/kit";
import { useGetProfileQuery } from "@/entities/profile";

export function withAccount<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  redirectTo = "/auth/profile",
) {
  return function AuthenticatedComponent(props: P) {
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

    if (!isLoading && !isError) return <WrappedComponent {...props} />;

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  };
}
