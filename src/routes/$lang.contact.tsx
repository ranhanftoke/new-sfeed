import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { StaticPage } from "@/components/site/StaticPage";
import { T, isLang, type Lang } from "@/lib/i18n";
import { PAGES } from "@/lib/static-pages";

/** Replace with your real inbox address. */
const CONTACT_EMAIL = "editor@globalwire.news";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(2000),
});

export const Route = createFileRoute("/$lang/contact")({
  head: ({ params }) => {
    const lang = (isLang(params.lang) ? params.lang : "en") as Lang;
    const page = PAGES[lang].contact;
    const title = `${page.title} — ${T[lang].siteName}`;
    return {
      meta: [
        { title },
        { name: "description", content: page.intro.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: page.intro.slice(0, 155) },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `https://new-sfeed.lovable.app/${lang}/contact` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `https://new-sfeed.lovable.app/${lang}/contact` }],
    };
  },
  component: ContactPage,
});

function ContactPage() {
  const { lang: raw } = Route.useParams();
  const lang = (isLang(raw) ? raw : "en") as Lang;
  const t = T[lang];
  const page = PAGES[lang].contact;
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      subject: form.get("subject"),
      message: form.get("message"),
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }

    setErrors({});
    const { name, email, subject, message } = parsed.data;
    const body = `${message}\n\n---\n${name} <${email}>`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    toast.success(t.contactSent);
  }

  const field =
    "mt-1 w-full border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <StaticPage title={page.title}>
      <p className="text-lg">{page.intro}</p>
      {page.sections.map((section) => (
        <section key={section.heading}>
          {section.heading ? <h2>{section.heading}</h2> : null}
          {section.body.map((paragraph, i) => (
            <p key={i} className="mt-3">
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <form onSubmit={onSubmit} className="mt-8 space-y-4 border-t border-border pt-6">
        <div>
          <label className="text-sm font-semibold" htmlFor="name">
            {t.contactName}
          </label>
          <input id="name" name="name" required maxLength={100} className={field} />
          {errors["name"] ? (
            <p className="mt-1 text-xs text-destructive">{errors["name"]}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="email">
            {t.contactEmail}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={255}
            className={field}
          />
          {errors["email"] ? (
            <p className="mt-1 text-xs text-destructive">{errors["email"]}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="subject">
            {t.contactSubject}
          </label>
          <input id="subject" name="subject" required maxLength={150} className={field} />
          {errors["subject"] ? (
            <p className="mt-1 text-xs text-destructive">{errors["subject"]}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="message">
            {t.contactMessage}
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            maxLength={2000}
            className={field}
          />
          {errors["message"] ? (
            <p className="mt-1 text-xs text-destructive">{errors["message"]}</p>
          ) : null}
        </div>
        <button
          type="submit"
          className="bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t.contactSend}
        </button>
        <p className="text-xs text-muted-foreground">{CONTACT_EMAIL}</p>
      </form>
    </StaticPage>
  );
}
