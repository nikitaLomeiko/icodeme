export type IAuthResponse = IAuth;

export interface IAuth {
  userId: string;
  email: string;
}

export interface ILoginParams {
  email: string;
  password: string;
}
