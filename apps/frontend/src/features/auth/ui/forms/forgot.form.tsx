"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaEnvelope } from "react-icons/fa";
import { TextField, Button, useNotification } from "@/shared/ui/kit";
import { IBaseFormProps } from "../../model/types/form.props";
import { ForgotFormData, forgotSchema } from "../../model/validate/auth.schema";
import { setUserId, useSendConfirmCodeMutation } from "@/entities/auth";
import { isApiError } from "@/shared/api";
import { useAppDispatch } from "@/shared/lib/hooks";

export const ForgotForm: React.FC<IBaseFormProps> = ({
  setError,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const [send, { isLoading }] = useSendConfirmCodeMutation();
  const dispatch = useAppDispatch();
  const notification = useNotification();

  const handleForgot = async (data: ForgotFormData) => {
    setError(null);
    const result = await send(data.email);

    if (result.error && isApiError(result.error)) {
      setError(result.error.data.message);
      return;
    }

    if (result.data) {
      dispatch(setUserId(result.data?.data?.userId || ""));
      notification.info(result.data.message || "");
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleForgot)} className="space-y-2">
      <TextField
        id="email"
        label="Email"
        variant="underline"
        type="email"
        {...register("email")}
        icon={FaEnvelope}
        required
        error={errors.email?.message}
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="outline"
        size="md"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading}
      >
        Отправить инструкции
      </Button>
    </form>
  );
};
