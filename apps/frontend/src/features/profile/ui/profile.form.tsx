"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NameStep, AvatarStep, AboutStep, ChatStep } from "./steps";
import { StepWrapper } from "./components/step.wrapper";
import { stepTitles } from "../model/data/step.data";
import {
  ProfileFormData,
  profileSchema,
} from "../model/validate/profile.schema";
import { useProfileForm } from "../model/hooks/use.profile.form";
import { useCreateProfileMutation } from "@/entities/profile";
import { isApiError } from "@/shared/api";
import { useRouter } from "next/navigation";
import { useNotification } from "@/shared/ui/kit";
import {
  useCreateNewStudyMutation,
  useTestGenerateModuleByStudyIdMutation,
} from "@/entities/study";

const TOTAL_STEPS = 4;

interface ProfileFormProps {
  onSubmit?: (data: ProfileFormData) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit }) => {
  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      avatar: "",
      bio: "",
      info: "",
    },
  });

  const router = useRouter();
  const notification = useNotification();
  const [create, { isLoading }] = useCreateProfileMutation();
  const [createModule, { isLoading: isLoadingModule }] =
    useCreateNewStudyMutation();
  const [generateModule, { isLoading: isLoadingGenerated }] =
    useTestGenerateModuleByStudyIdMutation();
  const [error, setError] = useState<string | null>(null);

  const { handleSubmit, getFieldState } = methods;
  const manageProfileForm = useProfileForm({
    methods,
    totalSteps: TOTAL_STEPS,
  });

  const onSubmitForm = async (data: ProfileFormData) => {
    setError(null);

    const result = await create({
      about: data.bio,
      avatar: data.avatar,
      name: data.name,
    });

    if (result.error && isApiError(result.error)) {
      setError(result.error.data.message);
      return;
    }

    const resultModule = await createModule(data.info);

    if (resultModule.error && isApiError(resultModule.error)) {
      setError(resultModule.error.data.message);
      return;
    }

    if (!resultModule.data?.data?._id) {
      return;
    }

    const resultGeneretedModulee = await generateModule(
      resultModule.data?.data?._id,
    );

    if (
      resultGeneretedModulee.error &&
      isApiError(resultGeneretedModulee.error)
    ) {
      setError(resultGeneretedModulee.error.data.message);
      return;
    }

    notification.success("The profile was successfully created");

    router.push("/profile");
  };

  const renderStep = () => {
    switch (manageProfileForm.currentStep) {
      case 0:
        return (
          <NameStep
            value={methods.watch("name")}
            onChange={(value) => methods.setValue("name", value)}
            error={getFieldState("name").error?.message}
          />
        );

      case 1:
        return (
          <AvatarStep
            value={methods.watch("avatar")}
            onChange={(value) => methods.setValue("avatar", value)}
            error={getFieldState("avatar").error?.message}
          />
        );

      case 2:
        return (
          <AboutStep
            value={methods.watch("bio")}
            onChange={(value) => methods.setValue("bio", value)}
            error={getFieldState("bio").error?.message}
          />
        );

      case 3:
        return (
          <ChatStep
            onChange={(value) => methods.setValue("info", value)}
            error={getFieldState("info").error?.message}
          />
        );

      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <StepWrapper
        {...manageProfileForm}
        totalSteps={TOTAL_STEPS}
        progress={((manageProfileForm.currentStep + 1) / TOTAL_STEPS) * 100}
        handleSubmit={handleSubmit(onSubmitForm)}
        title={stepTitles[manageProfileForm.currentStep]}
        error={error}
        isLoading={isLoading}
      >
        {renderStep()}
      </StepWrapper>
    </FormProvider>
  );
};
