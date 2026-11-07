"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { setAuthData, useLazyVerifyTokenQuery } from "@/entities/auth";
import { useAppDispatch } from "@/shared/lib/hooks";
import { useLazyGetProfileQuery } from "@/entities/profile";
import { isApiError } from "@/shared/api";
import { announceSession } from "@/shared/api/session";
import { Loader } from "@/shared/ui/kit";

export const OAuthSuccessPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [verify] = useLazyVerifyTokenQuery();
  const [getProfile] = useLazyGetProfileQuery();
  const started = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    window.history.replaceState(null, "", "/oauth/success");
    void (async () => {
      const result = await verify(null);
      if (!result.data?.data) {
        setError("Не удалось завершить вход. Повторите попытку.");
        return;
      }
      dispatch(
        setAuthData({
          id: result.data.data.userId,
          email: result.data.data.email,
        }),
      );
      announceSession();
      const profile = await getProfile(null, false);
      if (profile.data?.success) router.replace("/profile");
      else if (
        profile.error &&
        isApiError(profile.error) &&
        profile.error.status === 404
      )
        router.replace("/auth/profile");
      else setError("Вы вошли в аккаунт, но загрузить профиль не удалось.");
    })();
  }, [dispatch, getProfile, router, verify]);
  return error ? (
    <div role="alert" className="p-6 text-center">
      {error}{" "}
      <button onClick={() => window.location.reload()}>Повторить</button>
    </div>
  ) : (
    <Loader />
  );
};
