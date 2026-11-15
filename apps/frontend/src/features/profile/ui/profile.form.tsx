"use client";

import React, { useEffect } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NameStep, AvatarStep, AboutStep, ChatStep } from "./steps";
import { StepWrapper } from "./components/step.wrapper";
import { stepTitles } from "../model/data/step.data";
import {
  ProfileFormData,
  profileSchema,
} from "../model/validate/profile.schema";
import { useProfileForm } from "../model/hooks/use.profile.form";

const totalSteps = 4;

interface IProps {
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  initialValues?: Partial<ProfileFormData>;
}

export const ProfileForm: React.FC<IProps> = ({
  onSubmit,
  isLoading,
  error,
  initialValues,
}) => {
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

  const { reset } = methods;
  useEffect(() => {
    if (initialValues)
      reset(
        { name: "", avatar: "", bio: "", info: "", ...initialValues },
        { keepDirtyValues: true },
      );
  }, [initialValues, reset]);

  const { handleSubmit, getFieldState } = methods;
  const name = useWatch({ control: methods.control, name: "name" });
  const avatar = useWatch({ control: methods.control, name: "avatar" });
  const bio = useWatch({ control: methods.control, name: "bio" });
  const manageProfileForm = useProfileForm({
    methods,
    totalSteps: totalSteps,
  });

  const renderStep = () => {
    switch (manageProfileForm.currentStep) {
      case 0:
        return (
          <NameStep
            value={name}
            onChange={(value) => methods.setValue("name", value)}
            error={getFieldState("name").error?.message}
          />
        );

      case 1:
        return (
          <AvatarStep
            value={avatar}
            onChange={(value) => methods.setValue("avatar", value)}
            error={getFieldState("avatar").error?.message}
          />
        );

      case 2:
        return (
          <AboutStep
            value={bio}
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
        totalSteps={totalSteps}
        progress={((manageProfileForm.currentStep + 1) / totalSteps) * 100}
        handleSubmit={handleSubmit(onSubmit)}
        title={stepTitles[manageProfileForm.currentStep]}
        error={error}
        isLoading={isLoading}
      >
        {renderStep()}
      </StepWrapper>
    </FormProvider>
  );
};
