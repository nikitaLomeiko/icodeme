"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordField, Button, useNotification } from "@/shared/ui/kit";
import { IBaseFormProps } from "../../model/types/form.props";
import {
  ResetPasswordFormData,
  resetPasswordSchema,
} from "../../model/validate/auth.schema";
import { selectUserId, useResetPasswordMutation } from "@/entities/auth";
import { useAppSelector } from "@/shared/lib/hooks";
import { isApiError } from "@/shared/api";

export const ResetPasswordForm: React.FC<
  IBaseFormProps & { resetToken: string }
> = ({ resetToken, setError, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const [reset, { isLoading }] = useResetPasswordMutation();
  const userId = useAppSelector(selectUserId);
  const notification = useNotification();

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setError(null);

    const result = await reset({
      userId,
      resetToken,
      newPassword: data.password,
    });

    if (result.error && isApiError(result.error)) {
      setError(result.error.data.message);
      return;
    }

    notification.success(result.data?.message || "");

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-2">
      <PasswordField
        id="password"
        label="Новый пароль"
        variant="underline"
        {...register("password")}
        required
        error={errors.password?.message}
        disabled={isLoading}
      />

      <PasswordField
        id="confirmPassword"
        label="Подтвердите новый пароль"
        variant="underline"
        {...register("confirmPassword")}
        required
        error={errors.confirmPassword?.message}
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading}
      >
        Сбросить пароль
      </Button>
    </form>
  );
};
