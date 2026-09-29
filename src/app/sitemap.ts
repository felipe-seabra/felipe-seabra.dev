import type {MetadataRoute} from "next";
import {prisma} from "@/lib/prisma";

const siteUrl="https://felipeseabra.com.br";

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  let lastModified:Date|undefined;
  try{
    const [content,projects,timeline]=await Promise.all([
      prisma.siteContent.aggregate({_max:{updated_at:true}}),
      prisma.project.aggregate({_max:{updated_at:true}}),
      prisma.timelineEntry.aggregate({_max:{updated_at:true}}),
    ]);
    const dates=[content._max.updated_at,projects._max.updated_at,timeline._max.updated_at].filter((value):value is Date=>value instanceof Date);
    if(dates.length) lastModified=new Date(Math.max(...dates.map(date=>date.getTime())));
  }catch{}
  return [
    {url:siteUrl+"/",...(lastModified?{lastModified}: {})},
    {url:siteUrl+"/pt",...(lastModified?{lastModified}: {})},
  ];
}
