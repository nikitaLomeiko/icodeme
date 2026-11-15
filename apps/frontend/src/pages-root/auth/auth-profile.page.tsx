"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm, type ProfileFormData } from "@/features/profile";
import {
  useCreateProfileMutation,
  useLazyGetProfileQuery,
  useUpdateProfileDataMutation,
} from "@/entities/profile";
import {
  useCreateStudyMutation,
  useLazyGetStudiesQuery,
  useAddInitialTestModuleMutation,
} from "@/entities/study";
import { isApiError } from "@/shared/api";
import { useNotification } from "@/shared/ui/kit";

export const AuthProfilePage: React.FC = () => {
  const router = useRouter();
  const notification = useNotification();
  const [createProfile] = useCreateProfileMutation();
  const [updateProfile] = useUpdateProfileDataMutation();
  const [getProfile] = useLazyGetProfileQuery();
  const [createStudy] = useCreateStudyMutation();
  const [getStudies] = useLazyGetStudiesQuery();
  const [addInitialTestModule] = useAddInitialTestModuleMutation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [initialValues, setInitialValues] =
    useState<Partial<ProfileFormData>>();

  useEffect(() => {
    let active = true;
    void Promise.all([getProfile(null, false), getStudies(null, false)]).then(
      ([profile, studies]) => {
        if (!active) return;
        const data = profile.data?.data?.data;
        setInitialValues({
          name: data?.name ?? "",
          avatar: data?.avatar ?? "",
          bio: data?.about ?? "",
          info: studies.data?.data?.[0]?.study.context ?? "",
        });
      },
    );
    return () => {
      active = false;
    };
  }, [getProfile, getStudies]);

  const onSubmit = async (data: ProfileFormData) => {
    setError(null);
    setLoading(true);
    try {
      const existingProfile = await getProfile(null, false);
      const profileError = existingProfile.error;
      if (
        profileError &&
        (!isApiError(profileError) || profileError.status !== 404)
      )
        throw new Error(
          isApiError(profileError)
            ? profileError.data.message
            : "Не удалось проверить профиль.",
        );
      if (
        profileError &&
        isApiError(profileError) &&
        profileError.status === 404
      ) {
        const created = await createProfile({
          about: data.bio,
          avatar: data.avatar,
          name: data.name,
        });
        if (created.error && isApiError(created.error))
          throw new Error(created.error.data.message);
        if (!created.data?.data) throw new Error("Не удалось создать профиль.");
      } else if (existingProfile.data?.data) {
        const updated = await updateProfile({
          about: data.bio,
          avatar: data.avatar,
          name: data.name,
        });
        if (updated.error && isApiError(updated.error))
          throw new Error(updated.error.data.message);
        if (!updated.data?.data)
          throw new Error("Не удалось обновить профиль.");
      }

      const studies = await getStudies(null, false);
      if (studies.error && isApiError(studies.error))
        throw new Error(studies.error.data.message);
      const existingStudy = studies.data?.data?.find(
        (study) => study.study.context === data.info,
      );
      const study = existingStudy ?? (await createStudy(data.info)).data?.data;
      if (!study) throw new Error("Не удалось создать учебный план.");

      if (study.studyPlanJSON.length === 0) {
        const generated = await addInitialTestModule(study._id);
        if (generated.error && isApiError(generated.error))
          throw new Error(generated.error.data.message);
      }
      notification.success("Профиль создан");
      router.push("/profile");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Не удалось завершить настройку профиля.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileForm
      onSubmit={onSubmit}
      isLoading={isLoading}
      error={error}
      initialValues={initialValues}
    />
  );
};
