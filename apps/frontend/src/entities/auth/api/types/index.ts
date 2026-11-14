export interface IAuth {
  userId: string;
  email: string;
}
export type IAuthResponse = IAuth;

export interface ILoginParams {
  email: string;
  password: string;
}
export interface IRegisterParams {
  email: string;
  password: string;
}
export interface IUserIdResponse {
  userId: string;
}
export interface IResetPasswordParams {
  userId: string;
  resetToken: string;
  newPassword: string;
}
export interface IConfirmCodeParams {
  code: string;
  userId: string;
  typeConfirm: string;
}
export interface IOAuthResponse {
  userId: string;
}
