"use client";

import { useCallback } from "react";
import { useLazyVerifyTokenQuery } from "../../api/auth.api";
import { setAuthData } from "../slice";
import { useAppDispatch } from "@/shared/lib";
import { announceSession } from "@/shared/api";

export const useOAuthSession = () => {
  const dispatch = useAppDispatch();
  const [verify] = useLazyVerifyTokenQuery();

  return useCallback(async () => {
    const result = await verify(null);
    const user = result.data?.data;
    if (!user) return false;

    dispatch(setAuthData({ id: user.userId, email: user.email }));
    announceSession();
    return true;
  }, [dispatch, verify]);
};
