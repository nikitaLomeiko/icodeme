"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  PasswordField,
  TextField,
  Button,
  useNotification,
} from "@/shared/ui/kit";
import { FaEnvelope } from "react-icons/fa";
import { IBaseFormProps } from "../../model/types/form.props";
import { LoginFormData, loginSchema } from "../../model/validate/auth.schema";
import { useAppDispatch } from "@/shared/lib/hooks";
import { setAuthData } from "@/entities/auth/model";
import { useLoginMutation } from "@/entities/auth";
import { isApiError } from "@/shared/api";

interface LoginFormProps extends IBaseFormProps {
  onForgotClick: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onForgotClick,
  onSuccess,
  setError,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [login, { isLoading }] = useLoginMutation();
  const notification = useNotification();
  const dispatch = useAppDispatch();

  const handleLogin = async (data: LoginFormData) => {
    setError(null);

    const result = await login(data);

    if (result.error && isApiError(result.error)) {
      setError(result.error.data.message);
      return;
    }

    const resultData = result.data?.data;

    if (resultData) {
      dispatch(
        setAuthData({
          email: resultData.email,
          id: resultData.userId,
        }),
      );

      notification.success(result.data?.message || "");

      onSuccess?.();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleLogin)}
      className="space-y-2 mb-5 flex flex-col"
    >
      <div className="flex flex-col gap-10">
        <TextField
          id="email"
          label="Почта"
          type="email"
          size="lg"
          {...register("email")}
          icon={FaEnvelope}
          required
          error={errors.email?.message}
          disabled={isLoading}
          variant="underline"
        />
        <PasswordField
          id="password"
          label="Пароль"
          size="lg"
          {...register("password")}
          required
          error={errors.password?.message}
          variant="underline"
          disabled={isLoading}
        />
      </div>
      <div className="flex justify-end mt-4">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onForgotClick}
          disabled={isLoading}
        >
          Забыли пароль?
        </Button>
      </div>
      <Button
        className="mt-2"
        type="submit"
        variant="outline"
        size="lg"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading}
      >
        Войти
      </Button>
    </form>
  );
};
