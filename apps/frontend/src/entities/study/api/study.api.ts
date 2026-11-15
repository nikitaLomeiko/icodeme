import { fetchBase, IResponse } from "@/shared/api";
import { createApi } from "@reduxjs/toolkit/query/react";
import { IStudy } from "../model";

export const studyApi = createApi({
  reducerPath: "studyApi",
  baseQuery: fetchBase,
  tagTypes: ["Study"],
  endpoints: (build) => ({
    createStudy: build.mutation<IResponse<IStudy>, string>({
      query: (context) => ({
        url: "study/me",
        method: "POST",
        body: { context },
      }),
      invalidatesTags: ["Study"],
    }),
    getStudies: build.query<IResponse<IStudy[]>, null>({
      query: () => ({
        url: "study/me",
        method: "GET",
      }),
      providesTags: ["Study"],
    }),
    getStudyById: build.query<IResponse<IStudy>, string>({
      query: (id) => ({
        url: `study/me/${encodeURIComponent(id)}`,
        method: "GET",
      }),
      providesTags: ["Study"],
    }),
    deleteStudy: build.mutation<IResponse<void>, string>({
      query: (id) => ({
        url: `study/me/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Study"],
    }),
    addInitialTestModule: build.mutation<IResponse<IStudy>, string>({
      query: (studyId) => ({
        url: "study/test/modules",
        method: "POST",
        body: { studyId },
      }),
      invalidatesTags: ["Study"],
    }),
  }),
});

export const {
  useGetStudiesQuery,
  useGetStudyByIdQuery,
  useLazyGetStudiesQuery,
  useDeleteStudyMutation,
  useCreateStudyMutation,
  useAddInitialTestModuleMutation,
} = studyApi;
