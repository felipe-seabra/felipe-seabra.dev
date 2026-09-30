import type {Metadata} from "next";
import {StructuredData} from "@/components/portfolio/StructuredData";
import {PortfolioPageClient} from "@/components/portfolio/PortfolioPageClient";
import {getPortfolioData,siteMetadata} from "@/lib/portfolio-data";

const ogImage={
  url:"https://felipeseabra.com.br/og-image.png",
  width:1200,
  height:630,
  alt:"Felipe Seabra | Front-End focused Full-Stack Developer",
};

export async function generateMetadata():Promise<Metadata>{
  const data=await getPortfolioData("en");
  return {
    title:data.seo.title,
    description:data.seo.description,
    alternates:{canonical:siteMetadata.englishUrl,languages:{en:siteMetadata.englishUrl,pt:siteMetadata.portugueseUrl,"x-default":siteMetadata.englishUrl}},
    openGraph:{type:"website",siteName:"Felipe Seabra",locale:"en_IE",url:siteMetadata.englishUrl,title:data.seo.title,description:data.seo.description,images:[ogImage]},
  };
}

export default async function PortfolioPage(){
  const data=await getPortfolioData("en");
  return <>
    <StructuredData locale="en" socialLinks={[{href:data.social.github},{href:data.social.linkedin}]}/>
    <PortfolioPageClient locale="en" content={data.content} timeline={data.timeline} projects={data.projects} social={data.social}/>
  </>;
}
