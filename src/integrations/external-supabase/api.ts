import { externalSupabase, VERCEL_API_BASE_URL } from "./client";

/**
 * Call a Vercel API endpoint with the current user's Supabase JWT.
 * Path can be absolute or relative ("/api/mock-tests").
 */
export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const { data } = await externalSupabase.auth.getSession();
  const token = data.session?.access_token;

  const url = path.startsWith("http") ? path : `${VERCEL_API_BASE_URL}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}
