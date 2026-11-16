import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { timingSafeEqual } from "node:crypto";
import { submitUrlsForIndexing } from "@/lib/google-indexing.server";

const MAX_URLS = 50;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function secretsEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length || ab.length === 0) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * POST /api/indexing  { "urls": ["https://<this-site>/articles/<slug>", ...] }
 * Protected by INDEXING_ROUTE_SECRET bearer token. Only URLs belonging to
 * this site's own origin are accepted (no open-proxy indexing).
 * Called by the publishing pipeline after each successful deploy batch.
 */
export const Route = createFileRoute("/api/indexing")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const expected = process.env.INDEXING_ROUTE_SECRET || "";
        if (!expected) {
          return json(500, { ok: false, error: "indexing not configured" });
        }
        const auth = request.headers.get("authorization") || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (!secretsEqual(token, expected)) {
          return json(401, { ok: false, error: "unauthorized" });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json(400, { ok: false, error: "invalid JSON body" });
        }
        const raw = (body as { urls?: unknown })?.urls;
        const urls = Array.isArray(raw) ? raw.filter((u): u is string => typeof u === "string") : [];
        if (urls.length === 0) return json(400, { ok: false, error: "no urls provided" });
        if (urls.length > MAX_URLS) {
          return json(400, { ok: false, error: `max ${MAX_URLS} urls per request` });
        }

        const origin = new URL(request.url).origin;
        const own = urls.filter((u) => {
          try {
            return new URL(u).origin === origin;
          } catch {
            return false;
          }
        });
        if (own.length === 0) {
          return json(400, { ok: false, error: "urls must belong to this site" });
        }

        try {
          const results = await submitUrlsForIndexing(own);
          const failed = results.filter((r) => !r.ok).length;
          return json(200, { ok: failed === 0, submitted: results.length, failed, results });
        } catch (e) {
          return json(502, { ok: false, error: String(e).slice(0, 300) });
        }
      },
    },
  },
});
