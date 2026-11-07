import { fetchBase, IResponse } from "@/shared/api";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  ICreateDocumentFavoriteParams,
  IDeleteFavoriteParams,
  IGetDocumentFavoriteParams,
} from "./types/document.api.types";
import { IFavorite } from "../model/types";

export const documentApi = createApi({
  reducerPath: "documentApi",
  baseQuery: fetchBase,
  endpoints: (build) => ({
    createNewFavorite: build.mutation<
      IResponse<null>,
      ICreateDocumentFavoriteParams
    >({
      query: (params) => ({
        url: "profiles/me/storage/document/favorite",
        method: "POST",
        body: params,
      }),
    }),
    getDocumentFavorite: build.query<
      IResponse<IFavorite>,
      IGetDocumentFavoriteParams
    >({
      query: (params) => ({
        url: `profiles/me/storage/document/favorite?documentId=${params.documentId}`,
        method: "GET",
      }),
    }),

    deleteFavorite: build.mutation<IResponse<null>, IDeleteFavoriteParams>({
      query: (params) => ({
        url: "profiles/me/storage/document/favorite",
        method: "DELETE",
        body: params,
      }),
    }),
  }),
});

export const {
  useCreateNewFavoriteMutation,
  useGetDocumentFavoriteQuery,
  useLazyGetDocumentFavoriteQuery,
  useDeleteFavoriteMutation,
} = documentApi;
