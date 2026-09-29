import type {Metadata} from "next";
import {StructuredData} from "@/components/portfolio/StructuredData";
import {PortfolioPageClient} from "@/components/portfolio/PortfolioPageClient";
import {getPortfolioData,siteMetadata} from "@/lib/portfolio-data";

export async function generateMetadata():Promise<Metadata>{
  const data=await getPortfolioData("pt");
  return {
    title:data.seo.title,
    description:data.seo.description,
    alternates:{canonical:siteMetadata.portugueseUrl,languages:{en:siteMetadata.englishUrl,pt:siteMetadata.portugueseUrl,"x-default":siteMetadata.englishUrl}},
    openGraph:{locale:"pt_BR",url:siteMetadata.portugueseUrl,title:data.seo.title,description:data.seo.description},
  };
}

export default async function PortuguesePortfolioPage(){
  const data=await getPortfolioData("pt");
  return <>
    <StructuredData locale="pt" socialLinks={[{href:data.social.github},{href:data.social.linkedin}]}/>
    <PortfolioPageClient locale="pt" content={data.content} timeline={data.timeline} projects={data.projects} social={data.social}/>
  </>;
}
