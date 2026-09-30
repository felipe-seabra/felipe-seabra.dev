"use client";

import {useEffect,useRef} from "react";
import {AnimatePresence,motion} from "framer-motion";
import {ArrowUpRight,Menu,X} from "lucide-react";
import {LanguageSwitch,ThemeSwitch} from "./Controls";
import type {Locale,PortfolioText,SocialLink,Theme} from "./types";
import {isValidHttpUrl} from "@/lib/url-validation";

export function Header({locale,theme,open,onMenuToggle,onThemeToggle,navItems,socialLinks,text,talkEmail}:{locale:Locale;theme:Theme;open:boolean;onMenuToggle:()=>void;onThemeToggle:()=>void;navItems:readonly (readonly [string,string,string])[];socialLinks:SocialLink[];text:PortfolioText;talkEmail:string}){
  const menuButtonRef=useRef<HTMLButtonElement>(null);

  useEffect(()=>{
    if(!open)return;
    const handlePointerDown=(event:PointerEvent)=>{
      if(event.target instanceof Node&&menuButtonRef.current?.contains(event.target))return;
      onMenuToggle();
    };
    const handleKeyDown=(event:KeyboardEvent)=>{
      if(event.key==="Escape")onMenuToggle();
    };
    document.addEventListener("pointerdown",handlePointerDown);
    document.addEventListener("keydown",handleKeyDown);
    return()=>{
      document.removeEventListener("pointerdown",handlePointerDown);
      document.removeEventListener("keydown",handleKeyDown);
    };
  },[open,onMenuToggle]);

  return <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-xl">
    <div className="mx-auto flex h-[88px] max-w-[1400px] items-center justify-between px-5 md:px-8">
      <a href="#top" className="signature-logo text-[2rem] leading-none text-[var(--fg)]" aria-label="Felipe Seabra">Felipe Seabra<span className="ml-2 inline-block h-2 w-2 rounded-full bg-[var(--accent)] align-middle"/></a>
      <nav className="hidden items-center gap-8 md:flex">
        {navItems.map(([key,href,label])=><a key={key} href={href} className={"nav-link text-sm text-[var(--muted)] transition-colors hover:text-[var(--fg)] "+(key==="journey"?"nav-link-active":"")}>{label}</a>)}
        {socialLinks.map(({label,href,icon:Icon})=><a key={label} href={isValidHttpUrl(href) ? href : "#contact"} target={isValidHttpUrl(href) ? "_blank" : undefined} rel={isValidHttpUrl(href) ? "noreferrer" : undefined} aria-label={label} className="text-[var(--muted)] transition-colors hover:text-[var(--fg)]"><Icon size={18}/></a>)}
        <LanguageSwitch locale={locale}/>
        <ThemeSwitch theme={theme} onToggle={onThemeToggle}/>
        <a href={"mailto:"+talkEmail} className="rounded-full border border-[var(--accent)] px-5 py-2.5 text-sm text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--bg)]">{text("nav","talk","Let's talk")} <ArrowUpRight size={14} className="inline"/></a>
      </nav>
      <button ref={menuButtonRef} type="button" aria-label={open?"Close menu":"Open menu"} onClick={onMenuToggle} className="md:hidden">{open?<X size={20}/>:<Menu size={20}/>}</button>
    </div>
    <AnimatePresence>
      {open&&<motion.nav initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} className="mx-auto mt-2 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xl md:hidden">
        {navItems.map(([key,href,label])=><a onClick={onMenuToggle} key={key} href={href} className="block border-b border-[var(--line)] py-4 text-lg">{label}</a>)}
        <div className="flex gap-3 pt-5">{socialLinks.map(({label,href,icon:Icon})=><a key={label} href={isValidHttpUrl(href) ? href : "#contact"} target={isValidHttpUrl(href) ? "_blank" : undefined} rel={isValidHttpUrl(href) ? "noreferrer" : undefined} className="flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-xs"><Icon size={14}/>{label}</a>)}</div>
        <div className="flex items-center gap-3 pt-3"><LanguageSwitch locale={locale}/><ThemeSwitch theme={theme} onToggle={onThemeToggle}/></div>
      </motion.nav>}
    </AnimatePresence>
  </header>;
}
