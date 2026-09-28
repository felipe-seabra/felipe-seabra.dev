import type {Metadata,Viewport} from "next";
import "./globals.css";

export const metadata:Metadata={metadataBase:new URL("https://felipeseabra.dev"),title:"Felipe Seabra — Front-End Developer",description:"Portfolio and career timeline of Felipe Seabra, a Front-End focused Full-Stack Developer.",openGraph:{title:"Felipe Seabra — Front-End Developer",description:"A career built at the intersection of technology, design and people.",type:"website"},robots:{index:true,follow:true}};
export const viewport:Viewport={width:"device-width",initialScale:1,colorScheme:"dark light"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body>{children}</body></html>}