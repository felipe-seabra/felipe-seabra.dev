type Locale="en"|"pt";

export function StructuredData({locale,socialLinks}:{locale:Locale;socialLinks:{href:string}[]}){
  const isPortuguese=locale==="pt";
  const url=isPortuguese?"https://felipeseabra.com.br/pt/":"https://felipeseabra.com.br/";
  const person={
    "@type":"Person",
    "@id":"https://felipeseabra.com.br/#person",
    name:"Felipe Seabra",
    url:"https://felipeseabra.com.br/",
    jobTitle:isPortuguese?"Desenvolvedor Full-Stack com foco em Front-End":"Front-End focused Full-Stack Developer",
    description:isPortuguese?"Desenvolvedor Full-Stack com foco em Front-End, baseado em Dublin, Irlanda, atuando entre tecnologia, design e educação.":"Front-End focused Full-Stack Developer based in Dublin, Ireland, working across technology, design and education.",
    image:"https://felipeseabra.com.br/avatar-caricature.webp",
    address:{"@type":"PostalAddress",addressLocality:"Dublin",addressCountry:"IE"},
    knowsAbout:["Front-End Development","React","Next.js","TypeScript","UI Design","SEO","Web Development"],
    sameAs:socialLinks.map(link=>link.href),
  };
  const profile={
    "@type":"ProfilePage",
    "@id":url+"#profile",
    url,
    name:isPortuguese?"Felipe Seabra | Desenvolvedor Front-End":"Felipe Seabra | Front-End Developer",
    inLanguage:locale,
    mainEntity:person,
  };
  const website={
    "@type":"WebSite",
    "@id":"https://felipeseabra.com.br/#website",
    url:"https://felipeseabra.com.br/",
    name:"Felipe Seabra",
    inLanguage:locale,
    publisher:{"@id":"https://felipeseabra.com.br/#person"},
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@graph":[website,profile]})}}/>;
}
