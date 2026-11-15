"use client";
import { useState } from "react";
import { AuthForm } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useLazyGetProfileQuery } from "@/entities/profile";
import { useLazyGetStudiesQuery } from "@/entities/study";
import { isApiError } from "@/shared/api";
export const AuthPage: React.FC = () => {
  const router = useRouter();

  const [getProfile] = useLazyGetProfileQuery();
  const [getStudies] = useLazyGetStudiesQuery();

  const [failed, setFailed] = useState(false);

  const finish = async () => {
    const result = await getProfile(null, false);
    if (result.data?.success) {
      const studies = await getStudies(null, false);
      if (studies.data?.data?.some((study) => study.studyPlanJSON.length > 0))
        router.replace("/profile");
      else if (studies.data?.success) router.replace("/auth/profile");
      else setFailed(true);
    } else if (
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
