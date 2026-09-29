import {createServerClient} from "@supabase/ssr";
import {NextResponse,type NextRequest} from "next/server";

export async function updateSession(request:NextRequest,requestHeaders?:Headers){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const headers=requestHeaders??request.headers;

  if(!url||!key) return NextResponse.next({request:{headers}});

  let response=NextResponse.next({request:{headers}});
  const supabase=createServerClient(url,key,{
    cookies:{
      getAll(){return request.cookies.getAll();},
      setAll(cookiesToSet){
        cookiesToSet.forEach(({name,value})=>request.cookies.set(name,value));
        response=NextResponse.next({request:{headers}});
        cookiesToSet.forEach(({name,value,options})=>response.cookies.set(name,value,options));
      },
    },
  });

  await supabase.auth.getClaims();
  return response;
}
