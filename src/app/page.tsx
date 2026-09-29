"use client";

import {useEffect,useState} from "react";
import {Github,Linkedin} from "lucide-react";
import {copy,projects,type Locale} from "@/lib/i18n";
import {ScrollProgress} from "@/components/portfolio/ScrollProgress";
import {SmoothScroll} from "@/components/portfolio/SmoothScroll";
import {InteractiveCursor} from "@/components/portfolio/InteractiveCursor";
import {Header} from "@/components/portfolio/Header";
import {Hero} from "@/components/portfolio/Hero";
import {PortfolioSections} from "@/components/portfolio/PortfolioSections";
import {BackToTop} from "@/components/portfolio/BackToTop";
import {StructuredData} from "@/components/portfolio/StructuredData";
import type {ProjectItem,Theme,TimelineItem} from "@/components/portfolio/types";

export default function PortfolioPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [projectItems, setProjectItems] = useState<ProjectItem[]>(projects.map((p, i) => ({ ...p, number: p.number, sort_order: i })));
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [cms, setCms] = useState<Record<string, string>>({});
  const [social, setSocial] = useState({ github: "https://github.com/felipe-seabra", linkedin: "https://www.linkedin.com/in/felipe-seabra/" });
  const t = copy[locale];
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


  const toggleLocale = () => setLocale(v => v === "en" ? "pt" : "en");
  const toggleTheme = () => setTheme(v => v === "dark" ? "light" : "dark");
  const timeline = timelineItems.length ? timelineItems : t.timeline.entries;
  const navItems = [["journey", "#journey", text("nav", "journey", t.nav.journey)], ["work", "#work", text("nav", "work", t.nav.work)], ["about", "#about", text("nav", "about", t.nav.about)], ["contact", "#contact", text("nav", "contact", t.nav.contact)]] as const;
  const socialLinks = [social.github ? { label: "GitHub", href: social.github, icon: Github } : null, social.linkedin ? { label: "LinkedIn", href: social.linkedin, icon: Linkedin } : null].filter(Boolean) as { label: string; href: string; icon: typeof Github }[];

  return <main id="top" className="overflow-hidden bg-[var(--bg)] text-[var(--fg)] transition-colors duration-500">
    <SmoothScroll /><ScrollProgress /><InteractiveCursor /><StructuredData socialLinks={socialLinks} />    <Header locale={locale} theme={theme} open={open} onMenuToggle={()=>setOpen(v=>!v)} onLocaleToggle={toggleLocale} onThemeToggle={toggleTheme} navItems={navItems} socialLinks={socialLinks} text={text} talkEmail={text("contact","email","hello@felipeseabra.com.br")} />
    <div className="side-scroll-indicator" aria-hidden="true"><span>SCROLL</span><i /></div>    <Hero text={text} location={text("hero","location",t.hero.location)} eyebrow={text("hero","eyebrow",t.hero.eyebrow)} title={text("hero","title",t.hero.title)} intro={text("hero","intro",t.hero.intro)} cta={text("hero","cta",t.hero.cta)} />

    <PortfolioSections timeline={timeline} projectItems={projectItems} cms={cms} text={text} t={t} socialLinks={socialLinks} />
    <BackToTop visible={showTop} />
  </main>;
}
