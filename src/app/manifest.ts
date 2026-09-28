import type {MetadataRoute} from "next";

export default function manifest():MetadataRoute.Manifest{
  return {
    name:"Felipe Seabra — Front-End Developer",
    short_name:"Felipe Seabra",
    description:"Portfolio and career timeline of Felipe Seabra.",
    start_url:"/",
    display:"standalone",
    background_color:"#080808",
    theme_color:"#080808",
    icons:[
      {
        src:"/favicon.svg",
        sizes:"any",
        type:"image/svg+xml",
      },
    ],
  };
}
