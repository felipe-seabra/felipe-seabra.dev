import type {Locale} from "@/lib/i18n";
export type Theme="dark"|"light";
export type ProjectItem={id?:string;number?:string;title:string;category:string;description:string;stack:readonly string[];href:string;github_url?:string|null;image_url?:string|null;featured?:boolean;published?:boolean;sort_order?:number};
export type TimelineItem={chapter:string;period:string;title:string;body:string;tags:string[]};
export type SocialLink={label:string;href:string;icon:React.ComponentType<{size?:number}>};
export type PortfolioText=(section:string,field:string,fallback:string)=>string;
export type {Locale};
