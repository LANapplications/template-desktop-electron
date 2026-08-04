import { authService } from "../auth/authService";
import { apiConfig } from "../config/authConfig";

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = await authService.getAccessToken();

  const res = await fetch(`${apiConfig.baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    // El backend responde { status, message }.
    let message = `Error ${res.status}`;
    try {
      const data = (await res.json()) as { message?: string };
      if (data?.message) message = data.message;
    } catch {
      // respuesta sin cuerpo JSON
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}


export const httpClient = {
  get: <T>(path: string): Promise<T> => request<T>("GET", path),
  post: <T>(path: string, body: unknown): Promise<T> =>
    request<T>("POST", path, body),
  put: <T>(path: string, body: unknown): Promise<T> =>
    request<T>("PUT", path, body),
  delete: <T>(path: string): Promise<T> => request<T>("DELETE", path),
};
