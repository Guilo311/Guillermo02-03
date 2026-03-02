import { m } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollWordHighlight } from "@/animation/components/ScrollWordHighlight";
import SplitText from "@/animation/components/SplitText";
import BlurText from "@/animation/components/BlurText";
import { useMotionCapabilities } from "@/animation/hooks/useMotionCapabilities";

export default function FaqSection() {
  const { language } = useLanguage();
  const motionCaps = useMotionCapabilities();
  const reducedMotion = motionCaps.prefersReducedMotion || motionCaps.motionLevel === "off";

  const content = {
    pt: {
      title: "Perguntas Frequentes",
      subtitle: "Entenda como podemos transformar sua operação de saúde.",
      faqs: [
        {
          question: "Para quem é a GLX Partners?",
          answer:
            "Atendemos clínicas e healthtechs que já têm tração e precisam de governança para escalar. Entramos quando o desafio é crescer sem caos: aumentar capacidade, reduzir vazamentos de margem e transformar performance em rotina. Se você busca previsibilidade, lucro e execução disciplinada, a GLX é a parceira de implementação.",
        },
        {
          question: "Como funciona o diagnóstico inicial?",
          answer:
            "O diagnóstico inicial é uma conversa executiva de 30 minutos, guiada por dados, capacidade e processos. Mapeamos rapidamente gargalos e vazamentos de margem que limitam escala e previsibilidade. Você sai com prioridades claras e um plano de ação objetivo para as próximas semanas.",
        },
        {
          question: "Qual a diferença entre a GLX e uma agência de marketing?",
          answer:
            "Não somos agência de mídia — não entregamos “leads” como fim. Implementamos um sistema de crescimento que conecta aquisição, conversão, capacidade operacional e retenção. O KPI não é vaidade: é lucro, margem e previsibilidade com governança e execução semanal.",
        },
        {
          question: "Quanto tempo leva para ver os primeiros resultados?",
          answer:
            "A maioria dos clientes enxerga ganhos operacionais nas primeiras 2–4 semanas (agenda, SLA e conversão). Impactos financeiros consistentes aparecem ao longo do primeiro trimestre, com margem e capacidade sob governança. Tudo acompanhado por métricas, cadência semanal e plano de execução claro.",
        },
        {
          question: "A GLX implementa as soluções ou apenas recomenda?",
          answer:
            "Implementamos. A GLX é parceiro de execução — não entregamos um relatório e desaparecemos. Trabalhamos lado a lado com seu time para instalar processos, dashboards, automações e governança. Treinamos, acompanhamos e ajustamos em sprint até o resultado virar rotina — com métricas e accountability.",
        },
        {
          question: "O que é o Control Tower e por que preciso dele?",
          answer:
            "O GLX Control Tower é sua camada de governança executiva: um painel único que consolida demanda, capacidade, conversão, margem e caixa com alertas e prioridades acionáveis — para você identificar desvios cedo, corrigir a rota com cadência e escalar com previsibilidade, sem vazamento de margem e sem operar no escuro.",
        },
      ],
    },
    en: {
      title: "Frequently Asked Questions",
      subtitle: "Understand how we can transform your healthcare operation.",
      faqs: [
        {
          question: "Who is GLX Partners for?",
          answer:
            "We work with clinics and healthtechs that already have traction and need governance to scale. We step in when the challenge is to grow without chaos: increase capacity, reduce margin leakage, and turn performance into routine. If you want predictability, profit, and disciplined execution, GLX is the implementation partner.",
        },
        {
          question: "How does the initial diagnosis work?",
          answer:
            "The initial diagnostic is a 30-minute executive call grounded in data, capacity, and process. We quickly identify the bottlenecks and margin leakage limiting scale and predictability. You leave with clear priorities and an actionable plan for the next few weeks.",
        },
        {
          question: "What is the difference between GLX and a marketing agency?",
          answer:
            "We're not a media agency—we don't treat \"leads\" as the outcome. We implement a growth system that connects acquisition, conversion, operational capacity, and retention. The KPI isn't vanity: it's profit, margin, and predictability—with governance and weekly execution.",
        },
        {
          question: "How long until we see results?",
          answer:
            "Most of our clients see operational gains in the first 2–4 weeks (schedule, SLA, conversion). Consistent financial impact shows up over the first quarter, with margin and capacity under governance. All tracked with metrics, weekly cadence, and a clear execution plan.",
        },
        {
          question: "Does GLX implement or just recommend?",
          answer:
            "We implement. GLX is an execution partner—we don't hand over a report and disappear. We work side by side with your team to install processes, dashboards, automations, and governance. We train, track, and iterate in sprints until results become routine—with metrics and accountability.",
        },
        {
          question: "What is Control Tower and why do I need it?",
          answer:
            "The GLX Control Tower is your layer of executive governance: a single panel consolidating demand, capacity, conversion, margin, and cash with alerts and actionable priorities—so you can spot deviations early, correct course with cadence, and scale predictably, without margin leakage and without operating in the dark.",
        },
      ],
    },
    es: {
      title: "Preguntas Frecuentes",
      subtitle: "Entiende cómo podemos transformar tu operación de salud.",
      faqs: [
        {
          question: "¿Para quién es GLX Partners?",
          answer:
            "Trabajamos con clínicas y healthtechs que ya tienen tracción y necesitan gobernanza para escalar. Entramos cuando el desafío es crecer sin caos: aumentar capacidad, reducir fugas de margen y convertir performance en rutina. Si buscas previsibilidad, lucro y ejecución disciplinada, GLX es el partner de implementación.",
        },
        {
          question: "¿Cómo funciona el diagnóstico inical?",
          answer:
            "El diagnóstico inicial es una llamada ejecutiva de 30 minutos, basada en datos. Identificamos cuellos de botella y fugas de margen que limitan la escala y la previsibilidad. Sales con prioridades, quick wins y un plan de ejecución claro para las próximas semanas.",
        },
        {
          question: "¿Cuál es la diferencia entre GLX y una agencia de marketing?",
          answer:
            "No somos una agencia de medios: no entregamos “leads” como fin. Implementamos un sistema de crecimiento que conecta adquisición, conversión, capacidad operativa y retención. El KPI no es vanidad: es lucro, margen y previsibilidad—con gobernanza y ejecución semanal.",
        },
        {
          question: "¿Cuánto tarda en verse resultados?",
          answer:
            "La mayoría de los clientes ve mejoras operativas en las primeras 2–4 semanas (agenda, SLA, conversión). El impacto financiero consistente aparece a lo largo del primer trimestre, con margen y capacidad bajo gobernanza. Todo acompañado por métricas, cadencia semanal y un plan de ejecución claro.",
        },
        {
          question: "¿GLX implementa o solo recomienda?",
          answer:
            "Implementamos. GLX es partner de ejecución: no entregamos un informe y desaparecemos. Trabajamos junto a tu equipo para instalar procesos, dashboards, automatizaciones y gobernanza. Entrenamos, acompañamos y ajustamos por sprints hasta que el resultado se vuelva rutina—con métricas y accountability.",
        },
        {
          question: "¿Qué es el Control Tower y por qué lo necesito?",
          answer:
            "GLX Control Tower es tu capa de gobernanza ejecutiva: un panel único que consolida demanda, capacidad, conversión, margen y caja con alertas y prioridades accionables—para detectar desvíos temprano, corregir la ruta con cadencia y escalar con previsibilidad, sin fugas de margen y sin operar a ciegas.",
        },
      ],
    },
  };

  const t = content[language];

  return (
    <section className="py-32 bg-[#0A0A0B] relative overflow-hidden">
      <m.div
        aria-hidden="true"
        className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[150px] pointer-events-none"
        animate={reducedMotion ? undefined : { x: [0, 30, 0], y: [0, -18, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={reducedMotion ? undefined : { duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <m.div
        aria-hidden="true"
        className="absolute right-[-6%] top-[12%] h-72 w-72 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none"
        animate={reducedMotion ? undefined : { x: [0, -20, 0], y: [0, 14, 0] }}
        transition={reducedMotion ? undefined : { duration: 9.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/25 to-transparent"
        animate={reducedMotion ? undefined : { opacity: [0.2, 0.8, 0.2], scaleX: [0.8, 1, 0.8] }}
        transition={reducedMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <m.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white"
          >
            <SplitText
              text={t.title}
              tag="span"
              splitType="chars"
              className="block text-center"
              textAlign="center"
              delay={12}
              duration={0.36}
              threshold={0.14}
              rootMargin="-80px"
              from={{ opacity: 0, transform: "translateY(10px)" }}
              to={{ opacity: 1, transform: "translateY(0px)" }}
            />
          </m.h2>
          <div className="text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            <ScrollWordHighlight text={t.subtitle} wordClassName="text-gray-500" activeWordClassName="text-gray-300" />
          </div>
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
        <Accordion type="single" collapsible className="w-full space-y-4">
          {t.faqs.map((faq, index) => (
            <m.div
              key={index}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.06, type: "spring", stiffness: 120, damping: 18 }}
              whileHover={reducedMotion ? undefined : { y: -2 }}
            >
              <AccordionItem value={`item-${index}`} className="group relative overflow-hidden border border-white/5 bg-[#111113]/80 backdrop-blur-sm px-6 rounded-xl hover:border-orange-500/30 transition-all duration-300">
                <m.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-transparent via-white/8 to-transparent opacity-0 group-hover:opacity-100"
                  animate={reducedMotion ? undefined : { x: ["-140%", "520%"] }}
                  transition={reducedMotion ? undefined : { duration: 2.4, repeat: Infinity, repeatDelay: 1.2, ease: "linear" }}
                />
                <AccordionTrigger className="text-lg lg:text-xl font-bold hover:text-orange-500 transition-colors py-6 hover:no-underline text-left text-white">
                  <SplitText
                    text={faq.question}
                    tag="span"
                    splitType="words"
                    className="block pr-4"
                    delay={14}
                    duration={0.32}
                    threshold={0.18}
                    rootMargin="-40px"
                    from={{ opacity: 0, transform: "translateY(6px)" }}
                    to={{ opacity: 1, transform: "translateY(0px)" }}
                  />
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 text-base md:text-lg pb-6 leading-relaxed font-light">
                  <BlurText
                    as="p"
                    text={faq.answer}
                    className="text-gray-400 text-base md:text-lg leading-relaxed font-light"
                    animateBy="words"
                    direction="bottom"
                    delay={10}
                    threshold={0.15}
                    rootMargin="-30px"
                    stepDuration={0.16}
                  />
                </AccordionContent>
              </AccordionItem>
            </m.div>
          ))}
        </Accordion>
        </m.div>
      </div>
    </section>
  );
}
