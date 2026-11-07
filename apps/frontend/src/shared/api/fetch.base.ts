import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
} from "@reduxjs/toolkit/query";
import type { ApiError } from "./types/error.types";
import { BASE_URL } from "./consts";
import {
  announceSession,
  invalidateSession,
  sessionLock,
  sessionRevision,
} from "./session";

const query = fetchBaseQuery({ baseUrl: BASE_URL, credentials: "include" });
const stale = () => ({
  error: {
    status: 409,
    data: {
      message: "Сессия изменилась. Повторите запрос.",
      error: "SESSION_CHANGED",
    },
  },
});

export const fetchBase: BaseQueryFn<
  string | FetchArgs,
  unknown,
  ApiError
> = async (args, api, extraOptions) => {
  const url = typeof args === "string" ? args : args.url;
  const changesSession = [
    "auth/login",
    "auth/logout",
    "oauth/telegram/verify",
  ].includes(url);
  const protectedRequest =
    !url.startsWith("oauth/") &&
    (!url.startsWith("auth/") ||
      ["auth/verify-token", "auth/validate/tokens"].includes(url));
  const revision = changesSession ? invalidateSession() : sessionRevision();
  const perform = async () => query(args, api, extraOptions);
  let result = changesSession ? await sessionLock(perform) : await perform();
  if (revision !== sessionRevision()) return stale();

  if (result.error?.status === 401 && protectedRequest) {
    // Recheck inside the lock: another request/tab may already have refreshed.
    result = await sessionLock(async () => {
      if (revision !== sessionRevision()) return stale();
      const current = await query("auth/verify-token", api, extraOptions);
      if (current.error?.status === 401) {
        const refreshed = await query(
          { url: "auth/refresh", method: "POST" },
          api,
          extraOptions,
        );
        if (refreshed.error) return refreshed;
      } else if (current.error) return current;
      if (revision !== sessionRevision()) return stale();
      return perform();
    });
    if (revision !== sessionRevision()) return stale();
    if (result.error?.status === 401) {
      invalidateSession();
      api.dispatch({ type: "auth/logout" });
    }
  }
  if (changesSession && !result.error) {
    if (url === "auth/logout") api.dispatch({ type: "auth/logout" });
    announceSession();
  }
  if (result.error) {
    const error = result.error;
    return {
      error: {
        status: typeof error.status === "number" ? error.status : 503,
        data:
          error.data &&
          typeof error.data === "object" &&
          "message" in error.data
            ? (error.data as ApiError["data"])
            : {
                message: "Сервер недоступен. Повторите попытку.",
                error: "NETWORK_ERROR",
              },
      },
    };
  }
  return result;
};
