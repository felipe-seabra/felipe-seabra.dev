import {prisma} from "@/lib/prisma";
import {copy,projects,type Locale} from "@/lib/i18n";
import type {ProjectItem,TimelineItem} from "@/components/portfolio/types";

const siteUrl="https://felipeseabra.com.br";

export type PortfolioData={
  locale:Locale;
  content:Record<string,string>;
  timeline:readonly TimelineItem[];
  projects:readonly ProjectItem[];
  social:{github:string;linkedin:string};
  seo:{title:string;description:string};
};

export async function getPortfolioData(locale:Locale):Promise<PortfolioData>{
  const fallbackProjects=projects.map((project,index)=>({...project,number:project.number,sort_order:index}));
  try{
    const [contentRows,timelineRows,projectRows]=await Promise.all([
      prisma.siteContent.findMany({where:{locale},select:{section:true,field:true,value:true}}),
      prisma.timelineEntry.findMany({where:{locale,published:true},select:{chapter:true,period:true,title:true,body:true,tags:true},orderBy:{sort_order:"asc"}}),
      prisma.project.findMany({where:{published:true},select:{id:true,title:true,category:true,description:true,stack:true,href:true,github_url:true,image_url:true,featured:true,published:true,sort_order:true},orderBy:{sort_order:"asc"}}),
    ]);
    const content:Record<string,string>={};
    for(const row of contentRows) content[row.section+"."+row.field]=row.value;
    const timeline:readonly TimelineItem[]=timelineRows.length?timelineRows:copy[locale].timeline.entries;
    const cmsProjects:readonly ProjectItem[]=projectRows.map((project,index)=>({...project,href:project.href||"#contact",number:String(index+1).padStart(2,"0")}));
    return {
      locale,
      content,
      timeline,
      projects:cmsProjects.length?cmsProjects:fallbackProjects,
      social:{
        github:content["social.github"]||"https://github.com/felipe-seabra",
        linkedin:content["social.linkedin"]||"https://www.linkedin.com/in/felipe-seabra/",
      },
      seo:{
        title:content["seo.title"]||(locale==="pt"?"Felipe Seabra | Desenvolvedor Front-End":"Felipe Seabra | Front-End Developer"),
        description:content["seo.description"]||(locale==="pt"?"Portfólio e trajetória profissional de Felipe Seabra, Desenvolvedor Full-Stack com foco em Front-End, baseado em Dublin, Irlanda.":"Portfolio and career timeline of Felipe Seabra, a Front-End focused Full-Stack Developer based in Dublin, Ireland."),
      },
    };
  }catch{
    return {
      locale,
      content:{},
      timeline:copy[locale].timeline.entries,
      projects:fallbackProjects,
      social:{github:"https://github.com/felipe-seabra",linkedin:"https://www.linkedin.com/in/felipe-seabra/"},
      seo:{
        title:locale==="pt"?"Felipe Seabra | Desenvolvedor Front-End":"Felipe Seabra | Front-End Developer",
        description:locale==="pt"?"Portfólio e trajetória profissional de Felipe Seabra, Desenvolvedor Full-Stack com foco em Front-End, baseado em Dublin, Irlanda.":"Portfolio and career timeline of Felipe Seabra, a Front-End focused Full-Stack Developer based in Dublin, Ireland.",
      },
    };
  }
}

export const siteMetadata={siteUrl,englishUrl:siteUrl,portugueseUrl:siteUrl+"/pt"};
