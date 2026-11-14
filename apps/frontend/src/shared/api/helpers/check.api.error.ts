import { ApiError } from "../types/error.types";

export const isApiError = (error: unknown): error is ApiError => {
  const data =
    typeof error === "object" && error !== null && "data" in error
      ? error.data
      : null;

  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "data" in error &&
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  );
};
