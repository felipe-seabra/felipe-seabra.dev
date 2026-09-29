import type {Metadata,Viewport} from "next";
import "./globals.css";

const siteUrl="https://felipeseabra.com.br";
const defaultTitle="Felipe Seabra — Front-End Developer";
const defaultDescription="Portfolio and career timeline of Felipe Seabra, a Front-End focused Full-Stack Developer based in Dublin, Ireland.";
const ogImage={
  url:`${siteUrl}/og-image.svg`,
  width:1200,
  height:630,
  alt:"Felipe Seabra — Front-End focused Full-Stack Developer",
};

export const metadata:Metadata={
  metadataBase:new URL(siteUrl),
  title:{default:defaultTitle,template:"%s | Felipe Seabra"},
  description:defaultDescription,
  authors:[{name:"Felipe Seabra",url:siteUrl}],
  creator:"Felipe Seabra",
  publisher:"Felipe Seabra",
  openGraph:{
    type:"website",
    siteName:"Felipe Seabra",
    images:[ogImage],
  },
  twitter:{
    card:"summary_large_image",
    images:[ogImage.url],
  },
  icons:{icon:"/favicon.ico",shortcut:"/favicon.ico",apple:"/favicon.ico"},
  robots:{index:true,follow:true,googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}},
};

export const viewport:Viewport={
  width:"device-width",
  initialScale:1,
  colorScheme:"dark light",
  themeColor:[
    {media:"(prefers-color-scheme: dark)",color:"#080808"},
    {media:"(prefers-color-scheme: light)",color:"#f2f1ec"},
  ],
};

export default async function RootLayout({children}:{children:React.ReactNode}){
  const {headers}=await import("next/headers");
  const requestHeaders=await headers();
  const locale=requestHeaders.get("x-portfolio-locale")==="pt"?"pt":"en";
  return <html lang={locale} suppressHydrationWarning><body>{children}</body></html>;
}
