import { m } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState } from "react";
import CountUp from "@/animation/components/CountUp";
import SplitText from "@/animation/components/SplitText";
import { useMotionCapabilities } from "@/animation/hooks/useMotionCapabilities";

type FeaturedBrand = {
  name: string;
  logo: string;
};

const featuredBrands: FeaturedBrand[] = [
  {
    name: "Maktub Medicina Diagnóstica",
    logo: "/images/logo-maktub-new.png",
  },
  {
    name: "Lumina Dermatologia & Estética Médica",
    logo: "/images/logo-lumina.png",
  },
  {
    name: "Instituto VittaMéd Nutrologia",
    logo: "/images/logo-vittamed.png",
  },
  {
    name: "HealthTech Solutions",
    logo: "/images/HealthTech-Solutions.png",
  },
];

const badgeByLanguage = {
  pt: "RESULTADOS REAIS",
  en: "REAL RESULTS",
  es: "RESULTADOS REALES",
} as const;

function parseDecoratedNumber(input: string): { prefix: string; numeric: number; suffix: string; decimals: number } | null {
  const trimmed = input.trim();
  const match = trimmed.match(/^([^\d]*)(\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) return null;
  const [, prefix, numberTextRaw, suffix] = match;
  const numberText = numberTextRaw.replace(",", ".");
  const numeric = Number(numberText);
  if (!Number.isFinite(numeric)) return null;
  const decimals = numberText.includes(".") ? numberText.split(".")[1].length : 0;
  return { prefix, numeric, suffix, decimals };
}

function FeaturedLogo({ brand, active }: { brand: FeaturedBrand; active: boolean }) {
  const [broken, setBroken] = useState(false);
  const isHealthTech = brand.name === "HealthTech Solutions";
  if (broken) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-white/15 bg-white/[0.03] px-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
        {brand.name}
      </div>
    );
  }

  return (
    <img
      src={brand.logo}
      alt={brand.name}
      className={`mx-auto h-full w-full rounded-lg object-contain transition-all duration-300 ${
        isHealthTech ? "scale-[1.8]" : "scale-100"
      } ${
        active ? "grayscale-0 opacity-100" : "grayscale brightness-75 contrast-110 opacity-65"
      }`}
      onError={() => setBroken(true)}
      loading="lazy"
    />
  );
}

