/**
 * AFFINITY '26 brand asset registry — single source of truth for every
 * logo path, brand name, and accessible alt text used anywhere in the
 * app. Nothing outside this file should hold a literal path into
 * `public/assets/logo/`, mirroring the same centralization discipline
 * `data/content.ts`/`data/events/` already apply to factual copy.
 *
 * All five files under `public/assets/logo/` are unmodified copies of the
 * official artwork supplied for this phase — verified byte-for-byte
 * identical to the originals before this file was written (see
 * docs/phase-29-brand-logo-integration-notes.md). This file only ever
 * *references* those files; nothing here recolors, crops, or redraws any
 * mark. `BrandLogo` (components/design-system/BrandLogo.tsx) is the only
 * component that renders them, always at `width: auto` against a
 * caller-chosen height, so the original aspect ratio is preserved
 * everywhere they appear.
 *
 * Alt text below follows the phase brief's own worked examples verbatim
 * in spirit ("College logo: full institution name", "Digital partner:
 * '<Name> — Digital Partner'") — never a filename, never "logo.png".
 */

export interface BrandMark {
  /** Display name for this brand — used in alt text and, where relevant, as a visible label. */
  name: string;
  /** Path under `public/`, e.g. "/assets/logo/college-logo.png". */
  logo: string;
  /** Full accessible alt text for this specific mark. */
  alt: string;
}

export interface DigitalPartner extends BrandMark {
  /**
   * Official partner URL, if one was supplied. No official website URL
   * was provided for either digital partner in this phase — per the
   * brief's own instruction ("Do not invent website URLs... leave links
   * disabled rather than guessing"), this is intentionally left
   * `undefined` for both entries below rather than filled with a guess.
   * `DigitalPartners` only renders an `<a>` wrapper when this is set.
   */
  href?: string;
}

/**
 * Brand hierarchy, exactly as specified by the phase brief:
 *  - `event` (AFFINITY '26 itself) is PRIMARY — always the largest/most
 *    prominent mark wherever more than one brand appears together.
 *  - `college` and `batch` are secondary/organisational — smaller than
 *    `event`, but they get equal treatment with each other.
 *  - `digitalPartners` are tertiary and always equal to each other —
 *    never larger than, or visually competing with, `event`.
 * Sizing itself lives at each call site (Tailwind height classes), not
 * here — this file only fixes identity (which logo, what it's called,
 * what its alt text is), never presentation.
 */
export const siteBranding = {
  college: {
    name: "Karpaga Vinayaga Institute of Medical Sciences and Research Centre",
    logo: "/assets/logo/college-logo.png",
    alt: "Karpaga Vinayaga Institute of Medical Sciences and Research Centre — college logo",
  },
  event: {
    name: "AFFINITY '26",
    logo: "/assets/logo/affinity-event-logo.png",
    alt: "AFFINITY '26 — 11th edition official event emblem",
  },
  batch: {
    name: "Dhruvaas batch",
    logo: "/assets/logo/dhruvaas-batch-logo.png",
    alt: "Dhruvaas batch — organising batch logo",
  },
  digitalPartners: [
    {
      name: "MKZORA",
      logo: "/assets/logo/mkzora-logo.jpg",
      alt: "MKZORA — Digital Partner",
    },
    {
      name: "Garudan Nexus",
      logo: "/assets/logo/garudan-nexus-logo.png",
      alt: "Garudan Nexus — Digital Partner",
    },
  ],
} as const satisfies {
  college: BrandMark;
  event: BrandMark;
  batch: BrandMark;
  digitalPartners: readonly DigitalPartner[];
};
