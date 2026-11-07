"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "react-redux";
import type { RootState } from "@/app/providers/redux-store";
import { setAuthData, useLazyVerifyTokenQuery } from "@/entities/auth";
import { useAppDispatch } from "@/shared/lib/hooks";
import {
  invalidateSession,
  sessionRevision,
  subscribeSession,
} from "@/shared/api/session";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const [verify] = useLazyVerifyTokenQuery();
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    try {
      localStorage.removeItem("auth_token");
    } catch {}
    return subscribeSession(() => {
      invalidateSession();
      window.location.reload();
    });
  }, []);
  useEffect(() => {
    if (
      ["/oauth/success", "/oauth/telegram"].includes(pathname) ||
      store.getState().auth.isAuthenticated !== null
    )
      return;
    let active = true;
    const revision = sessionRevision();
    void verify(null).then((result) => {
      if (!active || revision !== sessionRevision()) return;
      if (result.data?.data)
        dispatch(
          setAuthData({
            id: result.data.data.userId,
            email: result.data.data.email,
          }),
        );
      else if (result.error && store.getState().auth.isAuthenticated === null)
        setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [attempt, dispatch, pathname, store, verify]);
  if (failed)
    return (
      <div role="alert" className="p-6 text-center">
        Не удалось проверить сессию.{" "}
        <button
          onClick={() => {
            setFailed(false);
            setAttempt((value) => value + 1);
          }}
        >
          Повторить
        </button>
      </div>
    );
  return children;
};
