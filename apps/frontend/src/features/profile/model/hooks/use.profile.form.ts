import { useState } from "react";
import { ProfileFormData } from "../validate/profile.schema";
import { UseFormReturn } from "react-hook-form";

interface IProps {
  totalSteps: number;
  methods: UseFormReturn<ProfileFormData>;
}

export const useProfileForm = (props: IProps) => {
  const { totalSteps, methods } = props;

  const [currentStep, setCurrentStep] = useState(0);

  const validateCurrentStep = async (): Promise<boolean> => {
    const fieldNames: Record<number, keyof ProfileFormData> = {
      0: "name",
      1: "avatar",
      2: "bio",
      3: "info",
    };

    const field = fieldNames[currentStep];
    const isValid = await methods.trigger(field);

    if (!isValid) {
      methods.setError(field, {
        type: "manual",
        message:
          methods.formState.errors[field]?.message || "Неверно указанное поле",
      });

      const element = document.querySelector(
        `[name="${field}"]`,
      ) as HTMLElement | null;
      element?.focus();
    }

    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return { currentStep, handleNext, handleBack };
};
