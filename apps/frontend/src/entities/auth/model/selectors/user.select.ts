import { RootState } from "@/app/providers/redux-store";

export const selectUserId = (state: RootState) => state.auth.user.id;
export const selectUserEmail = (state: RootState) => state.auth.user.email;
