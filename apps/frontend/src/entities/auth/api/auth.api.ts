import {
  IAuth,
  IAuthResponse,
  ILoginParams,
  IConfirmCodeParams,
  IOAuthResponse,
  IRegisterParams,
  IUserIdResponse,
  IResetPasswordParams,
} from "./types";
import { fetchBase, IResponse } from "@/shared/api";
import { createApi } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBase,
  endpoints: (build) => ({
    logout: build.mutation<IResponse<null>, void>({
      query: () => ({ url: "auth/logout", method: "POST" }),
    }),
    login: build.mutation<IResponse<IAuthResponse>, ILoginParams>({
      query: (params) => ({
        url: "auth/login",
        method: "POST",
        body: params,
      }),
    }),
    register: build.mutation<IResponse<IUserIdResponse>, IRegisterParams>({
      query: (params) => ({
        url: "auth/register",
        method: "POST",
        body: params,
      }),
    }),
    confirmCode: build.mutation<
      IResponse<{ resetToken?: string }>,
      IConfirmCodeParams
    >({
      query: (params) => ({
        url: `auth/confirm/${params.typeConfirm}`,
        method: "POST",
        body: { code: params.code, userId: params.userId },
      }),
    }),
    sendConfirmCode: build.mutation<IResponse<IUserIdResponse>, string>({
      query: (email) => ({
        url: `auth/send/confirm-code`,
        method: "POST",
        body: { email },
      }),
    }),
    resetPassword: build.mutation<IResponse<string>, IResetPasswordParams>({
      query: (params) => ({
        url: `auth/reset/password`,
        method: "POST",
        body: params,
      }),
    }),
    verifyToken: build.query<IResponse<IAuth>, null>({
      query: () => ({
        url: "auth/verify-token",
      }),
    }),
    oauth: build.query<IResponse<string>, string>({
      query: (endpoint) => ({
        url: endpoint,
        method: "GET",
      }),
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

export const {
  useOauthQuery,
  useLoginMutation,
  useLogoutMutation,
  useLazyOauthQuery,
  useRegisterMutation,
  useVerifyTokenQuery,
  useConfirmCodeMutation,
  useLazyVerifyTokenQuery,
  useResetPasswordMutation,
  useSendConfirmCodeMutation,
  useTelegramVerifiyMutation,
} = authApi;
