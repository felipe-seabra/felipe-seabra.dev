import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

type ContentMap=Record<string,string>;

export async function GET(request:NextRequest){
  const locale=request.nextUrl.searchParams.get("locale")==="pt"?"pt":"en";

  try {
    const [contentResult,timelineResult,projectsResult]=await Promise.all([
      prisma.siteContent.findMany({
        where:{locale},
        select:{section:true,field:true,value:true},
      }),
      prisma.timelineEntry.findMany({
        where:{locale,published:true},
        select:{chapter:true,period:true,title:true,body:true,tags:true},
        orderBy:{sort_order:"asc"},
      }),
      prisma.project.findMany({
        where:{published:true},
        select:{
          id:true,
          title:true,
          category:true,
          description:true,
          stack:true,
          href:true,
          github_url:true,
          image_url:true,
          featured:true,
          sort_order:true,
        },
        orderBy:{sort_order:"asc"},
      }),
    ]);

    const contentMap:ContentMap={};
    for(const row of contentResult)contentMap[row.section+"."+row.field]=row.value;

    return NextResponse.json(
      {
        content:contentMap,
        timeline:timelineResult,
        projects:projectsResult,
      },
      {
        headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=300"},
      }
    );
  } catch {
    return NextResponse.json({error:"Content is temporarily unavailable."},{status:500});
  }
}
