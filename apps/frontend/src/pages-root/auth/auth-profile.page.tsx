"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/features/profile";
import { useCreateProfileMutation } from "@/entities/profile";
import { useCreateNewStudyMutation, useTestGenerateModuleByStudyIdMutation } from "@/entities/study";
import { isApiError } from "@/shared/api";
import { useNotification } from "@/shared/ui/kit";
import { ProfileFormData } from "@/features/profile/model/validate/profile.schema";

export const AuthProfilePage: React.FC = () => {
  const router = useRouter();
  const notification = useNotification();
  const [create, { isLoading }] = useCreateProfileMutation();
  const [createStudy] = useCreateNewStudyMutation();
  const [generateStudy] = useTestGenerateModuleByStudyIdMutation();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: ProfileFormData) => {
    setError(null);
    const profile = await create({ about: data.bio, avatar: data.avatar, name: data.name });
    if (profile.error && isApiError(profile.error)) { setError(profile.error.data.message); return; }
    const study = await createStudy(data.info);
    if (study.error && isApiError(study.error)) { setError(study.error.data.message); return; }
    const studyId = study.data?.data?._id;
    if (!studyId) return;
    const generated = await generateStudy(studyId);
    if (generated.error && isApiError(generated.error)) { setError(generated.error.data.message); return; }
    notification.success("The profile was successfully created");
    router.push("/profile");
  };

  return <ProfileForm onSubmit={onSubmit} isLoading={isLoading} error={error} />;
};
