import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initialProjects = [
  {
    slug: "pizza-shopping",
    title: "Pizza Shopping",
    category: "E-commerce / Front-End",
    description:
      "Production e-commerce experience focused on a fast ordering flow, responsive UI and conversion.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    href: "https://www.pizzashopping.com.br",
    featured: true,
    published: true,
    sort_order: 10,
  },
  {
    slug: "kifol",
    title: "Kifol Fertilizantes",
    category: "Corporate / Web",
    description:
      "Corporate website for a Brazilian fertilizer company, combining content architecture, responsive UI and SEO.",
    stack: ["Next.js", "TypeScript", "SEO"],
    href: "https://www.kifol.com.br/",
    featured: true,
    published: true,
    sort_order: 20,
  },
  {
    slug: "jocar-polimentos",
    title: "Jocar Polimentos",
    category: "Automotive / Web",
    description:
      "Professional automotive detailing website focused on services, local search visibility and conversion.",
    stack: ["Next.js", "TypeScript", "SEO"],
    href: "https://www.jocarpolimentos.com.br/",
    featured: true,
    published: true,
    sort_order: 30,
  },
];

const initialSiteContent = [
  // Hero (EN & PT)
  {
    locale: "en",
    section: "hero",
    field: "title",
    value: "A career built at the intersection of technology, design and people.",
  },
  {
    locale: "en",
    section: "hero",
    field: "intro",
    value:
      "From technology and education to modern web development, this is the path that brought me here.",
  },
  {
    locale: "pt",
    section: "hero",
    field: "title",
    value: "Uma carreira construída no encontro entre tecnologia, design e pessoas.",
  },
  {
    locale: "pt",
    section: "hero",
    field: "intro",
    value:
      "Da tecnologia e educação ao desenvolvimento web moderno, este é o caminho que me trouxe até aqui.",
  },
  // Social (EN & PT)
  {
    locale: "en",
    section: "social",
    field: "github",
    value: "https://github.com/felipe-seabra",
  },
  {
    locale: "en",
    section: "social",
    field: "linkedin",
    value: "https://www.linkedin.com/in/felipe-seabra/",
  },
  {
    locale: "pt",
    section: "social",
    field: "github",
    value: "https://github.com/felipe-seabra",
  },
  {
    locale: "pt",
    section: "social",
    field: "linkedin",
    value: "https://www.linkedin.com/in/felipe-seabra/",
  },
  // Contact (EN & PT)
  {
    locale: "en",
    section: "contact",
    field: "email",
    value: "hello@felipeseabra.com.br",
  },
  {
    locale: "pt",
    section: "contact",
    field: "email",
    value: "hello@felipeseabra.com.br",
  },
  // SEO (EN & PT)
  {
    locale: "en",
    section: "seo",
    field: "title",
    value: "Felipe Seabra — Front-End Developer",
  },
  {
    locale: "en",
    section: "seo",
    field: "description",
    value:
      "Portfolio and career timeline of Felipe Seabra, a Front-End focused Full-Stack Developer based in Dublin, Ireland.",
  },
  {
    locale: "pt",
    section: "seo",
    field: "title",
    value: "Felipe Seabra — Desenvolvedor Front-End",
  },
  {
    locale: "pt",
    section: "seo",
    field: "description",
    value:
      "Portfólio e trajetória profissional de Felipe Seabra, desenvolvedor Full-Stack com foco em Front-End em Dublin, Irlanda.",
  },
];

export async function main() {
  for (const project of initialProjects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
  }

  for (const content of initialSiteContent) {
    await prisma.siteContent.upsert({
      where: {
        locale_section_field: {
          locale: content.locale,
          section: content.section,
          field: content.field,
        },
      },
      update: { value: content.value },
      create: content,
    });
  }
}

if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
