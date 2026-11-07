export type ApiError = {
  status: number;
  data: IBodyError;
};

export interface IBodyError {
  message: string;
  error: string;
}
