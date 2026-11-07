import { RootState } from "@/app/providers/redux-store";

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
