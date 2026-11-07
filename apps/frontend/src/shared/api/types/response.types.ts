export interface IResponse<T = null> {
  success: boolean;
  data?: T;
  message?: string;
}
