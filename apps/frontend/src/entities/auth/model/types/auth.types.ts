export interface IAuthState {
  isAuthenticated: boolean | null;
  user: IAuthData;
}

export interface IAuthData {
  id: string;
  email: string;
}
