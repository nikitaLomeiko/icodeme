export interface IAuthTokenPayload {
  sub: string;
  login: string;
  type: 'access' | 'refresh';
  sid: string;
  version: number;
}
