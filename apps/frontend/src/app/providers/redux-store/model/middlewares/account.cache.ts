import { type Middleware } from "@reduxjs/toolkit";
import { authApi } from "@/entities/auth";
import { profileApi } from "@/entities/profile";
import { resetStudyState, studyApi } from "@/entities/study";
import {
  documentApi,
  documentFavoriteStore,
  documentOptionStore,
  documentSearchStore,
} from "@/entities/document";
import { ideApi } from "@/features/ide";

export const accountCache: Middleware = (api) => (next) => (action) => {
  const previous = api.getState().auth;
  const result = next(action);
  const current = api.getState().auth;

  if (
    previous.user.id !== current.user.id ||
    previous.isAuthenticated !== current.isAuthenticated
  ) {
    documentFavoriteStore.reset();
    documentOptionStore.reset();
    documentSearchStore.reset();
    api.dispatch(resetStudyState());

    for (const endpoint of [authApi, profileApi, studyApi, documentApi, ideApi])
      api.dispatch(endpoint.util.resetApiState());
  }
  return result;
};
