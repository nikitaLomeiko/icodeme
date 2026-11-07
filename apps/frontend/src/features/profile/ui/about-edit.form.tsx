"use client";

import { Button, Notification, TextareaField } from "@/shared/ui/kit";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSave } from "react-icons/fa";
import { AboutEditFormData, aboutEditSchema } from "../model/validate";
import { IProfileData, useUpdateProfileDataMutation } from "@/entities/profile";
import { isApiError } from "@/shared/api";

interface IProps {
  profileData: IProfileData;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AboutEditForm: React.FC<IProps> = (props) => {
  const { profileData, onCancel, onSuccess } = props;

  const [update] = useUpdateProfileDataMutation();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<AboutEditFormData>({
    resolver: zodResolver(aboutEditSchema),
    defaultValues: {
      about: profileData.about || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    reset({
      about: profileData.about || "",
    });
  }, [profileData, reset]);

  const onSubmit = async (data: AboutEditFormData) => {
    try {
      setError(null);

      const result = await update({ ...profileData, about: data.about });

      if (result.error && isApiError(result.error)) {
        setError(result.error.data.message);
        return;
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save about:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        {error && (
          <Notification
            message={error}
            autoClose={false}
            className="bg-transparent border-none"
          />
        )}
        <TextareaField
          {...register("about")}
          value={watch("about")}
          id="about"
          placeholder="Расскажите о себе..."
          error={errors.about?.message}
          maxLength={2000}
          rows={6}
          autoExpand
          fullWidth
          size="md"
          variant="rounded"
        />
      </div>

      <div className="flex gap-3 justify-end pt-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            reset();
            onCancel();
          }}
          disabled={isSubmitting}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !isDirty || !isValid}
          className="gap-2"
        >
          <FaSave size={16} />
          {isSubmitting ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>
    </form>
  );
};
