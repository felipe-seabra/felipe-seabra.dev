"use client";

import {motion} from "framer-motion";
import {ArrowDown,ArrowLeft,Compass,Home,RotateCcw} from "lucide-react";
import Link from "next/link";
import {useEffect,useState} from "react";

const messages=[
  "This route took a wrong turn.",
  "The page is somewhere out there. Probably.",
  "404. Even the navigation needs debugging sometimes.",
];

export function NotFoundPage(){
  const [messageIndex,setMessageIndex]=useState(0);
  const [rotation,setRotation]=useState(-8);

  useEffect(()=>{
    const handleKeyDown=(event:KeyboardEvent)=>{
      if(event.key.toLowerCase()==="r"){
        setMessageIndex(index=>(index+1)%messages.length);
        setRotation(value=>value+45);
      }
    };

    window.addEventListener("keydown",handleKeyDown);
    return()=>window.removeEventListener("keydown",handleKeyDown);
  },[]);

  const recalibrate=()=>{
    setMessageIndex(index=>(index+1)%messages.length);
    setRotation(value=>value+45);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-70"/>
      <div className="pointer-events-none absolute inset-0 glow"/>
      <div className="pointer-events-none absolute inset-0 noise opacity-30"/>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-6 py-6 md:px-10 md:py-8">
        <header className="flex items-center justify-between border-b border-[var(--line)] pb-5">
          <Link href="/" className="signature-logo text-3xl" aria-label="Felipe Seabra home">
            Felipe Seabra<span className="ml-1 text-[var(--accent)]">.</span>
          </Link>

          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-[var(--faint)]">
            Error / 404
          </span>
        </header>

        <section className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.1fr_.9fr] lg:gap-20 lg:py-20">
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--accent)]">
              Route not found
            </p>

            <div className="relative select-none">
              <motion.div
                animate={{rotate:rotation}}
                transition={{type:"spring",stiffness:70,damping:12}}
                className="origin-left text-[clamp(8rem,22vw,19rem)] font-semibold leading-[0.72] tracking-[-0.09em] text-[var(--fg)]"
              >
                404
              </motion.div>

              <motion.div
                animate={{x:[0,8,0],opacity:[0.18,0.35,0.18]}}
                transition={{duration:3,repeat:Infinity,ease:"easeInOut"}}
                className="absolute -bottom-2 left-[9%] h-px w-[58%] bg-[var(--accent)]"
              />
            </div>

            <div className="mt-10 max-w-xl">
              <motion.h1
                key={messageIndex}
                initial={{opacity:0,y:10}}
                animate={{opacity:1,y:0}}
                className="text-2xl font-medium tracking-tight md:text-4xl"
              >
                {messages[messageIndex]}
              </motion.h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-[var(--muted)] md:text-base">
                The URL you followed does not exist here. The rest of the portfolio is still on the map.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--fg)] px-5 py-3 text-xs uppercase tracking-[0.18em] transition hover:bg-[var(--fg)] hover:text-[var(--bg)]"
              >
                <Home size={14}/>
                Back home
              </Link>

              <button
                type="button"
                onClick={recalibrate}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)] transition hover:border-[var(--fg)] hover:text-[var(--fg)]"
              >
                <RotateCcw size={14}/>
                Recalibrate
              </button>
            </div>

            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--faint)]">
              Press R to recalibrate
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]">
              <div className="absolute inset-[12%] rounded-full border border-[var(--line)]"/>
              <div className="absolute inset-[25%] rounded-full border border-[var(--line)]"/>
              <div className="absolute inset-[38%] rounded-full border border-[var(--line)]"/>

              <motion.div
                animate={{rotate:rotation}}
                transition={{type:"spring",stiffness:70,damping:12}}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="absolute h-px w-[78%] bg-[var(--line)]"/>
                <div className="absolute h-[78%] w-px bg-[var(--line)]"/>
                <div className="absolute h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_18px_var(--accent)]"/>
                <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 font-mono text-[8px] uppercase tracking-[0.28em] text-[var(--faint)]">
                  recalibrating
                </div>
              </motion.div>

              {[
                {label:"JOURNEY",href:"/#journey",position:"left-[12%] top-[23%]"},
                {label:"WORK",href:"/#work",position:"right-[11%] top-[35%]"},
                {label:"ABOUT",href:"/#about",position:"left-[23%] bottom-[20%]"},
                {label:"CONTACT",href:"/#contact",position:"right-[17%] bottom-[17%]"},
              ].map(item=>(
                <Link
                  key={item.label}
                  href={item.href}
                  className={`absolute ${item.position} group flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.22em] text-[var(--faint)] transition hover:text-[var(--fg)]`}
                >
                  <span className="h-1.5 w-1.5 rounded-full border border-current transition group-hover:bg-[var(--accent)] group-hover:shadow-[0_0_10px_var(--accent)]"/>
                  {item.label}
                </Link>
              ))}

              <motion.div
                animate={{y:[-5,5,-5],rotate:[-8,8,-8]}}
                transition={{duration:4,repeat:Infinity,ease:"easeInOut"}}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--fg)] bg-[var(--bg)] shadow-[0_0_50px_color-mix(in_srgb,var(--accent)_12%,transparent)]">
                  <Compass size={28} strokeWidth={1.2}/>
                </div>
              </motion.div>

              <div className="absolute left-5 top-5 font-mono text-[8px] uppercase tracking-[0.22em] text-[var(--faint)]">
                Navigation system
              </div>

              <div className="absolute bottom-5 right-5 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.22em] text-[var(--accent)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]"/>
                Signal found
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.22em] text-[var(--faint)]">
              <span className="inline-flex items-center gap-2">
                <ArrowLeft size={12}/>
                Choose a destination
              </span>
              <span className="inline-flex items-center gap-2">
                <ArrowDown size={12}/>
                Keep exploring
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
