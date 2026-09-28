"use client";

import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Github, Languages, Linkedin, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { copy, projects, type Locale } from "@/lib/i18n";
import { ScrollProgress } from "@/components/portfolio/ScrollProgress";
import { SmoothScroll } from "@/components/portfolio/SmoothScroll";

type Theme = "dark" | "light";
type ProjectItem = {
  id?: string;
  number?: string;
  title: string;
  category: string;
  description: string;
  stack: readonly string[];
  href: string;
  github_url?: string | null;
  image_url?: string | null;
  featured?: boolean;
  published?: boolean;
  sort_order?: number;
};
type TimelineItem = { chapter: string; period: string; title: string; body: string; tags: string[] };

function InteractiveCursor() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const springX = useSpring(x, { stiffness: 120, damping: 22, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 120, damping: 22, mass: 0.5 });

  useEffect(() => {
    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: springX, y: springY }}
      className="pointer-events-none fixed left-0 top-0 z-40 hidden h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[.07] blur-3xl md:block"
    />
  );
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: .7, delay, ease: [.22, 1, .36, 1] }}>{children}</motion.div>;
}

function Avatar() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -90]);
  const rotate = useTransform(scrollY, [0, 1000], [-1.5, 2]);
  const scale = useTransform(scrollY, [0, 1000], [1, 0.96]);

  return (
    <motion.div
      style={{ y, rotate, scale }}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .9, ease: [.22, 1, .36, 1] }}
      whileHover={{ scale: 1.015 }}
      className="relative mx-auto w-full max-w-[620px] lg:sticky lg:top-24"
      role="img"
      aria-label="Illustrated caricature of Felipe Seabra wearing headphones and a hoodie"
    >
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <motion.div
          animate={{ opacity: [.12, .24, .12], scale: [1, 1.08, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-16 rounded-full bg-[var(--accent)] blur-3xl"
        />
        <img
          src="/avatar-caricature.svg"
          alt="Caricature of Felipe Seabra with dark hair, full beard, headphones and hoodie"
          className="relative z-10 w-full max-w-[620px] drop-shadow-[0_35px_80px_rgba(0,0,0,.42)]"
        />
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [projectItems, setProjectItems] = useState<ProjectItem[]>(projects.map((p, i) => ({ ...p, number: p.number, sort_order: i })));
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [cms, setCms] = useState<Record<string, string>>({});
  const [social, setSocial] = useState({ github: "https://github.com/felipe-seabra", linkedin: "https://www.linkedin.com/in/felipe-seabra/" });
  const t = copy[locale];
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 900], [0, 160]);
  const heroScale = useTransform(scrollY, [0, 900], [1, 1.08]);
  const text = (section: string, field: string, fallback: string) => cms[`${section}.${field}`] ?? fallback;

  useEffect(() => {
    const l = window.localStorage.getItem("portfolio-locale");
    const th = window.localStorage.getItem("portfolio-theme");
    const nextLocale = l === "en" || l === "pt" ? l : "en";
    const nextTheme = th === "dark" || th === "light" ? th : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.lang = nextLocale;
    queueMicrotask(() => { setLocale(nextLocale); setTheme(nextTheme) });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = locale;
    window.localStorage.setItem("portfolio-theme", theme);
    window.localStorage.setItem("portfolio-locale", locale);
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/content?locale=" + locale, { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json() as {
          content: Record<string, string>;
          timeline: TimelineItem[];
          projects: ProjectItem[];
        };
        if (!active) return;
        setCms(payload.content ?? {});
        if (payload.timeline?.length) setTimelineItems(payload.timeline);
        if (payload.projects?.length) setProjectItems(payload.projects.map((item, index) => ({ ...item, number: String(index + 1).padStart(2, "0") })));
        setSocial({
          github: payload.content?.["social.github"] || "https://github.com/felipe-seabra",
          linkedin: payload.content?.["social.linkedin"] || "https://www.linkedin.com/in/felipe-seabra/",
        });
      } catch {
        // Keep the local fallback content available when the API is unreachable.
      }
    };
    void load();
    return () => { active = false };
  }, [locale, theme]);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 700);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const toggleLocale = () => setLocale(v => v === "en" ? "pt" : "en");
  const toggleTheme = () => setTheme(v => v === "dark" ? "light" : "dark");
  const timeline = timelineItems.length ? timelineItems : t.timeline.entries;
  const navItems = [["journey", "#journey", text("nav", "journey", t.nav.journey)], ["work", "#work", text("nav", "work", t.nav.work)], ["about", "#about", text("nav", "about", t.nav.about)], ["contact", "#contact", text("nav", "contact", t.nav.contact)]] as const;
  const socialLinks = [social.github ? { label: "GitHub", href: social.github, icon: Github } : null, social.linkedin ? { label: "LinkedIn", href: social.linkedin, icon: Linkedin } : null].filter(Boolean) as { label: string; href: string; icon: typeof Github }[];

  return <main id="top" className="overflow-hidden bg-[var(--bg)] text-[var(--fg)] transition-colors duration-500">
    <SmoothScroll /><ScrollProgress /><InteractiveCursor />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "ProfilePage", "mainEntity": { "@type": "Person", "@id": "https://felipeseabra.com.br/#person", "name": "Felipe Seabra", "url": "https://felipeseabra.com.br/", "jobTitle": "Front-End focused Full-Stack Developer", "image": "https://felipeseabra.com.br/avatar-caricature.svg", "address": { "@type": "PostalAddress", "addressLocality": "Dublin", "addressCountry": "IE" }, "sameAs": socialLinks.map(link => link.href) } }) }} />
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-[88px] max-w-[1400px] items-center justify-between px-5 md:px-8">
        <a href="#top" className="signature-logo text-[2rem] leading-none text-[var(--fg)]" aria-label="Felipe Seabra">Felipe Seabra<span className="ml-2 inline-block h-2 w-2 rounded-full bg-[var(--accent)] align-middle" /></a>
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map(([key, href, label]) => <a key={key} href={href} className={`nav-link text-sm text-[var(--muted)] transition-colors hover:text-[var(--fg)] ${key === "journey" ? "nav-link-active" : ""}`}>{label}</a>)}
          {socialLinks.map(link => { const Icon = link.icon; return <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} className="text-[var(--muted)] transition-colors hover:text-[var(--fg)]"><Icon size={18} /></a> })}
          <button type="button" onClick={toggleLocale} className="text-sm text-[var(--muted)] hover:text-[var(--fg)]" aria-label={t.controls.language}>{locale === "en" ? "PT" : "EN"}</button>
          <button type="button" onClick={toggleTheme} className="text-[var(--muted)] hover:text-[var(--fg)]" aria-label={t.controls.theme}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
          <a href={`mailto:${text("contact", "email", "hello@felipeseabra.com.br")}`} className="rounded-full border border-[var(--accent)] px-5 py-2.5 text-sm text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--bg)]">{text("nav", "talk", t.nav.talk)} <ArrowUpRight size={14} className="inline" /></a>
        </nav>
        <button type="button" aria-label={open ? t.controls.menuClose : t.controls.menuOpen} onClick={() => setOpen(!open)} className="md:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      <AnimatePresence>{open && <motion.nav initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mx-auto mt-2 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xl md:hidden">
        {navItems.map(([key, href, label]) => <a onClick={() => setOpen(false)} key={key} href={href} className="block border-b border-[var(--line)] py-4 text-lg">{label}</a>)}
        <div className="flex gap-3 pt-5">{socialLinks.map(link => { const Icon = link.icon; return <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-xs"><Icon size={14} />{link.label}</a> })}</div>
        <div className="flex gap-3 pt-3"><button type="button" onClick={toggleLocale} className="rounded-full border border-[var(--line)] px-4 py-2 text-xs">{locale === "en" ? "Português" : "English"}</button><button type="button" onClick={toggleTheme} className="rounded-full border border-[var(--line)] px-4 py-2 text-xs">{theme === "dark" ? t.controls.light : t.controls.dark}</button></div>
      </motion.nav>}</AnimatePresence>
    </header>
    <div className="side-scroll-indicator" aria-hidden="true"><span>SCROLL</span><i /></div>

    <section className="relative flex min-h-[100svh] items-center px-5 pb-16 pt-28 md:px-8 md:pb-20">
      <motion.div style={{ y: heroY, scale: heroScale }} className="pointer-events-none absolute inset-0"><div className="glow absolute inset-0" /><div className="grid-lines absolute inset-0 opacity-60" /><div className="noise absolute inset-0 opacity-[.12]" /></motion.div>
      <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,1.05fr)] lg:gap-10">
        <div>
          <div className="mb-7 flex flex-wrap justify-between gap-4 font-mono text-[10px] uppercase tracking-[.2em] text-[var(--faint)] md:mb-9"><span>{text("hero", "location", t.hero.location)}</span><span>{text("hero", "eyebrow", t.hero.eyebrow)}</span></div>
          <motion.h1 initial={{ y: 36 }} animate={{ y: 0 }} transition={{ duration: 1, ease: [.22, 1, .36, 1] }} className="max-w-6xl text-[14vw] font-medium leading-[.78] tracking-[-.09em]">{text("hero", "name_first", "Felipe")}<br /><span className="ml-[8vw] text-[var(--faint)]">{text("hero", "name_last", "Seabra.")}</span></motion.h1>
          <div className="mt-10 grid gap-7 md:grid-cols-[1fr_360px] md:items-end lg:mt-12"><p className="max-w-2xl text-lg leading-7 text-[var(--muted)] md:text-xl">{text("hero", "title", t.hero.title)}</p><div><p className="mb-5 max-w-sm text-sm leading-6 text-[var(--muted)]">{text("hero", "intro", t.hero.intro)}</p><a href="#journey" className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[.18em]"><span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)]"><ArrowDown size={15} /></span>{text("hero", "cta", t.hero.cta)}</a></div></div>
        </div>
        <Avatar />
      </div>
    </section>

    <section id="journey" className="border-y border-[var(--line)] px-5 py-24 md:px-8 md:py-36"><div className="mx-auto max-w-[1400px]">
      <Reveal><div className="mb-20 max-w-3xl"><span className="font-mono text-xs uppercase tracking-[.2em] text-[var(--faint)]">{text("timeline", "label", t.timeline.label)}</span><h2 className="mt-5 text-5xl tracking-[-.06em] md:text-8xl">{text("timeline", "title", t.timeline.title)}</h2><p className="mt-7 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg">{text("timeline", "intro", t.timeline.intro)}</p></div></Reveal>
      <div className="relative"><motion.div style={{ scaleY: useTransform(useScroll().scrollYProgress, [0.08, 0.48], [0, 1]) }} className="timeline-line absolute bottom-0 left-[11px] top-0 w-px origin-top md:left-1/2" />
        {timeline.map((entry, index) => <Reveal key={entry.chapter} delay={index * .05} className="relative mb-16 last:mb-0 md:mb-24"><div className="grid gap-8 md:grid-cols-2 md:gap-20">
          <div className={index % 2 === 0 ? "md:pr-20" : "md:order-2 md:pl-20"}><div className="relative pl-10 md:pl-0"><motion.div animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} className="timeline-dot absolute left-[-1px] top-1 h-6 w-6 rounded-full md:hidden" /><span className="font-mono text-[10px] uppercase tracking-[.2em] text-[var(--faint)]">{entry.period}</span><h3 className="mt-3 text-3xl tracking-[-.04em] md:text-5xl">{entry.title}</h3></div></div>
          <div className={index % 2 === 0 ? "md:pl-20" : "md:order-1 md:pr-20"}><div className="relative pl-10 md:pl-0"><motion.div animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} className="timeline-dot absolute left-[-1px] top-1 hidden h-6 w-6 rounded-full md:block" /><p className="max-w-xl text-base leading-7 text-[var(--muted)]">{entry.body}</p><div className="mt-6 flex flex-wrap gap-2">{entry.tags.map(tag => <span key={tag} className="rounded-full border border-[var(--line)] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.12em] text-[var(--faint)]">{tag}</span>)}</div></div></div>
        </div></Reveal>)}
      </div>
    </div></section>

    <section id="work" className="relative px-5 py-24 md:px-8 md:py-36"><motion.div style={{ x: useTransform(useScroll().scrollYProgress, [.15, .55], [-80, 80]), opacity: useTransform(useScroll().scrollYProgress, [.15, .3, .55], [0, .22, 0]) }} className="pointer-events-none absolute right-[-10%] top-1/3 h-72 w-72 rounded-full bg-[var(--accent)] blur-[100px]" />
      <div className="mx-auto max-w-[1400px]"><Reveal><div className="mb-14 max-w-3xl"><span className="font-mono text-xs uppercase tracking-[.2em] text-[var(--faint)]">{text("work", "label", t.work.label)}</span><h2 className="mt-5 text-5xl tracking-[-.06em] md:text-8xl">{text("work", "title", t.work.title)}</h2><p className="mt-7 text-base leading-7 text-[var(--muted)] md:text-lg">{text("work", "intro", t.work.intro)}</p></div></Reveal>
        {projectItems.map((project, index) => <Reveal key={project.id ?? project.title} delay={index * .05}><motion.a href={project.href} target={project.href.startsWith("http") ? "_blank" : undefined} rel={project.href.startsWith("http") ? "noreferrer" : undefined} whileHover={{ x: 10, y: -5, scale: 1.01 }} transition={{ duration: .35, ease: [.22, 1, .36, 1] }} className="group grid gap-5 rounded-xl border-t border-[var(--line)] py-8 md:grid-cols-[70px_1fr_280px_70px] md:items-center">
          <span className="font-mono text-xs text-[var(--faint)]">{project.number ?? String(index + 1).padStart(2, "0")}</span><div><span className="text-xs uppercase tracking-[.18em] text-[var(--faint)]">{project.category}</span><h3 className="mt-2 text-3xl tracking-[-.04em] md:text-5xl">{project.title}</h3><div className="mt-5 flex flex-wrap gap-2">{project.stack.map(tag => <span key={tag} className="font-mono text-[9px] text-[var(--faint)]">{tag}</span>)}</div></div><p className="text-sm leading-6 text-[var(--muted)]">{project.description}</p><span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] transition-transform duration-300 group-hover:rotate-45"><ArrowUpRight size={17} /></span>
        </motion.a></Reveal>)}
      </div>
    </section>

    <section id="about" className="border-t border-[var(--line)] px-5 py-24 md:px-8 md:py-36"><div className="mx-auto grid max-w-[1400px] gap-14 md:grid-cols-[.65fr_1.35fr]"><Reveal><span className="font-mono text-xs uppercase tracking-[.2em] text-[var(--faint)]">{text("about", "label", t.about.label)}</span></Reveal><Reveal><p className="text-3xl leading-[1.08] tracking-[-.05em] md:text-6xl">{text("about", "title", t.about.title)}</p><p className="mt-10 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg">{text("about", "body", t.about.body)}</p><div className="mt-10 inline-flex rounded-full border border-[var(--line)] px-4 py-2 font-mono text-[10px] uppercase tracking-[.15em] text-[var(--faint)]">{text("about", "experience", t.about.experience)}</div></Reveal></div></section>

    <section className="px-5 pb-24 md:px-8 md:pb-36"><div className="mx-auto grid max-w-[1400px] gap-5 md:grid-cols-2 lg:grid-cols-4">{t.capabilities.map((skill, index) => <Reveal key={skill} delay={index * .04}><div className="border-t border-[var(--line)] pt-5"><span className="font-mono text-[10px] text-[var(--faint)]">0{index + 1}</span><p className="mt-7 text-lg text-[var(--muted)]">{cms[`capabilities.${index}`] ?? skill}</p></div></Reveal>)}</div></section>

    <section id="contact" className="relative border-t border-[var(--line)] px-5 py-28 md:px-8 md:py-44"><div className="glow absolute inset-0" /><div className="noise absolute inset-0 opacity-[.08]" /><div className="relative mx-auto max-w-[1400px]"><Reveal><span className="font-mono text-xs uppercase tracking-[.2em] text-[var(--faint)]">{text("contact", "label", t.contact.label)}</span><h2 className="mt-8 max-w-6xl text-[13vw] font-medium leading-[.8] tracking-[-.09em] md:text-[9vw]">{text("contact", "title", t.contact.title)}</h2><p className="mt-10 max-w-xl text-base leading-7 text-[var(--muted)] md:text-lg">{text("contact", "body", t.contact.body)}</p></Reveal><Reveal delay={.08}><div className="mt-10 flex flex-wrap items-center gap-5"><a href={`mailto:${text("contact", "email", "hello@felipeseabra.com.br")}`} className="inline-flex items-center gap-3 text-xl transition-opacity hover:opacity-60 md:text-2xl">{text("contact", "cta", t.contact.cta)}<ArrowUpRight size={19} /></a>{socialLinks.map(link => { const Icon = link.icon; return <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-xs"><Icon size={14} />{link.label}</a> })}</div></Reveal></div></section>

    <AnimatePresence>
      {showTop && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.85, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 16 }}
          whileHover={{ y: -4, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)]/90 text-[var(--fg)] shadow-2xl backdrop-blur-xl transition-colors hover:border-[var(--fg)]"
        >
          <ArrowUpRight size={17} className="-rotate-45" />
        </motion.button>
      )}
    </AnimatePresence>

    <footer className="border-t border-[var(--line)] px-5 py-7 md:px-8"><div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-3 font-mono text-[10px] uppercase tracking-[.18em] text-[var(--faint)]"><span>© {new Date().getFullYear()} Felipe Seabra</span><span>{text("hero", "location", t.hero.location)}</span><span>Next.js / TypeScript</span></div></footer>
  </main>;
}
