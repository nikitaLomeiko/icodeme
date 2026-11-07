import { ApiError } from "../types/error.types";

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "data" in error &&
    typeof (error.data as any)?.message === "string"
  );
};
