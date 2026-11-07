"use client";

import React, { useState } from "react";
import {
  RegisterForm,
  ForgotForm,
  LoginForm,
  ResetPasswordForm,
  VerifyForm,
} from "./forms";
import { FormWrapper, AnimatedForm } from "./components";
import { typeMode } from "../model/types/mode.types";
import { useLoginMutation } from "@/entities/auth";
import { setAuthData } from "@/entities/auth/model";
import { useAppDispatch } from "@/shared/lib/hooks";
import { isApiError } from "@/shared/api";

interface RegistrationCredentials {
  email: string;
  password: string;
}

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [resetToken, setResetToken] = useState("");
  const [mode, setMode] = useState<typeMode>("login");
  const [error, setError] = useState<string | null>(null);
  const [registrationCredentials, setRegistrationCredentials] =
    useState<RegistrationCredentials | null>(null);
  const [isCompletingRegistration, setIsCompletingRegistration] =
    useState(false);
  const [login] = useLoginMutation();
  const dispatch = useAppDispatch();

  const handleRegistrationConfirmed = async () => {
    if (!registrationCredentials) {
      setMode("login");
      setError("Почта подтверждена. Войдите в аккаунт, чтобы продолжить.");
      return;
    }

    setError(null);
    setIsCompletingRegistration(true);

    try {
      const result = await login(registrationCredentials);

      if (result.error) {
        setError(
          isApiError(result.error)
            ? result.error.data.message
            : "Почта подтверждена, но войти автоматически не удалось. Войдите вручную.",
        );
        setRegistrationCredentials(null);
        setMode("login");
        return;
      }

      const authData = result.data?.data;
      if (!authData) {
        setError(
          "Почта подтверждена, но войти автоматически не удалось. Войдите вручную.",
        );
        setRegistrationCredentials(null);
        setMode("login");
        return;
      }

      dispatch(
        setAuthData({
          email: authData.email,
          id: authData.userId,
        }),
      );
      setRegistrationCredentials(null);
      onSuccess?.();
    } finally {
      setIsCompletingRegistration(false);
    }
  };

  const handleLoginSuccess = () => {
    setRegistrationCredentials(null);
    onSuccess?.();
  };

  return (
    <FormWrapper error={error} mode={mode} onMode={setMode}>
      <AnimatedForm mode={mode}>
        {mode === "login" && (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onForgotClick={() => setMode("forgot")}
            setError={setError}
          />
        )}
        {mode === "register" && (
          <RegisterForm
            setError={setError}
            onSuccess={(credentials) => {
              setRegistrationCredentials(credentials);
              setMode("verify");
            }}
          />
        )}
        {mode === "forgot" && (
          <ForgotForm
            setError={setError}
            onSuccess={() => setMode("verify-reset")}
          />
        )}
        {mode === "verify" && (
          <VerifyForm
            typeConfirm="code-email"
            setError={setError}
            onSuccess={handleRegistrationConfirmed}
            isProcessing={isCompletingRegistration}
          />
        )}
        {mode === "verify-reset" && (
          <VerifyForm
            typeConfirm="code-reset-password"
            setError={setError}
            onSuccess={(token) => {
              if (!token) {
                setError("Подтвердите сброс пароля заново");
                return;
              }
              setResetToken(token);
              setMode("reset");
            }}
          />
        )}
        {mode === "reset" && (
          <ResetPasswordForm
            resetToken={resetToken}
            setError={setError}
            onSuccess={() => {
              setResetToken("");
              setMode("login");
            }}
          />
        )}
      </AnimatedForm>
    </FormWrapper>
  );
};
