// External Supabase client (user's own backend at iupkxkfvqfzwqvocexxr).
// The URL and anon key are publishable values — safe to ship in the bundle.
// This is intentionally separate from the Lovable Cloud client so the two
// don't collide. The Lovable Cloud client at @/integrations/supabase/client
// remains unused.
import { createClient } from "@supabase/supabase-js";

export const EXTERNAL_SUPABASE_URL = "https://iupkxkfvqfzwqvocexxr.supabase.co";
export const EXTERNAL_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1cGt4a2Z2cWZ6d3F2b2NleHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MDk0OTYsImV4cCI6MjA5Mzk4NTQ5Nn0.joMiMwQ57Ta93KXG3cgQ8NncesQM92jEOB_-Tf4rQtk";

export const VERCEL_API_BASE_URL =
  "https://meritus-jcc35h7ox-phanigautham03-9448s-projects.vercel.app";

export const externalSupabase = createClient(
  EXTERNAL_SUPABASE_URL,
  EXTERNAL_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "meritus-external-auth",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
