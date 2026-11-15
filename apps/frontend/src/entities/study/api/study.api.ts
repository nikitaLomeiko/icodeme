import { fetchBase, IResponse } from "@/shared/api";
import { createApi } from "@reduxjs/toolkit/query/react";
import { IStudy } from "../model";

interface StepLocation {
  studyId: string;
  moduleIndex: number;
  levelIndex: number;
  stepIndex: number;
}

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
    generateModules: build.mutation<IResponse<IStudy["studyPlanJSON"]>, string>(
      {
        query: (studyId) => ({
          url: "study/modules",
          method: "POST",
          body: { studyId },
        }),
        invalidatesTags: ["Study"],
      },
    ),
    generateLevels: build.mutation<
      IResponse<unknown>,
      Pick<StepLocation, "studyId" | "moduleIndex">
    >({
      query: (body) => ({ url: "study/levels", method: "POST", body }),
      invalidatesTags: ["Study"],
    }),
    generateSteps: build.mutation<
      IResponse<unknown>,
      Omit<StepLocation, "stepIndex">
    >({
      query: (body) => ({ url: "study/steps", method: "POST", body }),
      invalidatesTags: ["Study"],
    }),
    generateDocumentation: build.mutation<IResponse<string>, StepLocation>({
      query: (body) => ({ url: "study/steps/doc", method: "POST", body }),
      invalidatesTags: ["Study"],
    }),
    generatePractice: build.mutation<IResponse<string>, StepLocation>({
      query: (body) => ({ url: "study/steps/code", method: "POST", body }),
      invalidatesTags: ["Study"],
    }),
    generateQuiz: build.mutation<IResponse<unknown>, StepLocation>({
      query: (body) => ({ url: "study/steps/quiz", method: "POST", body }),
      invalidatesTags: ["Study"],
    }),
    submitQuiz: build.mutation<
      IResponse<{ correct: number; total: number; completed: boolean }>,
      StepLocation & { answers: Record<string, string | string[]> }
    >({
      query: (body) => ({
        url: "study/steps/quiz/submit",
        method: "POST",
        body,
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
  useGenerateModulesMutation,
  useGenerateLevelsMutation,
  useGenerateStepsMutation,
  useGenerateDocumentationMutation,
  useGeneratePracticeMutation,
  useGenerateQuizMutation,
  useSubmitQuizMutation,
} = studyApi;
