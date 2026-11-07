import { configureStore } from "@reduxjs/toolkit";
import { authSliceReducer } from "@/entities/auth";
import { authApi } from "@/entities/auth";
import { profileApi } from "@/entities/profile";
import { studyApi, studySliceReducer } from "@/entities/study";
import { documentApi } from "@/entities/document";
import { ideApi } from "@/entities/ide";
import { accountCache } from "./middlewares/account.cache";

export const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    study: studySliceReducer,
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [studyApi.reducerPath]: studyApi.reducer,
    [documentApi.reducerPath]: documentApi.reducer,
    [ideApi.reducerPath]: ideApi.reducer,
  },

  devTools: process.env.NODE_ENV !== "production",

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      accountCache,
      authApi.middleware,
      profileApi.middleware,
      studyApi.middleware,
      documentApi.middleware,
      ideApi.middleware,
    ]),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
