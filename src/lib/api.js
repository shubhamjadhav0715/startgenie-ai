const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export function getToken() {
  return localStorage.getItem("token") || "";
}

export function setSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function api(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJson ? payload.error || "Request failed" : "Request failed";
    throw new Error(message);
  }

  return payload;
}

export { API_BASE_URL };
