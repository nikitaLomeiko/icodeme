"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaEnvelope } from "react-icons/fa";
import {
  PasswordField,
  TextField,
  Button,
  Checkbox,
  useNotification,
} from "@/shared/ui/kit";
import { IBaseFormProps } from "../../model/types/form.props";
import {
  RegisterFormData,
  registerSchema,
} from "../../model/validate/auth.schema";
import { setUserId, useRegisterMutation } from "@/entities/auth";
import { isApiError } from "@/shared/api";
import { useAppDispatch } from "@/shared/lib/hooks";

interface RegisterFormProps extends Omit<IBaseFormProps, "onSuccess"> {
  onSuccess?: (credentials: { email: string; password: string }) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  setError,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: false,
    },
  });

  const [reg, { isLoading }] = useRegisterMutation();
  const notification = useNotification();

  const dispatch = useAppDispatch();

  const handleRegister = async (data: RegisterFormData) => {
    setError(null);

    const result = await reg({
      password: data.password,
      email: data.email,
    });

    if (result.error && isApiError(result.error)) {
      setError(result.error.data.message);
      return;
    }

    if (result.data) {
      dispatch(setUserId(result.data?.data?.userId || ""));
      notification.info(result.data.message || "");
      onSuccess?.({ email: data.email, password: data.password });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleRegister)} className="space-y-2">
      <div className="flex flex-col gap-7">
        <TextField
          id="email"
          label="Почта"
          size="lg"
          type="email"
          variant="underline"
          {...register("email")}
          icon={FaEnvelope}
          required
          error={errors.email?.message}
          disabled={isLoading}
        />

        <PasswordField
          id="password"
          label="Пароль"
          size="lg"
          variant="underline"
          {...register("password")}
          required
          error={errors.password?.message}
          disabled={isLoading}
        />

        <PasswordField
          id="confirmPassword"
          size="lg"
          label="Подтвердите пароль"
          variant="underline"
          {...register("confirmPassword")}
          required
          error={errors.confirmPassword?.message}
          disabled={isLoading}
        />
      </div>

      <Checkbox
        className="mt-5"
        id="terms"
        checked={watch("agreedToTerms")}
        onChange={(checked) => setValue("agreedToTerms", checked)}
        disabled={isLoading}
        error={errors.agreedToTerms?.message}
        label={
          <span className="text-sm">
            Согласен с{" "}
            <a
              href="#"
              className="text-[var(--ui-primary)] hover:text-[var(--ui-primary-hover)]"
            >
              условиями
            </a>
          </span>
        }
      />

      <Button
        type="submit"
        variant="outline"
        size="md"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading}
        className="mt-4"
      >
        Создать аккаунт
      </Button>
    </form>
  );
};
