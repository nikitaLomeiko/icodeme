"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/entities/auth";
import { Button } from "@/shared/ui/kit";

export const LogoutButton: React.FC = () => {
  const [logout, { isLoading }] = useLogoutMutation();
  const [hasError, setHasError] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setHasError(false);
    const result = await logout();
    if (result.error) {
      setHasError(true);
      return;
    }
    router.replace("/auth");
  };

  return (
    <section className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] p-5">
      <Button
        variant="outline"
        onClick={handleLogout}
        isLoading={isLoading}
        disabled={isLoading}
      >
        Выйти из аккаунта
      </Button>
      {hasError && (
        <p role="alert" className="mt-2">
          Не удалось завершить сессию на сервере. Повторите попытку.
        </p>
      )}
    </section>
  );
};
