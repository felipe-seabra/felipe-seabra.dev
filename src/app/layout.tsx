import type {Metadata,Viewport} from "next";
import "./globals.css";
import {createClient} from "@/lib/supabase/server";

const siteUrl="https://felipeseabra.com.br";

async function getSiteContent(){
  const supabase=await createClient();
  if(!supabase)return {};
  const {data}=await supabase.from("site_content").select("section,field,value").eq("locale","en");
  return Object.fromEntries((data??[]).map(row=>[`${row.section}.${row.field}`,row.value]));
}

export async function generateMetadata():Promise<Metadata>{
  const content=await getSiteContent();
  const title=content["seo.title"]||"Felipe Seabra — Front-End Developer";
  const description=content["seo.description"]||"Portfolio and career timeline of Felipe Seabra, a Front-End focused Full-Stack Developer based in Dublin, Ireland.";
  const linkedin=content["social.linkedin"];
  const github=content["social.github"]||"https://github.com/felipe-seabra";
  return {
    metadataBase:new URL(siteUrl),
    title:{default:title,template:"%s | Felipe Seabra"},
    description,
    keywords:["Felipe Seabra","Front-End Developer","Full-Stack Developer","Next.js Developer","React Developer","TypeScript Developer","Dublin Developer","Web Developer Ireland"],
    authors:[{name:"Felipe Seabra",url:siteUrl}],
    creator:"Felipe Seabra",
    alternates:{canonical:"/"},
    icons:{icon:"/favicon.svg",shortcut:"/favicon.svg",apple:"/favicon.svg"},
    openGraph:{title,description,url:siteUrl,siteName:"Felipe Seabra",type:"website",locale:"en_IE",images:[{url:"/og-image.svg",width:1200,height:630,alt:"Felipe Seabra — Front-End Developer"}]},
    twitter:{card:"summary_large_image",title,description,images:["/og-image.svg"]},
    robots:{index:true,follow:true,googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}},
    other:{"profile:first_name":"Felipe","profile:last_name":"Seabra","profile:username":"felipe-seabra","profile:gender":"male","profile:website":siteUrl,"profile:same_as":JSON.stringify([github,...(linkedin?[linkedin]:[])])},
  };
}

export const viewport:Viewport={width:"device-width",initialScale:1,colorScheme:"dark light",themeColor:[{media:"(prefers-color-scheme: dark)",color:"#080808"},{media:"(prefers-color-scheme: light)",color:"#f2f1ec"}]};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;}
