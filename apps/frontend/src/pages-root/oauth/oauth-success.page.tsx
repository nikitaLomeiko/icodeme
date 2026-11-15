"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOAuthSession } from "@/entities/auth";
import { useLazyGetProfileQuery } from "@/entities/profile";
import { useLazyGetStudiesQuery } from "@/entities/study";
import { isApiError } from "@/shared/api";
import { Loader } from "@/shared/ui/kit";
import { Suspense } from "react";

const OAuthSuccessContent: React.FC = () => {
  const router = useRouter();
  const verifySession = useOAuthSession();
  const [getProfile] = useLazyGetProfileQuery();
  const [getStudies] = useLazyGetStudiesQuery();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;

    started.current = true;
    window.history.replaceState(null, "", "/oauth/success");

    void (async () => {
      const isAuthenticated = await verifySession();
      if (!isAuthenticated) {
        setError("Не удалось завершить вход. Повторите попытку.");
        return;
      }

      const profile = await getProfile(null, false);

      if (profile.data?.success) {
        const studies = await getStudies(null, false);
        if (studies.data?.data?.some((study) => study.studyPlanJSON.length > 0))
          router.replace("/profile");
        else if (studies.data?.success) router.replace("/auth/profile");
        else setError("Вы вошли в аккаунт, но учебный план не загрузился.");
      } else if (
        profile.error &&
        isApiError(profile.error) &&
        profile.error.status === 404
      )
        router.replace("/auth/profile");
      else setError("Вы вошли в аккаунт, но загрузить профиль не удалось.");
    })();
  }, [getProfile, getStudies, router, verifySession]);

  return error ? (
    <div role="alert" className="p-6 text-center">
      {error}{" "}
      <button onClick={() => window.location.reload()}>Повторить</button>
    </div>
  ) : (
    <Loader />
  );
};

export const OAuthSuccessPage: React.FC = () => (
  <Suspense
    fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    }
  >
    <OAuthSuccessContent />
  </Suspense>
);
