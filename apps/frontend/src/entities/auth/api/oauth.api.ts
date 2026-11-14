import { IResponse } from "@/shared/api";
import { authApi } from "./auth.api";
import { IOAuthResponse } from "./types";

export const oauthApi = authApi.injectEndpoints({
  endpoints: (build) => ({
    oauth: build.query<IResponse<string>, string>({
      query: (endpoint) => ({ url: endpoint, method: "GET" }),
    }),
    telegramVerifiy: build.mutation<IResponse<IOAuthResponse>, string>({
      query: (params) => ({
        url: "oauth/telegram/verify",
        method: "POST",
        body: JSON.parse(params),
      }),
    }),
  }),
});

export const { useOauthQuery, useLazyOauthQuery, useTelegramVerifiyMutation } = oauthApi;
