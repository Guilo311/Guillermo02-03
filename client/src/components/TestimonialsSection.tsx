import { useRef } from "react";
import { m, useScroll, useSpring, useTransform } from "framer-motion";
import { Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollWordHighlight } from "@/animation/components/ScrollWordHighlight";
import SplitText from "@/animation/components/SplitText";
import BlurText from "@/animation/components/BlurText";
import { useMotionCapabilities } from "@/animation/hooks/useMotionCapabilities";
import { useParallaxScene } from "@/animation/hooks/useParallaxScene";
import { shouldEnableHoverMotion, shouldEnableParallax } from "@/animation/utils/perfGuards";

type TestimonialItem = {
  quote: string;
  author: string;
  role: string;
  metric?: string;
  metricPeriod?: string;
};

function TestimonialCard({
  item,
  index,
  hoverEnabled,
}: {
  item: TestimonialItem;
  index: number;
  hoverEnabled: boolean;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 85%", "end 20%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 170, damping: 28, mass: 0.55 });
  const fillScaleY = useTransform(progress, [0, 1], [0, 1]);
  const fillGlowOpacity = useTransform(progress, [0, 0.2, 1], [0, 0.45, 0.9]);
  const quoteScale = useTransform(progress, [0, 1], [0.95, 1.08]);
  const quoteRotate = useTransform(progress, [0, 1], [-4, 4]);

  return (
    <m.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, rotateX: 5 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.2, type: "spring", stiffness: 100, damping: 20 }}
      whileHover={hoverEnabled ? { y: -6, scale: 1.01 } : undefined}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0c]/60 p-5 pl-10 transition-colors duration-500 hover:border-orange-500/45 sm:p-7 sm:pl-12"
    >
      <div className="absolute left-6 top-6 bottom-6 w-[1px]">
        <div className="absolute inset-0 w-[1px] bg-white/10" />
        <m.div
          aria-hidden="true"
          className="absolute top-0 left-0 h-full w-[1px] origin-top bg-gradient-to-b from-orange-400 via-orange-500 to-orange-500/25"
          style={{ scaleY: fillScaleY }}
        />
        <m.div
          aria-hidden="true"
          className="absolute top-0 left-0 h-full w-[3px] -translate-x-[1px] origin-top bg-gradient-to-b from-orange-400/60 via-orange-500/40 to-transparent blur-[2px]"
          style={{ scaleY: fillScaleY, opacity: fillGlowOpacity }}
        />
      </div>

      <m.div
        className="absolute top-6 left-6 w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-[#050505] flex items-center justify-center rounded-full border border-white/10 transition-colors duration-500"
        style={{ scale: quoteScale, rotate: quoteRotate }}
      >
        <Quote className="text-orange-500 w-4 h-4" />
      </m.div>

      <blockquote className="mb-8 text-xl font-light leading-relaxed sm:text-2xl lg:mb-10 lg:text-3xl">
        <span className="text-gray-300">"</span>
        <ScrollWordHighlight
          text={item.quote}
          className="inline text-xl leading-relaxed sm:text-2xl lg:text-3xl"
          wordClassName="text-gray-500"
          activeWordClassName="text-white"
        />
        <span className="text-gray-300">"</span>
      </blockquote>

      <div className="flex flex-col gap-1">
        <cite className="not-italic text-lg font-bold text-white break-words">
          <SplitText
            text={item.author}
            tag="span"
            splitType="words"
            className="block"
            delay={18}
            duration={0.35}
            threshold={0.18}
            rootMargin="-50px"
            from={{ opacity: 0, transform: "translateY(6px)" }}
            to={{ opacity: 1, transform: "translateY(0px)" }}
          />
        </cite>
        <BlurText
          as="div"
          text={item.role}
          className="max-w-full break-words text-xs font-bold uppercase tracking-widest leading-relaxed text-orange-500"
          animateBy="words"
          direction="bottom"
          delay={16}
          threshold={0.18}
          rootMargin="-40px"
          stepDuration={0.16}
        />
        {item.metric ? (
          <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-200">{item.metric}</span>
            {item.metricPeriod ? (
              <span className="text-[10px] uppercase tracking-[0.14em] text-white/60">{item.metricPeriod}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </m.div>
  );
}

export default function TestimonialsSection() {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const capabilities = useMotionCapabilities();
  const parallaxEnabled = shouldEnableParallax(capabilities);
  const hoverEnabled = shouldEnableHoverMotion(capabilities);
  const reducedMotion = capabilities.prefersReducedMotion || capabilities.motionLevel === "off";
  const { ySoft, yDeep, xSoft } = useParallaxScene({
    target: sectionRef,
    motionLevel: capabilities.motionLevel,
    enabled: parallaxEnabled,
    offset: ["start end", "end start"],
  });

  const t = useLanguage().t;

  const headerCopy = {
    eyebrow: t.testimonials.eyebrow,
    title: t.testimonials.title,
    titleHighlight: t.testimonials.titleHighlight,
    subtitle: t.testimonials.subtitle,
  };

  const testimonials: TestimonialItem[] = [
    t.testimonials.item1,
    t.testimonials.item2,
    t.testimonials.item3,
    t.testimonials.item4,
  ];

  return (
    <section ref={sectionRef} id="portfolio" className="relative overflow-hidden bg-[#050505] py-20 md:py-32">
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[12%] top-16 h-24 rounded-full bg-white/[0.03] blur-2xl"
        animate={reducedMotion ? undefined : { opacity: [0.2, 0.45, 0.2], x: ["-4%", "4%", "-4%"] }}
        transition={reducedMotion ? undefined : { duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <m.div
        aria-hidden="true"
        style={{ y: ySoft }}
        className="absolute top-[22%] left-[10%] w-[28rem] h-[28rem] bg-orange-500/[0.05] rounded-full blur-[120px] pointer-events-none"
      />
      <m.div
        aria-hidden="true"
        style={{ y: yDeep, x: xSoft }}
        className="absolute bottom-[8%] right-[8%] w-[24rem] h-[24rem] bg-cyan-500/[0.05] rounded-full blur-[110px] pointer-events-none"
      />
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-[1px] w-56 bg-gradient-to-r from-transparent via-orange-400/80 to-cyan-400/60"
        animate={reducedMotion ? undefined : { x: ["-20%", "120vw"] }}
        transition={reducedMotion ? undefined : { duration: 9, repeat: Infinity, ease: "linear" }}
      />

      <div className="container relative z-10">
        <m.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mb-5 flex justify-center"
        >
          <span className="glx-pill-shell glx-pill-text inline-flex items-center gap-2 rounded-full border px-4 py-2">
            {headerCopy.eyebrow}
          </span>
        </m.div>
        <m.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="mb-8 text-center text-3xl font-extrabold tracking-tight md:mb-12 md:text-5xl lg:text-5xl"
        >
          <m.span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 hidden h-20 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-3xl md:block"
            animate={reducedMotion ? undefined : { opacity: [0.15, 0.35, 0.15] }}
            transition={reducedMotion ? undefined : { duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <SplitText
            text={headerCopy.title}
            tag="span"
            splitType="chars"
            className="inline-block text-white"
            delay={12}
            duration={0.36}
            threshold={0.12}
            rootMargin="-90px"
            from={{ opacity: 0, transform: "translateY(12px)" }}
            to={{ opacity: 1, transform: "translateY(0px)" }}
          />{" "}
          <m.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.12, duration: 0.01 }}
            className="inline-block md:block"
          >
            <SplitText
              text={headerCopy.titleHighlight}
              tag="span"
              splitType="chars"
              className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300"
              delay={16}
              duration={0.36}
              threshold={0.12}
              rootMargin="-90px"
              from={{ opacity: 0, transform: "translateY(12px)" }}
              to={{ opacity: 1, transform: "translateY(0px)" }}
            />
          </m.span>
        </m.h2>

        <m.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.08, duration: 0.4, ease: "easeOut" }}
          className="mx-auto mb-10 max-w-3xl text-center text-base font-light leading-relaxed text-gray-300 md:mb-12 md:text-xl"
        >
          {headerCopy.subtitle}
        </m.p>

        <div className="mb-20 grid grid-cols-1 gap-8 md:mb-24 md:grid-cols-2 md:gap-12 lg:gap-16 [perspective:1000px]">
          {testimonials.map((item, index) => (
            <TestimonialCard key={index} item={item} index={index} hoverEnabled={hoverEnabled} />
          ))}
        </div>
      </div>
    </section>
  );
}
