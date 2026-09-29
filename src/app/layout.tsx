import type {Metadata,Viewport} from "next";
import "./globals.css";

const siteUrl="https://felipeseabra.com.br";
const defaultTitle="Felipe Seabra — Front-End Developer";
const defaultDescription="Portfolio and career timeline of Felipe Seabra, a Front-End focused Full-Stack Developer based in Dublin, Ireland.";

export const metadata:Metadata={
  metadataBase:new URL(siteUrl),
  title:{default:defaultTitle,template:"%s | Felipe Seabra"},
  description:defaultDescription,
  authors:[{name:"Felipe Seabra",url:siteUrl}],
  creator:"Felipe Seabra",
  publisher:"Felipe Seabra",
  icons:{icon:"/favicon.svg",shortcut:"/favicon.svg",apple:"/favicon.svg"},
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
