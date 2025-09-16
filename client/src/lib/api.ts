// API configuration for multiple deployment environments
const getApiBaseUrl = () => {
  // Use explicit environment variable if set (e.g., Vercel -> Replit)
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  // For browser environments, detect current domain
  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;

    // Local development detection
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0"
    ) {
      return "http://0.0.0.0:5000";
    }

    // Production deployments - use current domain
    return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  }

  // Fallback for SSR or non-browser environments
  return "http://0.0.0.0:5000";
};

const API_BASE_URL = getApiBaseUrl();

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const url = API_BASE_URL + endpoint;
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

export { API_BASE_URL };
