"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, CodeField, useNotification } from "@/shared/ui/kit";
import { IBaseFormProps } from "../../model/types/form.props";
import { VerifyFormData, verifySchema } from "../../model/validate/auth.schema";
import { selectUserId, useConfirmCodeMutation } from "@/entities/auth";
import { useAppSelector } from "@/shared/lib/hooks";
import { isApiError } from "@/shared/api";

interface VerifyFormProps extends Omit<IBaseFormProps, "onSuccess"> {
  onSuccess?: (resetToken?: string) => void | Promise<void>;
  typeConfirm: string;
  isProcessing?: boolean;
}

export const VerifyForm: React.FC<VerifyFormProps> = ({
  setError,
  onSuccess,
  typeConfirm,
  isProcessing = false,
}) => {
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const codeValue = watch("code");

  const [confirm, { isLoading }] = useConfirmCodeMutation();
  const notification = useNotification();
  const userId = useAppSelector(selectUserId);

  const handleVerify = async (data: VerifyFormData) => {
    setError(null);

    const result = await confirm({ code: data.code, userId, typeConfirm });

    if (result.error && isApiError(result.error)) {
      setError(result.error.data.message);
      return;
    }
    if (result.data) {
      notification.success(result.data.message || "Почта подтверждена");
      await onSuccess?.(result.data.data?.resetToken);
    }
  };

  const handleCodeChange = (value: string) => {
    setValue("code", value);
  };

  return (
    <form onSubmit={handleSubmit(handleVerify)} className="space-y-4">
      <CodeField
        length={5}
        value={codeValue}
        onChange={handleCodeChange}
        disabled={isLoading || isProcessing}
        error={errors.code?.message}
        autoFocus
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        isLoading={isLoading || isProcessing}
        disabled={isLoading || isProcessing}
      >
        Подтвердить
      </Button>
    </form>
  );
};
