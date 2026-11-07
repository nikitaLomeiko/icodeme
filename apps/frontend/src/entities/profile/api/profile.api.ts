import { fetchBase, IResponse } from "@/shared/api";
import { createApi } from "@reduxjs/toolkit/query/react";
import { IProfile } from "../model";
import { ICreateProfileParams } from "./types";

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBase,
  tagTypes: ["Profile"],
  endpoints: (build) => ({
    getProfile: build.query<IResponse<IProfile>, null>({
      query: () => ({
        url: "profiles/me",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),
    createProfile: build.mutation<IResponse<IProfile>, ICreateProfileParams>({
      query: ({ about, avatar, name }) => ({
        url: "profiles/me",
        method: "POST",
        body: {
          profileData: { about, avatar, name },
        },
      }),
      invalidatesTags: ["Profile"],
    }),
    updateProfileData: build.mutation<
      IResponse<IProfile>,
      ICreateProfileParams
    >({
      query: ({ about, avatar, name }) => ({
        url: "profiles/me",
        method: "PUT",
        body: {
          profileData: { about, avatar, name },
        },
      }),
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useCreateProfileMutation,
  useUpdateProfileDataMutation,
} = profileApi;
