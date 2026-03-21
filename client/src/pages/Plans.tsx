import { Link } from "wouter";
import { m } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getDefaultDashboardPathByRole, resolveClientDashboardRole } from "@/lib/clientDashboardRole";
import { useLanguage } from "@/contexts/LanguageContext";

const EASE = [0.25, 0.1, 0.25, 1] as const;

function openCalendly() {
  window.open("https://wa.me/5511970837585", "_blank", "noopener,noreferrer");
}

function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" as const },
    transition: { duration: 0.52, delay, ease: EASE },
  };
}

type PlanData = {
  name: string;
  tagline: string;
  body: string;
  sectionLabel: string;
  bullets: string[];
  forLabel: string;
  forText: string;
};

// ─── PLAN CARD ────────────────────────────────────────────────────────────────
function PlanCard({ plan, index }: { plan: PlanData; index: number }) {
  return (
    <m.div
      {...fadeUpProps(index * 0.09)}
      whileHover={{
        y: -2,
        boxShadow: "0 8px 32px rgba(249,115,22,0.06)",
        borderColor: "rgba(249,115,22,0.25)",
        transition: { duration: 0.2, ease: EASE },
      }}
      className="flex flex-col rounded-2xl border border-[#1F1F1F] bg-[#111111] p-7 transition-colors duration-200 md:p-8"
      style={{ willChange: "transform" }}
    >
      <h3 className="text-[22px] font-bold leading-tight text-white md:text-[24px]">
        {plan.name}
      </h3>
      <p className="mt-1.5 text-[14px] italic leading-relaxed text-[#888888] md:text-[15px]">
        {plan.tagline}
      </p>
      <div className="my-5 h-px bg-[#1F1F1F]" />
      <p className="text-[14px] leading-[1.65] text-[#888888] md:text-[15px]">{plan.body}</p>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#F97316]">
        {plan.sectionLabel}
      </p>
      <ul className="mt-3 space-y-2.5">
        {plan.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F97316]" />
            <span className="text-[14px] leading-relaxed text-white/85 md:text-[15px]">{b}</span>
          </li>
        ))}
      </ul>
      <div className="my-5 h-px bg-[#1F1F1F]" />
      <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#888888]">
        {plan.forLabel}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#888888] md:text-[14px]">
        {plan.forText}
      </p>
    </m.div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Plans() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const p = t.plansPage;

  const dashboardHref = user
    ? getDefaultDashboardPathByRole(resolveClientDashboardRole(user as any))
    : "/";
  const backButtonLabel = user ? p.backToDashboard : p.backToSite;

  const OS_PLANS: PlanData[] = [
    {
      name: p.startName,
      tagline: p.startTagline,
      body: p.startBody,
      sectionLabel: p.sectionLabel,
      bullets: [p.startBullet1, p.startBullet2, p.startBullet3, p.startBullet4, p.startBullet5],
      forLabel: p.forLabel,
      forText: p.startForText,
    },
    {
      name: p.proName,
      tagline: p.proTagline,
      body: p.proBody,
      sectionLabel: p.sectionLabel,
      bullets: [p.proBullet1, p.proBullet2, p.proBullet3, p.proBullet4, p.proBullet5],
      forLabel: p.forLabel,
      forText: p.proForText,
    },
  ];

  const ADVISORY_PLANS: PlanData[] = [
    {
      name: p.boardName,
      tagline: p.boardTagline,
      body: p.boardBody,
      sectionLabel: p.sectionLabel,
      bullets: [p.boardBullet1, p.boardBullet2, p.boardBullet3, p.boardBullet4, p.boardBullet5],
      forLabel: p.forLabel,
      forText: p.boardForText,
    },
    {
      name: p.scaleName,
      tagline: p.scaleTagline,
      body: p.scaleBody,
      sectionLabel: p.sectionLabel,
      bullets: [p.scaleBullet1, p.scaleBullet2, p.scaleBullet3, p.scaleBullet4, p.scaleBullet5],
      forLabel: p.forLabel,
      forText: p.scaleForText,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(249,115,22,0.07),transparent)]" />

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#0A0A0A]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 md:h-20">
          <a href="/#home">
            <img src="/images/logo-transparent.png" alt="GLX Partners" className="h-16 w-auto md:h-20" />
          </a>
          <Link href={dashboardHref}>
            <m.div whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }}>
              <Button
                variant="ghost"
                className="group rounded-full border border-orange-500/25 bg-[#120c08] px-4 text-white hover:bg-[#1b120b] hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                {backButtonLabel}
              </Button>
            </m.div>
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1200px] px-6 pb-0 pt-32 md:px-20 md:pt-44">

        {/* ── SECTION HEADER ─────────────────────────────────── */}
        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, ease: EASE }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-[#F97316] px-6 py-2.5 text-[15px] font-bold uppercase tracking-[2px] text-[#F97316]">
            {p.headerBadge}
          </span>
          <h1 className="mt-6 text-[44px] font-bold leading-[1.1] tracking-tight md:text-[56px]">
            {p.h1Line1}
            <br />
            {p.h1Line2}
          </h1>
          <p className="mx-auto mt-5 max-w-[580px] text-[15px] leading-[1.6] text-[#888888] md:text-[17px]">
            {p.subtext}
          </p>
        </m.div>

        {/* ── BLOCK 1: GLX OPERATING SYSTEM ──────────────────── */}
        <div className="mt-20 md:mt-[80px]">
          <m.div
            {...fadeUpProps()}
            className="mb-12"
          >
            <span className="inline-block rounded-full border border-[#F97316] px-6 py-2.5 text-[15px] font-bold uppercase tracking-[2px] text-[#F97316]">
              {p.osBadge}
            </span>
            <h2 className="mt-4 text-[36px] font-bold leading-[1.15] tracking-tight text-white md:text-[44px]">
              {p.osH2Line1}
              <br />
              {p.osH2Line2}
            </h2>
            <p className="mt-2 text-[16px] leading-relaxed text-[#888888] md:text-[18px]">
              {p.osSubhead}
            </p>
          </m.div>

          <div className="grid gap-5 md:grid-cols-2 md:gap-6">
            {OS_PLANS.map((plan, i) => (
              <PlanCard key={plan.name} plan={plan} index={i} />
            ))}
          </div>
        </div>

        {/* ── SEPARATOR ──────────────────────────────────────── */}
        <div className="my-[100px] h-px bg-[#1A1A1A]" />

        {/* ── BLOCK 2: GLX ADVISORY ──────────────────────────── */}
        <div>
          <m.div
            {...fadeUpProps()}
            className="mb-14"
          >
            <span className="inline-block rounded-full border border-[#F97316] px-6 py-2.5 text-[15px] font-bold uppercase tracking-[2px] text-[#F97316]">
              {p.advisoryBadge}
            </span>
            <h2 className="mt-5 text-[36px] font-bold leading-[1.15] tracking-tight text-white md:text-[44px]">
              {p.advisoryH2Line1}
              <br />
              {p.advisoryH2Line2}
            </h2>
            <p className="mt-4 max-w-[600px] text-[15px] leading-[1.6] text-[#888888] md:text-[17px]">
              {p.advisorySubtext}
            </p>
          </m.div>

          <div className="grid gap-5 md:grid-cols-2 md:gap-6">
            {ADVISORY_PLANS.map((plan, i) => (
              <PlanCard key={plan.name} plan={plan} index={i} />
            ))}
          </div>
        </div>
      </main>

      {/* ── BOTTOM CTA STRIP ───────────────────────────────────── */}
      <m.div
        {...fadeUpProps()}
        className="mt-[100px] w-full bg-[#111111] px-6 py-[80px]"
      >
        <div className="mx-auto max-w-[860px] text-center">
          <p className="text-[24px] font-bold leading-tight text-white md:text-[28px]">
            {p.ctaTitle}
          </p>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#888888] md:text-[16px]">
            {p.ctaBody1}<br />
            {p.ctaBody2}
          </p>
          <div className="mt-8">
            <button
              onClick={openCalendly}
              className="rounded-lg bg-[#F97316] px-10 py-[18px] text-[14px] font-bold uppercase tracking-[1.5px] text-white transition-all duration-150 hover:brightness-110"
            >
              {p.ctaButton}
            </button>
            <p className="mt-3.5 text-[13px] text-[#888888]">
              {p.ctaNote}
            </p>
          </div>
        </div>
      </m.div>

      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="mx-auto max-w-[1200px] text-center text-sm text-white/35">
          GLX Partners | glxpartners.io | Growth. Lean. Execution.
        </div>
      </footer>
    </div>
  );
}
