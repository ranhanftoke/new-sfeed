// src/lib/google-indexing.server.ts — SERVER ONLY. Never import from client code.
// Submits article URLs to the Google Indexing API using a service-account
// JSON stored in the INDEX environment variable (Vercel env, never in git).
import { createSign } from "node:crypto";

const INDEXING_SCOPE = "https://www.googleapis.com/auth/indexing";
const PUBLISH_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish";

function b64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri: string;
}

function loadServiceAccount(): ServiceAccount {
  // Accept any casing of the variable name (index / Index / INDEX), plus GOOGLE_INDEXING_KEY.
  const key = Object.keys(process.env).find((k) => k.toLowerCase() === "index" || k === "GOOGLE_INDEXING_KEY");
  const raw = (key && process.env[key]) || "";
  if (!raw) throw new Error("Google indexing key not configured (index env var missing)");
  let parsed: Record<string, string>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("INDEX env var is not valid JSON");
  }
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("INDEX env var is not a valid service-account JSON");
  }
  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key,
    token_uri: parsed.token_uri || "https://oauth2.googleapis.com/token",
  };
}

let cachedToken: { token: string; exp: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 120 > now) return cachedToken.token;

  const sa = loadServiceAccount();
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: INDEXING_SCOPE,
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  const signature = signer.sign(sa.private_key, "base64url");
  const assertion = `${header}.${payload}.${signature}`;

  const res = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(assertion)}`,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Google token exchange failed: ${res.status} ${t.slice(0, 160)}`);
  }
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error("Google token response had no access_token");
  cachedToken = { token: data.access_token, exp: now + (data.expires_in || 3600) };
  return data.access_token;
}

export interface IndexingResult {
  url: string;
  ok: boolean;
  status: number;
  detail?: string;
}

/** Notify Google that the given URLs were updated. Sequential to stay gentle on quota. */
export async function submitUrlsForIndexing(urls: string[]): Promise<IndexingResult[]> {
  const accessToken = await getAccessToken();
  const results: IndexingResult[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(PUBLISH_ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ url, type: "URL_UPDATED" }),
      });
      let detail: string | undefined;
      if (!res.ok) {
        detail = await res.text().catch(() => "");
        detail = detail ? detail.slice(0, 200) : `HTTP ${res.status}`;
      }
      results.push({ url, ok: res.ok, status: res.status, ...(detail ? { detail } : {}) });
    } catch (e) {
      results.push({ url, ok: false, status: 0, detail: String(e).slice(0, 200) });
    }
  }
  return results;
}
