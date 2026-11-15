const configuredUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const localApiUrl =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? `http://${window.location.hostname}:3000/`
    : undefined;

export const baseUrl = configuredUrl || localApiUrl || "/api/";
