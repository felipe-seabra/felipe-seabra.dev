export type Locale = "en" | "pt";

export const copy = {
  en: {
    nav:{journey:"Journey",work:"Work",about:"About",contact:"Contact",talk:"Let's talk"},
    hero:{eyebrow:"Front-End focused Full-Stack Developer",title:"A career built at the intersection of technology, design and people.",intro:"From technology and education to modern web development, this is the path that brought me here.",cta:"Explore my journey",location:"Dublin, Ireland"},
    timeline:{label:"01 / The journey",title:"How I got here.",intro:"Not a list of job titles. A timeline of the skills, decisions and projects that shaped how I build.",entries:[
      {chapter:"01",period:"10+ years",title:"Technology & Education",body:"I built my career around technology, education and digital operations, learning how to turn real-world needs into practical systems and experiences.",tags:["Technology","Education","Digital Operations"]},
      {chapter:"02",period:"Career chapter",title:"Marketing, Design & SEO",body:"Working across marketing, visual design and SEO added another layer to the way I think: products need to work, communicate clearly and be discoverable.",tags:["Marketing","Design","SEO"]},
      {chapter:"03",period:"The transition",title:"Deep dive into Web Development",body:"I moved deeper into modern web development, focusing on React, Next.js and TypeScript and building a stronger front-end foundation.",tags:["React","Next.js","TypeScript"]},
      {chapter:"04",period:"Production work",title:"Building real products",body:"Client and product work became the proving ground: e-commerce, education platforms, conversion experiences and SEO-driven websites.",tags:["Production","UX","Performance"]},
      {chapter:"05",period:"Now / 2026",title:"Dublin, Ireland",body:"Today I work from Dublin with a front-end focus, combining engineering, design and motion to create polished digital experiences.",tags:["Front-End","Motion","Dublin"]},
    ]},
    work:{label:"02 / Selected work",title:"Things I have built.",intro:"A selection of production and portfolio work across commerce, education, platforms and conversion."},
    about:{label:"03 / About",title:"I build interfaces with an engineer's discipline and a designer's eye.",body:"My strongest zone is the front end: turning ideas and visual direction into fast, accessible and expressive interfaces with modern React architecture and strict TypeScript.",experience:"10+ years across technology, education, marketing and design."},
    capabilities:["Front-End Development","React & Next.js","TypeScript","Interaction Design","Motion & Animation","SEO & Performance","UI Architecture","Design Systems"],
    contact:{label:"04 / Contact",title:"Let's build something worth remembering.",body:"Open to conversations about front-end development, digital products and interesting web projects.",cta:"Send an email"},
    controls:{language:"Language",theme:"Theme",light:"Light",dark:"Dark",menuOpen:"Open menu",menuClose:"Close menu"},
    avatar:"Stylized portrait with beard, headphones and hoodie",
  },
  pt: {
    nav:{journey:"Trajetória",work:"Projetos",about:"Sobre",contact:"Contato",talk:"Vamos conversar"},
    hero:{eyebrow:"Desenvolvedor Full-Stack com foco em Front-End",title:"Uma carreira construída no encontro entre tecnologia, design e pessoas.",intro:"Da tecnologia e educação ao desenvolvimento web moderno, este é o caminho que me trouxe até aqui.",cta:"Explorar minha trajetória",location:"Dublin, Irlanda"},
    timeline:{label:"01 / A trajetória",title:"Como cheguei até aqui.",intro:"Não é uma lista de cargos. É uma linha do tempo das habilidades, decisões e projetos que moldaram minha forma de construir.",entries:[
      {chapter:"01",period:"10+ anos",title:"Tecnologia & Educação",body:"Construí minha carreira em torno de tecnologia, educação e operações digitais, aprendendo a transformar necessidades reais em sistemas e experiências práticas.",tags:["Tecnologia","Educação","Operações Digitais"]},
      {chapter:"02",period:"Capítulo da carreira",title:"Marketing, Design & SEO",body:"Trabalhar com marketing, design visual e SEO adicionou outra camada à minha forma de pensar: produtos precisam funcionar, comunicar bem e ser encontrados.",tags:["Marketing","Design","SEO"]},
      {chapter:"03",period:"A transição",title:"Imersão em Desenvolvimento Web",body:"Passei a me aprofundar no desenvolvimento web moderno, com foco em React, Next.js e TypeScript e uma base cada vez mais forte em Front-End.",tags:["React","Next.js","TypeScript"]},
      {chapter:"04",period:"Projetos em produção",title:"Construindo produtos reais",body:"Projetos de clientes e produtos viraram o campo de prova: e-commerce, plataformas educacionais, experiências de conversão e sites orientados a SEO.",tags:["Produção","UX","Performance"]},
      {chapter:"05",period:"Agora / 2026",title:"Dublin, Irlanda",body:"Hoje trabalho a partir de Dublin com foco em Front-End, combinando engenharia, design e motion para criar experiências digitais refinadas.",tags:["Front-End","Motion","Dublin"]},
    ]},
    work:{label:"02 / Projetos selecionados",title:"Coisas que construí.",intro:"Uma seleção de trabalhos de produção e portfólio em comércio, educação, plataformas e conversão."},
    about:{label:"03 / Sobre",title:"Construo interfaces com disciplina de engenheiro e olhar de designer.",body:"Meu ponto mais forte é o Front-End: transformar ideias e direção visual em interfaces rápidas, acessíveis e expressivas usando arquitetura React moderna e TypeScript estrito.",experience:"10+ anos entre tecnologia, educação, marketing e design."},
    capabilities:["Desenvolvimento Front-End","React & Next.js","TypeScript","Design de Interação","Motion & Animação","SEO & Performance","Arquitetura de UI","Design Systems"],
    contact:{label:"04 / Contato",title:"Vamos construir algo que valha a pena lembrar.",body:"Aberto a conversas sobre desenvolvimento Front-End, produtos digitais e projetos web interessantes.",cta:"Enviar e-mail"},
    controls:{language:"Idioma",theme:"Tema",light:"Claro",dark:"Escuro",menuOpen:"Abrir menu",menuClose:"Fechar menu"},
    avatar:"Retrato estilizado com barba, fones e moletom",
  },
} as const;

export const projects = [
  {number:"01",title:"Pizza Shopping",category:"E-commerce / Front-End",description:"Production e-commerce experience focused on a fast ordering flow, responsive UI and conversion.",stack:["Next.js","TypeScript","Tailwind CSS"],href:"https://www.pizzashopping.com.br"},
  {number:"02",title:"Avalia Prudente",category:"Platform / Full-Stack",description:"Production-oriented platform with typed data flows, Supabase and reusable interface architecture.",stack:["Next.js","React","Supabase"],href:"#contact"},
  {number:"03",title:"Colégio Criarte",category:"Education / Web",description:"Digital experience combining content architecture, visual design, SEO and conversion goals.",stack:["Next.js","SEO","Design"],href:"#contact"},
  {number:"04",title:"Well na Estrada",category:"Conversion / Experience",description:"Premium funnel concept built around video storytelling and progressive onboarding.",stack:["Next.js","Framer Motion","Zod"],href:"#contact"},
] as const;