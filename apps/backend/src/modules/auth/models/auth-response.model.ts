export interface IAuthResponse extends ITokenResponse {
  userId: string;
  email: string;
}

export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IUserIdResponse {
  userId: string;
}
