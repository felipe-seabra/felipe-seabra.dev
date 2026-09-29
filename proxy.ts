import {type NextRequest} from "next/server";
import {updateSession} from "@/lib/supabase/proxy";

export async function proxy(request:NextRequest){
  const requestHeaders=new Headers(request.headers);
  requestHeaders.set("x-portfolio-locale",request.nextUrl.pathname==="/pt"||request.nextUrl.pathname.startsWith("/pt/")?"pt":"en");
  return updateSession(request,requestHeaders);
}

export const config={
  matcher:["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
