import { useRef, useState } from "react";
import { m, type Variants } from "framer-motion";
import { BarChart3, Scissors, Settings, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollWordHighlight } from "@/animation/components/ScrollWordHighlight";
import SplitText from "@/animation/components/SplitText";
import { useMotionCapabilities } from "@/animation/hooks/useMotionCapabilities";
import { useParallaxScene } from "@/animation/hooks/useParallaxScene";
import { shouldEnableParallax } from "@/animation/utils/perfGuards";
import { ParallaxTiltCard } from "@/animation/components/ParallaxTiltCard";
import { cn } from "@/lib/utils";

type ServiceCard = {
  icon: typeof TrendingUp;
  title: string;
  description: string;
  metrics: string[];
  outcome: string;
  mechanism: string;
  learnMoreTitle: string;
  learnMoreBody: string;
  visualType: "bars" | "pipeline" | "signal" | "savings";
};

type WhatCopy = {
  badge: string;
  title: string;
  subtitle: string;
  resultLabel: string;
  mechanismLabel: string;
  learnMore: string;
  hideMore: string;
  services: ServiceCard[];
};

function FeatureMiniVisual({
  type,
  reducedMotion,
  active,
}: {
  type: ServiceCard["visualType"];
  reducedMotion: boolean;
  active: boolean;
}) {
  if (type === "bars") {
    return (
      <div className="grid h-24 grid-cols-5 gap-2 rounded-xl border border-white/10 bg-[#0d1014]/80 p-3">
        {[0.35, 0.48, 0.62, 0.78, 0.68].map((v, i) => (
          <div key={i} className="flex items-end rounded-md border border-white/6 bg-white/[0.015] p-1">
            <m.div
              className="w-full rounded bg-gradient-to-t from-orange-500/80 to-cyan-300/55"
              initial={{ height: 0 }}
              whileInView={{ height: `${Math.round(v * 100)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.12 + i * 0.04 }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (type === "pipeline") {
    return (
      <div className="relative h-24 overflow-hidden rounded-xl border border-white/10 bg-[#0d1014]/80 p-3">
        <div className="grid h-full grid-cols-3 gap-2">
          {["Lead", "Qualify", "Close"].map((label) => (
            <div key={label} className="flex items-center justify-center rounded-md border border-white/6 bg-white/[0.02] text-[10px] uppercase tracking-[0.16em] text-white/55">
              {label}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3">
          <m.div
            className="h-6 w-6 rounded-full border border-orange-300/30 bg-orange-500/25 shadow-[0_0_14px_rgba(230,126,34,0.18)]"
            animate={reducedMotion ? undefined : { x: ["0%", "250%", "510%"] }}
            transition={reducedMotion ? undefined : { duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ opacity: active ? 1 : 0.75 }}
          />
        </div>
      </div>
    );
  }

  if (type === "signal") {
    return (
      <div className="relative h-24 overflow-hidden rounded-xl border border-white/10 bg-[#0d1014]/80 p-3">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-white/45">
          <span>Signal</span>
          <span>Live</span>
        </div>
        <svg viewBox="0 0 220 48" className="h-14 w-full">
          <path d="M0 34 C22 34, 22 10, 44 10 S66 38, 88 38 S110 16, 132 16 S154 30, 176 30 S198 12, 220 12" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <m.path
            d="M0 34 C22 34, 22 10, 44 10 S66 38, 88 38 S110 16, 132 16 S154 30, 176 30 S198 12, 220 12"
            fill="none"
            stroke="url(#signal-gradient)"
            strokeWidth="2.5"
            initial={{ pathLength: 0.1, pathOffset: 0.9 }}
            whileInView={{ pathLength: 1, pathOffset: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: "easeOut", delay: 0.14 }}
          />
          <defs>
            <linearGradient id="signal-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(230,126,34,0.55)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.78)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div className="relative h-24 rounded-xl border border-white/10 bg-[#0d1014]/80 p-3">
      <div className="mb-2 text-[10px] uppercase tracking-[0.16em] text-white/45">Savings map</div>
      <div className="grid grid-cols-2 gap-2">
        {[["Espera", "24%"], ["Retrabalho", "18%"], ["Glosa", "11%"], ["No-show", "15%"]].map(([label, value]) => (
          <div key={label} className="rounded-md border border-white/6 bg-white/[0.02] px-2 py-1.5">
            <div className="text-[9px] uppercase tracking-[0.14em] text-white/45">{label}</div>
            <div className="text-sm font-semibold tracking-tight text-white">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WhatSection() {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const capabilities = useMotionCapabilities();
  const reducedMotion = capabilities.prefersReducedMotion || capabilities.motionLevel === "off";
  const parallaxEnabled = shouldEnableParallax(capabilities);
  const { ySoft, yDeep, xSoft } = useParallaxScene({
    target: sectionRef,
    motionLevel: capabilities.motionLevel,
    enabled: parallaxEnabled,
    offset: ["start end", "end start"],
  });

  const content: Record<"pt" | "en" | "es", WhatCopy> = {
    pt: {
      badge: "COMO OPERAMOS",
      title: "Quatro alavancas.\nUm único sistema integrado.",
      subtitle:
        "Cada frente ataca uma camada diferente do mesmo problema: sua clinica tem capacidade para lucrar mais — e voce ainda nao sabe exatamente quanto.",
      resultLabel: "Resultado",
      mechanismLabel: "Mecanismo",
      learnMore: "Ver detalhes",
      hideMore: "Ocultar detalhes",
      services: [
        {
          icon: TrendingUp,
          title: "01 — Growth & Captação",
          description: "Mais pacientes certos, com CAC controlado.",
          outcome:
            "Estruturamos funil, canais e mensagem para elevar a demanda qualificada. Sem aumentar o budget de mídia — extraindo mais conversão do tráfego que já existe. Com governança de performance: metas, cadência semanal e otimização orientada a dados.",
          mechanism:
            "Estruturamos funil, canais e mensagem para elevar a demanda qualificada. Sem aumentar o budget de mídia — extraindo mais conversão do tráfego que já existe. Com governança de performance: metas, cadência semanal e otimização orientada a dados.",
          learnMoreTitle: "Growth & Captação",
          learnMoreBody:
            "Estruturamos funil, canais e mensagem para elevar a demanda qualificada. Sem aumentar o budget de mídia — extraindo mais conversão do tráfego que já existe. Com governança de performance: metas, cadência semanal e otimização orientada a dados.",
          metrics: ["CAC", "Lead→Consulta", "No-Show", "Conversao"],
          visualType: "bars",
        },
        {
          icon: Settings,
          title: "02 — Operação & Capacidade",
          description: "Mesma estrutura. Mais resultado.",
          outcome:
            "Desenhamos a operação para escalar sem virar caos. Eliminamos gargalos na agenda, no fluxo de atendimento e na capacidade. Padronizamos processos e automatizamos rotinas que drenam tempo do time. Resultado: mais throughput, menos retrabalho e execução previsível.",
          mechanism:
            "Desenhamos a operação para escalar sem virar caos. Eliminamos gargalos na agenda, no fluxo de atendimento e na capacidade. Padronizamos processos e automatizamos rotinas que drenam tempo do time. Resultado: mais throughput, menos retrabalho e execução previsível.",
          learnMoreTitle: "Operação & Capacidade",
          learnMoreBody:
            "Desenhamos a operação para escalar sem virar caos. Eliminamos gargalos na agenda, no fluxo de atendimento e na capacidade. Padronizamos processos e automatizamos rotinas que drenam tempo do time. Resultado: mais throughput, menos retrabalho e execução previsível.",
          metrics: ["Tempo de Ciclo", "Ocupação", "Capacidade", "NPS"],
          visualType: "pipeline",
        },
        {
          icon: Scissors,
          title: "03 — Margem & Financeiro",
          description: "Descubra onde o dinheiro some.",
          outcome:
            "Mapeamos a margem real por serviço, por médico e por canal. Tornamos visíveis os vazamentos: glosas, retrabalho e descontos sem política. Estabelecemos regras de preço, autorização e exceções com governança. Resultado: margem recuperada, previsibilidade e lucro defendido no dia a dia.",
          mechanism:
            "Mapeamos a margem real por serviço, por médico e por canal. Tornamos visíveis os vazamentos: glosas, retrabalho e descontos sem política. Estabelecemos regras de preço, autorização e exceções com governança. Resultado: margem recuperada, previsibilidade e lucro defendido no dia a dia.",
          learnMoreTitle: "Margem & Financeiro",
          learnMoreBody:
            "Mapeamos a margem real por serviço, por médico e por canal. Tornamos visíveis os vazamentos: glosas, retrabalho e descontos sem política. Estabelecemos regras de preço, autorização e exceções com governança. Resultado: margem recuperada, previsibilidade e lucro defendido no dia a dia.",
          metrics: ["EBITDA", "Margem/Servico", "Break-even", "Glosas"],
          visualType: "savings",
        },
        {
          icon: BarChart3,
          title: "04 — Dados & Governança",
          description: "Decisões por KPI. Não por extrato.",
          outcome:
            "Instalamos o GLX Control Tower: painel executivo com alertas automáticos e KPIs acionáveis. Rodamos sprints semanais com prioridades claras e responsáveis por frente. Criamos rituais de gestão para decisão rápida e correção de rota. Você sai do modo incêndio e passa a liderar por dados, cadência e previsibilidade.",
          mechanism:
            "Instalamos o GLX Control Tower: painel executivo com alertas automáticos e KPIs acionáveis. Rodamos sprints semanais com prioridades claras e responsáveis por frente. Criamos rituais de gestão para decisão rápida e correção de rota. Você sai do modo incêndio e passa a liderar por dados, cadência e previsibilidade.",
          learnMoreTitle: "Dados & Governanca",
          learnMoreBody:
            "Instalamos o GLX Control Tower: painel executivo com alertas automáticos e KPIs acionáveis. Rodamos sprints semanais com prioridades claras e responsáveis por frente. Criamos rituais de gestão para decisão rápida e correção de rota. Você sai do modo incêndio e passa a liderar por dados, cadência e previsibilidade.",
          metrics: ["Dashboard", "KPIs", "Alertas", "Forecast"],
          visualType: "signal",
        },
      ],
    },
    en: {
      badge: "HOW WE RUN THE OPERATION",
      title: "Four Levers.\nOne Integrated System.",
      subtitle:
        "Each workstream attacks a different layer of the same problem: your clinic has capacity to generate more profit—and you still don’t know exactly how much.",
      resultLabel: "Result",
      mechanismLabel: "Mechanism",
      learnMore: "Learn more",
      hideMore: "Hide details",
      services: [
        {
          icon: TrendingUp,
          title: "01 — Growth & Acquisition",
          description: "More of the right patients, with CAC under control.",
          outcome:
            "We structure funnel, channels, and messaging to raise qualified demand—without increasing media spend, by extracting more conversion from existing traffic.\nWith performance governance: targets, weekly cadence, and data-driven optimization.",
          mechanism:
            "We structure funnel, channels, and messaging to raise qualified demand—without increasing media spend, by extracting more conversion from existing traffic.\nWith performance governance: targets, weekly cadence, and data-driven optimization.",
          learnMoreTitle: "Growth Operating Layer",
          learnMoreBody:
            "We structure funnel, channels, and messaging to raise qualified demand—without increasing media spend, by extracting more conversion from existing traffic.\nWith performance governance: targets, weekly cadence, and data-driven optimization.",
          metrics: ["CAC", "Lead→Consult", "No-Show", "Conversion"],
          visualType: "bars",
        },
        {
          icon: Settings,
          title: "02 — Operations & Capacity",
          description: "Same structure, more output.",
          outcome:
            "We design the operation to scale without chaos. We remove bottlenecks in scheduling, patient flow, and capacity. We standardize processes and automate routines that drain team time.\nResult: higher throughput, less rework, and predictable execution.",
          mechanism:
            "We design the operation to scale without chaos. We remove bottlenecks in scheduling, patient flow, and capacity. We standardize processes and automate routines that drain team time.\nResult: higher throughput, less rework, and predictable execution.",
          learnMoreTitle: "Operational Architecture",
          learnMoreBody:
            "We design the operation to scale without chaos. We remove bottlenecks in scheduling, patient flow, and capacity. We standardize processes and automate routines that drain team time.\nResult: higher throughput, less rework, and predictable execution.",
          metrics: ["Cycle Time", "Occupancy", "Capacity", "NPS"],
          visualType: "pipeline",
        },
        {
          icon: Scissors,
          title: "03 — Margin & Finance",
          description: "Find where the money disappears.",
          outcome:
            "We map true margin by service, physician, and channel. We surface leakage: denials, rework, and discounts with no policy. We set pricing, authorization, and exception rules with governance.\nResult: recovered margin, predictability, and profit protected day to day.",
          mechanism:
            "We map true margin by service, physician, and channel. We surface leakage: denials, rework, and discounts with no policy. We set pricing, authorization, and exception rules with governance.\nResult: recovered margin, predictability, and profit protected day to day.",
          learnMoreTitle: "Margin & Finance",
          learnMoreBody:
            "We map true margin by service, physician, and channel. We surface leakage: denials, rework, and discounts with no policy. We set pricing, authorization, and exception rules with governance.\nResult: recovered margin, predictability, and profit protected day to day.",
          metrics: ["EBITDA", "Margin/Service", "Break-even", "Denials"],
          visualType: "savings",
        },
        {
          icon: BarChart3,
          title: "04 — Data & Governance",
          description: "Decisions by KPI—not by bank statement.",
          outcome:
            "We install the GLX Control Tower: an executive panel with automated alerts and actionable KPIs. We run weekly sprints with clear priorities and owners. We establish management rituals for fast decisions and course correction.\nYou move out of firefighting and lead with data, cadence, and predictability.",
          mechanism:
            "We install the GLX Control Tower: an executive panel with automated alerts and actionable KPIs. We run weekly sprints with clear priorities and owners. We establish management rituals for fast decisions and course correction.\nYou move out of firefighting and lead with data, cadence, and predictability.",
          learnMoreTitle: "Data & Governance",
          learnMoreBody:
            "We install the GLX Control Tower: an executive panel with automated alerts and actionable KPIs. We run weekly sprints with clear priorities and owners. We establish management rituals for fast decisions and course correction.\nYou move out of firefighting and lead with data, cadence, and predictability.",
          metrics: ["Dashboard", "KPIs", "Alerts", "Forecast"],
          visualType: "signal",
        },
      ],
    },
    es: {
      badge: "CÓMO OPERAMOS",
      title: "Cuatro ejes.\nUn único sistema integrado",
      subtitle:
        "Cada frente ataca una capa distinta del mismo problema: tu clínica tiene capacidad para lucrar más — y aún no sabes exactamente cuánto.",
      resultLabel: "Resultado",
      mechanismLabel: "Mecanismo",
      learnMore: "Learn more",
      hideMore: "Hide details",
      services: [
        {
          icon: TrendingUp,
          title: "01 — Growth & Captación",
          description: "Más pacientes correctos, con CAC controlado.",
          outcome:
            "Estructuramos funnel, canales y mensaje para elevar la demanda calificada—sin aumentar el presupuesto de medios, extrayendo más conversión del tráfico existente.\nCon gobernanza de performance: metas, cadencia semanal y optimización basada en datos.",
          mechanism:
            "Estructuramos funnel, canales y mensaje para elevar la demanda calificada—sin aumentar el presupuesto de medios, extrayendo más conversión del tráfico existente.\nCon gobernanza de performance: metas, cadencia semanal y optimización basada en datos.",
          learnMoreTitle: "Growth Operating Layer",
          learnMoreBody:
            "Estructuramos funnel, canales y mensaje para elevar la demanda calificada—sin aumentar el presupuesto de medios, extrayendo más conversión del tráfico existente.\nCon gobernanza de performance: metas, cadencia semanal y optimización basada en datos.",
          metrics: ["CAC", "Lead→Consulta", "No-Show", "Conversión"],
          visualType: "bars",
        },
        {
          icon: Settings,
          title: "02 — Operación & Capacidad",
          description: "Misma estructura, mayores resultados.",
          outcome:
            "Diseñamos la operación para escalar sin caos. Eliminamos cuellos de botella en agenda, flujo de atención y capacidad. Estandarizamos procesos y automatizamos rutinas que consumen tiempo del equipo.\nResultado: más throughput, menos retrabajo y ejecución predecible.",
          mechanism:
            "Diseñamos la operación para escalar sin caos. Eliminamos cuellos de botella en agenda, flujo de atención y capacidad. Estandarizamos procesos y automatizamos rutinas que consumen tiempo del equipo.\nResultado: más throughput, menos retrabajo y ejecución predecible.",
          learnMoreTitle: "Operational Architecture",
          learnMoreBody:
            "Diseñamos la operación para escalar sin caos. Eliminamos cuellos de botella en agenda, flujo de atención y capacidad. Estandarizamos procesos y automatizamos rutinas que consumen tiempo del equipo.\nResultado: más throughput, menos retrabajo y ejecución predecible.",
          metrics: ["Tiempo de Ciclo", "Ocupación", "Capacidad", "NPS"],
          visualType: "pipeline",
        },
        {
          icon: Scissors,
          title: "03 — Margen & Finanzas",
          description: "Descubre dónde se va el dinero.",
          outcome:
            "Mapeamos el margen real por servicio, médico y canal. Hacemos visibles las fugas: glosas/denegaciones, retrabajo y descuentos sin política. Establecemos reglas de precio, autorizaciones y excepciones con gobernanza.\nResultado: margen recuperado, previsibilidad y lucro defendido en el día a día.",
          mechanism:
            "Mapeamos el margen real por servicio, médico y canal. Hacemos visibles las fugas: glosas/denegaciones, retrabajo y descuentos sin política. Establecemos reglas de precio, autorizaciones y excepciones con gobernanza.\nResultado: margen recuperado, previsibilidad y lucro defendido en el día a día.",
          learnMoreTitle: "Margen y Finanzas",
          learnMoreBody:
            "Mapeamos el margen real por servicio, médico y canal. Hacemos visibles las fugas: glosas/denegaciones, retrabajo y descuentos sin política. Establecemos reglas de precio, autorizaciones y excepciones con gobernanza.\nResultado: margen recuperado, previsibilidad y lucro defendido en el día a día.",
          metrics: ["EBITDA", "Margen/Servicio", "Break-even", "Glosas"],
          visualType: "savings",
        },
        {
          icon: BarChart3,
          title: "04 — Datos & Gobernanza",
          description: "Decisiones por KPIs, no por extracto.",
          outcome:
            "Instalamos el GLX Control Tower: Un panel ejecutivo con alertas automáticos y KPIs accionables. Corremos sprints semanales con prioridades claras y responsables. Creamos rituales de gestión para decidir rápido y corregir la ruta. Sales del modo incendio y lideras con datos, cadencia y previsibilidad.",
          mechanism:
            "Instalamos el GLX Control Tower: Un panel ejecutivo con alertas automáticos y KPIs accionables. Corremos sprints semanales con prioridades claras y responsables. Creamos rituales de gestión para decidir rápido y corregir la ruta. Sales del modo incendio y lideras con datos, cadencia y previsibilidad.",
          learnMoreTitle: "Datos y Gobernanza",
          learnMoreBody:
            "Instalamos el GLX Control Tower: Un panel ejecutivo con alertas automáticos y KPIs accionables. Corremos sprints semanales con prioridades claras y responsables. Creamos rituales de gestión para decidir rápido y corregir la ruta. Sales del modo incendio y lideras con datos, cadencia y previsibilidad.",
          metrics: ["Dashboard", "KPIs", "Alertas", "Forecast"],
          visualType: "signal",
        },
      ],
    },
  };

  const t = content[language];
  const gridVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: "easeOut" },
    },
  };

  return (
    <section ref={sectionRef} id="what" className="relative overflow-hidden border-t border-white/5 bg-[#050506] py-24 md:py-28">
      <m.div
        aria-hidden="true"
        style={{ y: ySoft, x: xSoft }}
        className="pointer-events-none absolute left-[-10%] top-[20%] h-[40vw] w-[40vw] rounded-full bg-orange-500/8 blur-[120px]"
      />
      <m.div
        aria-hidden="true"
        style={{ y: yDeep }}
        className="pointer-events-none absolute right-[-6%] top-[45%] h-[28rem] w-[28rem] rounded-full bg-cyan-500/8 blur-[130px]"
      />
      <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />

      <div className="container relative z-10">
        <m.div style={{ y: ySoft }} className="mx-auto mb-16 max-w-5xl text-center md:mb-20">
          <m.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="glx-pill-shell mb-6 inline-flex items-center justify-center gap-2 rounded-full border px-3 py-1"
          >
            <SplitText
              text={t.badge}
              tag="h2"
              splitType="words"
              className="glx-pill-text"
              delay={18}
              duration={0.35}
              threshold={0.2}
              rootMargin="-80px"
              from={{ opacity: 0, transform: "translateY(5px)" }}
              to={{ opacity: 1, transform: "translateY(0px)" }}
            />
          </m.div>

          <m.h3
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.08, duration: 0.55, ease: "easeOut" }}
            className="mb-6 text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
          >
            <SplitText
              text={t.title}
              tag="span"
              splitType="words"
              className="block w-full whitespace-pre-line text-center text-balance"
              textAlign="center"
              delay={12}
              duration={0.36}
              threshold={0.12}
              rootMargin="-80px"
              from={{ opacity: 0, transform: "translateY(12px)" }}
              to={{ opacity: 1, transform: "translateY(0px)" }}
            />
          </m.h3>

          <m.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.14, duration: 0.5, ease: "easeOut" }}
            style={{ y: yDeep }}
            className="text-lg font-light leading-relaxed md:text-xl"
          >
            <ScrollWordHighlight text={t.subtitle} wordClassName="text-gray-500" activeWordClassName="text-gray-300" />
          </m.div>
        </m.div>

        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={gridVariants}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {t.services.map((service, index) => {
            const active = hoveredIndex === index;
            const dimmed = hoveredIndex !== null && hoveredIndex !== index;

            return (
              <m.div
                key={service.title}
                variants={itemVariants}
                className={cn("transition-opacity duration-[180ms] ease-out", dimmed && "opacity-[0.88]")}
              >
                <ParallaxTiltCard
                  intensity={capabilities.motionLevel === "full" ? 5 : 3}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex((current) => (current === index ? null : current))}
                  whileHover={
                    reducedMotion
                      ? undefined
                      : { y: -4, scale: 1.008, transition: { duration: 0.18, ease: "easeOut" } }
                  }
                  whileTap={reducedMotion ? undefined : { scale: 0.997 }}
                  className={cn(
                    "group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0b0c10] p-6 transition-[border-color,background-color] duration-[220ms] md:p-8",
                    "hover:border-orange-400/30",
                    active && "border-orange-400/35",
                  )}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.004)_46%,rgba(255,255,255,0.002))]" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-orange-500/70 via-orange-300/25 to-transparent" />

                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-6 pt-2 md:pt-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-orange-400/25 bg-orange-500/5 text-orange-300 md:h-11 md:w-11">
                          <service.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xl font-bold leading-tight tracking-tight text-white md:text-[1.45rem]">
                            {service.title}
                          </h4>
                          <p className="mt-2 max-w-[48ch] text-sm leading-6 text-white/65 md:text-[15px]">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 rounded-xl border border-white/8 bg-transparent px-4 py-3.5">
                      <div className="whitespace-pre-line text-[13px] leading-6 text-white/88 md:text-sm">
                        {service.outcome}
                      </div>
                    </div>

                    <div className="mt-auto border-t border-white/8 pt-4">
                      <div className="flex flex-wrap gap-2">
                        {service.metrics.map((metric) => (
                          <span
                            key={metric}
                            className="rounded-full border border-white/10 bg-transparent px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/55"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>

                    </div>
                  </div>
                </ParallaxTiltCard>
              </m.div>
            );
          })}
        </m.div>
      </div>
    </section>
  );
}
