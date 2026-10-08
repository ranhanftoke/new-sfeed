import { createFileRoute } from "@tanstack/react-router";

// Google Search Console ownership verification file.
export const Route = createFileRoute("/google36c3484646b2578f.html")({
  server: {
    handlers: {
      GET: () =>
        new Response("google-site-verification: google36c3484646b2578f.html", {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
