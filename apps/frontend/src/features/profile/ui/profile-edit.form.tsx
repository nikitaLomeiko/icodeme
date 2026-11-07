"use client";

import { Button, Notification, TextField, Title } from "@/shared/ui/kit";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSave } from "react-icons/fa";
import { ProfileEditFormData, profileEditSchema } from "../model/validate";
import { AvatarList } from "./components/avatar.list";
import {
  illustratedAvatars,
  IProfileData,
  useUpdateProfileDataMutation,
} from "@/entities/profile";
import { isApiError } from "@/shared/api";

interface IProps {
  profileData: IProfileData;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProfileEditForm: React.FC<IProps> = (props) => {
  const { profileData, onCancel, onSuccess } = props;

  const [update] = useUpdateProfileDataMutation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name: profileData.name,
      avatar: profileData.avatar,
    },
    mode: "onChange",
  });

  const avatarValue = watch("avatar");

  useEffect(() => {
    reset({
      name: profileData.name,
      avatar: profileData.avatar,
    });
  }, [profileData, reset]);

  const onSubmit = async (data: ProfileEditFormData) => {
    try {
      setError(null);

      const result = await update({
        ...profileData,
        avatar: data.avatar,
        name: data.name,
      });

      if (result.error && isApiError(result.error)) {
        setError(result.error.data.message);
        return;
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save profile:", error);
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
        <Title size="sm" weight="semibold" className=" !text-[var(--ui-text)]">
          Имя пользователя
        </Title>
        <TextField
          className="-my-2"
          {...register("name")}
          value={watch("name")}
          id="name"
          placeholder="Ваше имя пользователя"
          error={errors.name?.message}
          fullWidth
          size="md"
          variant="rounded"
        />
        <p className="mt-5 text-xs text-gray-500">
          От 2 до 50 символов. Разрешены буквы, цифры, пробелы, - и _
        </p>
      </div>

      <div>
        <Title
          size="sm"
          weight="semibold"
          className="!mb-5 !mt-7 !text-[var(--ui-text)]"
        >
          Аватар
        </Title>
        <AvatarList
          avatars={illustratedAvatars}
          isSelected={(avatarLabel: string) => avatarValue === avatarLabel}
          handleSelect={(value) =>
            setValue("avatar", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          error={errors.avatar?.message}
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
