import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

type ContentMap=Record<string,string>;

export async function GET(request:NextRequest){
  const locale=request.nextUrl.searchParams.get("locale")==="pt"?"pt":"en";
  const supabase=await createClient();
  if(!supabase)return NextResponse.json({content:{},timeline:[],projects:[]},{status:503});

  const [{data:content},{data:timeline},{data:projects}]=await Promise.all([
    supabase.from("site_content").select("section,field,value").eq("locale",locale),
    supabase.from("timeline_entries").select("chapter,period,title,body,tags").eq("locale",locale).eq("published",true).order("sort_order",{ascending:true}),
    supabase.from("projects").select("id,title,category,description,stack,href,github_url,image_url,featured,sort_order").eq("published",true).order("sort_order",{ascending:true}),
  ]);

  const contentMap:ContentMap={};
  for(const row of content??[])contentMap[row.section+"."+row.field]=row.value;

  return NextResponse.json({content:contentMap,timeline:timeline??[],projects:projects??[]},{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=300"}});
}
