import { handlers } from "@/lib/auth";

// ─── NextAuth Catch-All Route ───
// NextAuth v5 uses a single catch-all route to handle all auth endpoints:
// GET  /api/auth/signin, /api/auth/callback/:provider, /api/auth/signout
// POST /api/auth/signin/:provider, /api/auth/signout
// We just re-export the handlers that were configured in lib/auth.ts

export const { GET, POST } = handlers;
