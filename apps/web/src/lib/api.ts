export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;

  // We explicitly want credentials to pass the HTTP-only cookie
  const config: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    // We let the caller decide what to do with a 401 specifically
    // to prevent infinite loops (e.g. login itself throwing 401).
    throw {
      status: response.status,
      message: data.message || "An API error occurred",
      data,
    };
  }

  return data;
}
