"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SectionContainer } from "@/components/design-system/SectionContainer";
import { GoldButton } from "@/components/design-system/GoldButton";
import { Crescent } from "@/components/design-system/Crescent";

/**
 * Phase 05 — global navigation.
 *
 * Every href here resolves to something that exists right now: `/events`,
 * `/rules`, `/contact`, and `/register` are real routes; `/#story-heading`
 * and `/#cause-heading` point at the two `<h2 id="...">` elements the
 * Phase 02 landing-page placeholder already has (app/page.tsx). No link
 * here points at a page or section that doesn't exist yet.
 */
const NAV_LINKS = [
  { href: "/#story-heading", label: "Story" },
  { href: "/#cause-heading", label: "Cause" },
  { href: "/events", label: "Events" },
  { href: "/rules", label: "Rules" },
  { href: "/contact", label: "Contact" },
] as const;

/** Scroll position (px) past which the header switches from transparent/atmospheric to solid. */
const SCROLL_THRESHOLD = 24;

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const overlayId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  // Header background: transparent/atmospheric at the top of the page,
  // solid royal navy with a hairline gold border once the page has
  // scrolled past the threshold.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile overlay on route change (covers link clicks — which
  // already close it directly — and browser back/forward navigation).
  useEffect(() => {
    setMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Mobile overlay: lock page scroll, move focus in, trap Tab within it,
  // close on Escape, and hand focus back to the trigger button on close.
  useEffect(() => {
    if (!mobileOpen) {
      if (wasOpenRef.current) {
        triggerRef.current?.focus();
      }
      wasOpenRef.current = false;
      return;
    }
    wasOpenRef.current = true;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab" || !overlayRef.current) return;

      const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  function isActive(href: string) {
    // Hash links (Story/Cause) target sections of "/", not routes of
    // their own — scroll-spying which section is in view is a bigger
    // feature than this phase asks for, so they simply never show an
    // active state, matching "active state where useful."
    if (href.startsWith("/#")) return false;
    return pathname === href;
  }

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-40 transition-colors duration-base",
        scrolled
          ? "border-b border-antique-gold/25 bg-midnight/95"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <SectionContainer as="div" width="wide">
        <div className="flex h-16 items-center justify-between sm:h-20">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-base font-semibold tracking-wide text-ivory sm:text-lg"
          >
            <Crescent size={22} className="text-warm-gold" />
            <span>
              AFFINITY <span className="text-antique-gold">&rsquo;26</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={[
                      "font-body text-sm uppercase tracking-[0.14em] transition-colors duration-fast",
                      isActive(link.href)
                        ? "text-warm-gold"
                        : "text-ivory/80 hover:text-warm-gold",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden lg:block">
            <GoldButton href="/register">Register</GoldButton>
          </div>

          {/*
            Mobile trigger. Opens the overlay and, while it's open, sits
            visually hidden behind it (overlay is z-50, this header is
            z-40) — the overlay renders its own visible close button
            (below) as the actual dismiss control. This one is also
            pulled out of the tab order while open (defense in depth
            alongside the overlay's focus trap) and its `aria-controls`
            only references the overlay's id once that id actually
            exists in the DOM.
          */}
          <button
            ref={triggerRef}
            type="button"
            tabIndex={mobileOpen ? -1 : 0}
            aria-expanded={mobileOpen}
            aria-controls={mobileOpen ? overlayId : undefined}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center text-ivory lg:hidden"
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
        </div>
      </SectionContainer>

      {mobileOpen ? (
        <div
          id={overlayId}
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-50 flex flex-col bg-midnight lg:hidden"
        >
          <SectionContainer as="div" width="wide">
            <div className="flex h-16 items-center justify-between sm:h-20">
              <span className="font-display text-base font-semibold text-ivory sm:text-lg">
                AFFINITY <span className="text-antique-gold">&rsquo;26</span>
              </span>
              {/*
                The overlay (z-50) paints over the header (z-40), so the
                header's own trigger button — still in the DOM, tabIndex
                -1'd while open — is visually hidden underneath it. This is
                the dialog's actual, visible close control.
              */}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-11 w-11 items-center justify-center text-ivory"
              >
                <HamburgerIcon open />
              </button>
            </div>
          </SectionContainer>

          <nav aria-label="Primary" className="flex flex-1 flex-col items-center justify-center gap-10 px-6">
            <ul className="flex flex-col items-center gap-8">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "font-display text-2xl uppercase tracking-[0.14em] transition-colors duration-fast",
                      isActive(link.href) ? "text-warm-gold" : "text-ivory hover:text-warm-gold",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <GoldButton href="/register" onClick={() => setMobileOpen(false)} fullWidth className="max-w-xs">
              Register
            </GoldButton>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

/** Three-line hamburger that morphs into an × via CSS transforms — one icon, two states, no separate glyph swap. */
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-5" aria-hidden="true">
      <span
        className={[
          "absolute left-0 top-0 h-[1.5px] w-full bg-current transition-transform duration-fast",
          open ? "translate-y-[7px] rotate-45" : "",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-current transition-opacity duration-fast",
          open ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />
      <span
        className={[
          "absolute bottom-0 left-0 h-[1.5px] w-full bg-current transition-transform duration-fast",
          open ? "-translate-y-[7px] -rotate-45" : "",
        ].join(" ")}
      />
    </span>
  );
}
