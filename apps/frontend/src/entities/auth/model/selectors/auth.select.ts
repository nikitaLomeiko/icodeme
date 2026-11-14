import type { IAuthState } from "../types";

interface AuthStoreState {
  auth: IAuthState;
}

export const selectIsAuthenticated = (state: AuthStoreState) =>
  state.auth.isAuthenticated;
