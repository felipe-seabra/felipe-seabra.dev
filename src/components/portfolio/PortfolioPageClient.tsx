"use client";

import {useEffect,useState} from "react";
import {Github,Linkedin} from "lucide-react";
import {copy,type Locale} from "@/lib/i18n";
import {ScrollProgress} from "./ScrollProgress";
import {SmoothScroll} from "./SmoothScroll";
import {InteractiveCursor} from "./InteractiveCursor";
import {Header} from "./Header";
import {Hero} from "./Hero";
import {PortfolioSections} from "./PortfolioSections";
import {BackToTop} from "./BackToTop";
import type {ProjectItem,SocialLink,Theme,TimelineItem} from "./types";

export function PortfolioPageClient({locale,content,timeline,projects,social}:{locale:Locale;content:Record<string,string>;timeline:readonly TimelineItem[];projects:readonly ProjectItem[];social:{github:string;linkedin:string}}){
  const [theme,setTheme]=useState<Theme>("dark");
  const [open,setOpen]=useState(false);
  const [showTop,setShowTop]=useState(false);
  const t=copy[locale];
  const text=(section:string,field:string,fallback:string)=>content[section+"."+field]??fallback;

  useEffect(()=>{
    const stored=window.localStorage.getItem("portfolio-theme");
    const nextTheme=stored==="dark"||stored==="light"?stored:"dark";
    queueMicrotask(()=>setTheme(nextTheme));
  },[]);

  useEffect(()=>{
    document.documentElement.dataset.theme=theme;
    document.documentElement.lang=locale;
    window.localStorage.setItem("portfolio-theme",theme);
  },[theme,locale]);

  useEffect(()=>{
    const handleScroll=()=>setShowTop(window.scrollY>700);
    handleScroll();
    window.addEventListener("scroll",handleScroll,{passive:true});
    return()=>window.removeEventListener("scroll",handleScroll);
  },[]);

  const toggleTheme=()=>setTheme(value=>value==="dark"?"light":"dark");
  const navItems=[
    ["journey","#journey",text("nav","journey",t.nav.journey)],
    ["work","#work",text("nav","work",t.nav.work)],
    ["about","#about",text("nav","about",t.nav.about)],
    ["contact","#contact",text("nav","contact",t.nav.contact)],
  ] as const;
  const socialLinks=[
    social.github?{label:"GitHub",href:social.github,icon:Github}:null,
    social.linkedin?{label:"LinkedIn",href:social.linkedin,icon:Linkedin}:null,
  ].filter(Boolean) as SocialLink[];

  return <main id="top" className="overflow-hidden bg-[var(--bg)] text-[var(--fg)] transition-colors duration-500">
    <SmoothScroll/><ScrollProgress/><InteractiveCursor/>
    <Header locale={locale} theme={theme} open={open} onMenuToggle={()=>setOpen(value=>!value)} onThemeToggle={toggleTheme} navItems={navItems} socialLinks={socialLinks} text={text} talkEmail={text("contact","email","hello@felipeseabra.com.br")}/>
    <div className="side-scroll-indicator" aria-hidden="true"><span>SCROLL</span><i/></div>
    <Hero text={text} location={text("hero","location",t.hero.location)} eyebrow={text("hero","eyebrow",t.hero.eyebrow)} title={text("hero","title",t.hero.title)} intro={text("hero","intro",t.hero.intro)} cta={text("hero","cta",t.hero.cta)}/>
    <PortfolioSections timeline={timeline} projectItems={projects} cms={content} text={text} t={t} socialLinks={socialLinks}/>
    <BackToTop visible={showTop}/>
  </main>;
}
