import type { IAuthState } from "../types";

interface AuthStoreState {
  auth: IAuthState;
}

export const selectUserId = (state: AuthStoreState) => state.auth.user.id;
export const selectUserEmail = (state: AuthStoreState) => state.auth.user.email;
