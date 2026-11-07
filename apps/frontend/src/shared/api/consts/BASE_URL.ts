const localApiUrl =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? `http://${window.location.hostname}:3000/`
    : "http://localhost:3000/";

export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || localApiUrl;
