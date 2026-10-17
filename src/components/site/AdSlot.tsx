import { cn } from "@/lib/utils";

type Variant = "leaderboard" | "in-article" | "sidebar" | "sticky";

const SIZES: Record<Variant, string> = {
  leaderboard: "h-[90px] md:h-[90px]",
  "in-article": "h-[250px]",
  sidebar: "h-[600px]",
  sticky: "h-[60px]",
};

/**
 * Reserved ad container (AdSense / Ezoic / native ads compatible).
 * Fixed heights keep layout shift at zero before an ad loads.
 *
 * Renders NOTHING until ads are enabled — empty dashed "ADVERTISEMENT"
 * boxes look unfinished, so the slot stays invisible pre-approval.
 * Enable by setting VITE_ADSENSE_CLIENT (e.g. ca-pub-XXXX) in the
 * deployment environment, then wire the ad script into this component.
 */
const ADS_ENABLED =
  typeof import.meta !== "undefined" &&
  !!(import.meta.env?.VITE_ADSENSE_CLIENT || import.meta.env?.VITE_ADS_ENABLED === "true");

export function AdSlot({
  variant,
  label,
  className,
}: {
  variant: Variant;
  label: string;
  className?: string;
}) {
  if (!ADS_ENABLED) return null;
  return (
    <div
      data-ad-slot={variant}
      aria-hidden="true"
      className={cn(
        "flex w-full items-center justify-center overflow-hidden border border-dashed border-border bg-muted/40",
        SIZES[variant],
        className,
      )}
    >
      <span className="eyebrow text-muted-foreground/70">{label}</span>
    </div>
  );
}

export function StickyAdSlot({ label }: { label: string }) {
  if (!ADS_ENABLED) return null;
  return (
    <div className="sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <AdSlot variant="sticky" label={label} className="border-0 bg-transparent" />
    </div>
  );
}
