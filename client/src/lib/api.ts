// API configuration for Vercel + Koyeb deployment
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://0.0.0.0:5000";

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
