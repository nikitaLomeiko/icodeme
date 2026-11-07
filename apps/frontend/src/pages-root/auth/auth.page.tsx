"use client";
import { useState } from "react";
import { AuthForm } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useLazyGetProfileQuery } from "@/entities/profile";
import { isApiError } from "@/shared/api";
export const AuthPage = () => {
  const router = useRouter();
  const [getProfile] = useLazyGetProfileQuery();
  const [failed, setFailed] = useState(false);
  const finish = async () => {
    const result = await getProfile(null, false);
    if (result.data?.success) router.replace("/profile");
    else if (
      result.error &&
      isApiError(result.error) &&
      result.error.status === 404
    )
      router.replace("/auth/profile");
    else setFailed(true);
  };
  return (
    <>
      {failed && (
        <div role="alert">
          Вход выполнен, но профиль не загрузился.{" "}
          <button onClick={finish}>Повторить</button>
        </div>
      )}
      <AuthForm onSuccess={finish} />
    </>
  );
};