export default function ImpactSection() {
  const { t, language } = useLanguage();
  const motionCaps = useMotionCapabilities();
  const reducedMotion = motionCaps.prefersReducedMotion || motionCaps.motionLevel === "off";
  const [hoveredLogoIndex, setHoveredLogoIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const speedRef = useRef(0.6);
  const totalWidthRef = useRef(0);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const lastXRef = useRef(0);

  const stats = [
    { value: t.impact.statA, label: t.impact.statALabel },
    { value: t.impact.statB, label: t.impact.statBLabel },
    { value: t.impact.statC, label: t.impact.statCLabel },
    { value: t.impact.statD, label: t.impact.statDLabel },
  ];

  useEffect(() => {
    speedRef.current = 0.6;
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;

    const measure = () => {
      totalWidthRef.current = track.scrollWidth / 3;
    };

    const clamp = () => {
      const total = totalWidthRef.current;
      if (!total) return;
      if (offsetRef.current >= total) offsetRef.current -= total;
      if (offsetRef.current < 0) offsetRef.current += total;
    };

    const render = () => {
      track.style.transform = `translateX(${-offsetRef.current}px)`;
    };

    let frameId = 0;
    const loop = () => {
      if (!draggingRef.current) {
        offsetRef.current += speedRef.current;
        if (Math.abs(velocityRef.current) > 0.05) {
          offsetRef.current += velocityRef.current;
          velocityRef.current *= 0.92;
        }
        clamp();
        render();
      }
      frameId = window.requestAnimationFrame(loop);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!draggingRef.current) return;
      offsetRef.current = startOffsetRef.current - (event.clientX - startXRef.current);
      velocityRef.current = lastXRef.current - event.clientX;
      lastXRef.current = event.clientX;
      clamp();
      render();
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!draggingRef.current) return;
      const touch = event.touches[0];
      offsetRef.current = startOffsetRef.current - (touch.clientX - startXRef.current);
      velocityRef.current = lastXRef.current - touch.clientX;
      lastXRef.current = touch.clientX;
      clamp();
      render();
    };

    const stopDragging = () => {
      draggingRef.current = false;
    };

    const handleMouseDown = (event: MouseEvent) => {
      draggingRef.current = true;
      startXRef.current = event.clientX;
      startOffsetRef.current = offsetRef.current;
      lastXRef.current = event.clientX;
      velocityRef.current = 0;
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      draggingRef.current = true;
      startXRef.current = touch.clientX;
      startOffsetRef.current = offsetRef.current;
      lastXRef.current = touch.clientX;
      velocityRef.current = 0;
    };

    const handleMouseLeave = () => {
      draggingRef.current = false;
    };

    measure();
    render();
    frameId = window.requestAnimationFrame(loop);

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", stopDragging);
    window.addEventListener("resize", measure);

    return () => {
      window.cancelAnimationFrame(frameId);
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopDragging);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section id="cases" className="scroll-mt-28 py-24 bg-[#0A0A0B] border-y border-white/5 overflow-hidden">
      <div className="container mb-24 relative z-10">
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-4 h-24 rounded-full bg-orange-500/10 blur-3xl"
          animate={reducedMotion ? undefined : { opacity: [0.25, 0.5, 0.25], scale: [0.98, 1.03, 0.98] }}
          transition={reducedMotion ? undefined : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 top-28 h-40 w-40 rounded-full bg-cyan-400/10 blur-[80px]"
          animate={reducedMotion ? undefined : { y: [0, -14, 0], x: [0, 8, 0] }}
          transition={reducedMotion ? undefined : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="mb-14 text-center">
          <span className="glx-pill-shell inline-flex items-center gap-2 rounded-full border px-4 py-2">
            <SplitText
              text={badgeByLanguage[language]}
              splitType="words"
              tag="span"
              className="glx-pill-text inline-flex"
              delay={18}
              duration={0.35}
              threshold={0.2}
              rootMargin="-80px"
              from={{ opacity: 0, transform: "translateY(6px)" }}
              to={{ opacity: 1, transform: "translateY(0px)" }}
            />
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 text-center sm:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-8">
          {stats.map((stat, index) => (
            <m.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100, damping: 20 }}
              whileHover={{ y: -6, scale: 1.02 }}
              animate={reducedMotion ? undefined : { y: [0, -2.5, 0] }}
              className="group relative flex min-h-[15.5rem] flex-col items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/[0.015] px-4 py-5 text-center transition-colors hover:border-orange-500/25 sm:min-h-[17rem] sm:px-5 md:min-h-[18rem]"
              style={reducedMotion ? undefined : { animationDelay: `${index * 0.2}s` }}
            >
              <m.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  background:
                    "radial-gradient(circle at 50% 15%, rgba(230,126,34,0.14), rgba(255,255,255,0) 65%)",
                }}
              />
              <m.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-16 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                animate={reducedMotion ? undefined : { x: ["-120%", "420%"] }}
                transition={reducedMotion ? undefined : { duration: 2.2, repeat: Infinity, repeatDelay: 1.4, ease: "linear", delay: index * 0.15 }}
              />
              <m.div
                className="relative z-10 mb-1 whitespace-nowrap bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-5xl font-extrabold tracking-tighter text-transparent drop-shadow-sm sm:text-6xl md:text-7xl"
                whileHover={{ filter: "drop-shadow(0 0 10px rgba(230,126,34,0.18))" }}
                animate={reducedMotion ? undefined : { scale: [1, 1.015, 1] }}
                transition={reducedMotion ? undefined : { duration: 3.5 + index * 0.25, repeat: Infinity, ease: "easeInOut" }}
              >
                {(() => {
                  const parsed = parseDecoratedNumber(stat.value);
                  if (!parsed) return stat.value;
                  return (
                    <>
                      <span>{parsed.prefix}</span>
                      <CountUp
                        from={0}
                        to={parsed.numeric}
                        duration={1.6 + index * 0.12}
                        delay={0.18 + index * 0.1}
                        decimals={parsed.decimals}
                        startCounting
                        className="inline-block"
                      />
                      <span>{parsed.suffix}</span>
                    </>
                  );
                })()}
              </m.div>
              <div className="relative z-10 flex w-full justify-center text-[11px] font-bold uppercase leading-relaxed tracking-[0.08em] text-orange-500 sm:text-xs sm:tracking-[0.12em] md:text-sm md:tracking-[0.16em]">
                <SplitText
                  text={stat.label}
                  splitType="words"
                  tag="div"
                  className="mx-auto inline-block max-w-[22ch] text-center"
                  textAlign="center"
                  delay={22}
                  duration={0.5}
                  threshold={0.2}
                  rootMargin="-70px"
                  from={{ opacity: 0, transform: "translateY(8px)" }}
                  to={{ opacity: 1, transform: "translateY(0px)" }}
                />
              </div>
            </m.div>
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-hidden border-t border-white/[0.03] bg-[#080808] py-12">
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"
          animate={reducedMotion ? undefined : { opacity: [0.35, 0.9, 0.35], x: ["-6%", "6%", "-6%"] }}
          transition={reducedMotion ? undefined : { duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

        <div className="container relative z-10">
          <m.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative w-full py-5">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#080808] via-[#080808]/75 to-transparent sm:w-20" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#080808] via-[#080808]/75 to-transparent sm:w-20" />

              <div
                ref={containerRef}
                className="overflow-hidden cursor-grab select-none active:cursor-grabbing"
              >
                <div
                  ref={trackRef}
                  className="flex w-max gap-4 will-change-transform sm:gap-5 lg:gap-6"
                >
                  {[...featuredBrands, ...featuredBrands, ...featuredBrands].map((brand, index) => (
                    <div
                      key={`${brand.name}-${index}`}
                      className="group flex h-[11.25rem] w-[11.25rem] flex-shrink-0 flex-col items-center justify-center gap-3 rounded-[18px] border border-white/10 bg-[#101012] px-5 py-5 text-center transition-[border-color,box-shadow] duration-300 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:h-[12rem] sm:w-[12rem]"
                      onMouseEnter={() => setHoveredLogoIndex(index)}
                      onMouseLeave={() => setHoveredLogoIndex(null)}
                    >
                      <div className="flex h-20 w-20 items-center justify-center rounded-[10px] sm:h-24 sm:w-24">
                        <FeaturedLogo brand={brand} active={hoveredLogoIndex === index} />
                      </div>
                      <p className="text-center text-[10px] font-semibold uppercase leading-[1.4] tracking-[0.12em] text-white/65">
                        {brand.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
