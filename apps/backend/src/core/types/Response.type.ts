export interface IServiceResponse<T = null, K = null> {
  success: boolean;
  data?: T;
  error?: K;
}

export interface IControllerResponse<T = null> {
  success: boolean;
  data?: T;
  message?: string;
}
