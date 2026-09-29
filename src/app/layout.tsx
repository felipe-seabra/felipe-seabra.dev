import type {Metadata,Viewport} from "next";
import "./globals.css";
import {prisma} from "@/lib/prisma";

const siteUrl="https://felipeseabra.com.br";
const defaultTitle="Felipe Seabra — Front-End Developer";
const defaultDescription="Portfolio and career timeline of Felipe Seabra, a Front-End focused Full-Stack Developer based in Dublin, Ireland.";

async function getSeoContent(){
 try{
  const rows=await prisma.siteContent.findMany({where:{locale:"en",section:"seo"},select:{field:true,value:true}});
  return Object.fromEntries(rows.map(row=>[row.field,row.value]));
 }catch{return {}}
}

export async function generateMetadata():Promise<Metadata>{
 const seo=await getSeoContent();
 const title=seo.title||defaultTitle;
 const description=seo.description||defaultDescription;
 return {
  metadataBase:new URL(siteUrl),
  title:{default:title,template:"%s | Felipe Seabra"},
  description,
  authors:[{name:"Felipe Seabra",url:siteUrl}],
  creator:"Felipe Seabra",
  publisher:"Felipe Seabra",
  alternates:{canonical:"/"},
  icons:{icon:"/favicon.svg",shortcut:"/favicon.svg",apple:"/favicon.svg"},
  openGraph:{type:"website",locale:"en_IE",url:siteUrl,siteName:"Felipe Seabra",title,description,images:[{url:"/og-image.svg",width:1200,height:630,alt:"Felipe Seabra — Front-End Developer"}]},
  twitter:{card:"summary_large_image",title,description,images:["/og-image.svg"]},
  robots:{index:true,follow:true,googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}},
 };
}

export const viewport:Viewport={width:"device-width",initialScale:1,colorScheme:"dark light",themeColor:[{media:"(prefers-color-scheme: dark)",color:"#080808"},{media:"(prefers-color-scheme: light)",color:"#f2f1ec"}]};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body>{children}</body></html>}
