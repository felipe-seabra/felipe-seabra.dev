import type {Metadata,Viewport} from "next";
import "./globals.css";

const siteUrl="https://felipeseabra.dev";

export const metadata:Metadata={
  metadataBase:new URL(siteUrl),
  title:{
    default:"Felipe Seabra — Front-End Developer",
    template:"%s | Felipe Seabra",
  },
  description:"Portfolio and career timeline of Felipe Seabra, a Front-End focused Full-Stack Developer based in Dublin, Ireland.",
  keywords:[
    "Felipe Seabra",
    "Front-End Developer",
    "Full-Stack Developer",
    "Next.js Developer",
    "React Developer",
    "TypeScript Developer",
    "Dublin Developer",
    "Web Developer Ireland",
  ],
  authors:[{name:"Felipe Seabra"}],
  creator:"Felipe Seabra",
  alternates:{canonical:"/"},
  icons:{
    icon:"/favicon.svg",
    shortcut:"/favicon.svg",
    apple:"/favicon.svg",
  },
  openGraph:{
    title:"Felipe Seabra — Front-End Developer",
    description:"A career built at the intersection of technology, design and people.",
    url:siteUrl,
    siteName:"Felipe Seabra",
    type:"website",
    locale:"en_IE",
    images:[{
      url:"/og-image.svg",
      width:1200,
      height:630,
      alt:"Felipe Seabra — Front-End Developer",
    }],
  },
  twitter:{
    card:"summary_large_image",
    title:"Felipe Seabra — Front-End Developer",
    description:"Portfolio and career timeline of Felipe Seabra.",
    images:["/og-image.svg"],
  },
  robots:{
    index:true,
    follow:true,
    googleBot:{
      index:true,
      follow:true,
      "max-image-preview":"large",
      "max-snippet":-1,
      "max-video-preview":-1,
    },
  },
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

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
