-- Portfolio CMS expansion
-- Run after the original supabase/schema.sql.

alter table public.timeline_entries
  add column if not exists locale text not null default 'en'
  check (locale in ('en','pt'));

create index if not exists timeline_locale_order_idx
  on public.timeline_entries (locale, published, sort_order);

alter table public.projects
  add column if not exists github_url text;

insert into public.projects (slug,title,category,description,stack,href,featured,published,sort_order)
values
  ('pizza-shopping','Pizza Shopping','E-commerce / Front-End','Production e-commerce experience focused on a fast ordering flow, responsive UI and conversion.',array['Next.js','TypeScript','Tailwind CSS'],'https://www.pizzashopping.com.br',true,true,10),
  ('kifol','Kifol Fertilizantes','Corporate / Web','Corporate website for a Brazilian fertilizer company, combining content architecture, responsive UI and SEO.',array['Next.js','TypeScript','SEO'],'https://www.kifol.com.br/',true,true,20),
  ('jocar-polimentos','Jocar Polimentos','Automotive / Web','Professional automotive detailing website focused on services, local search visibility and conversion.',array['Next.js','TypeScript','SEO'],'https://www.jocarpolimentos.com.br/',true,true,30)
on conflict (slug) do update set
  title=excluded.title,
  category=excluded.category,
  description=excluded.description,
  stack=excluded.stack,
  href=excluded.href,
  featured=excluded.featured,
  published=excluded.published,
  sort_order=excluded.sort_order,
  updated_at=now();

insert into public.site_content(locale,section,field,value)
values
('en','social','github','https://github.com/felipe-seabra'),
('en','social','linkedin','https://www.linkedin.com/in/felipe-seabra/'),
('en','contact','email','hello@felipeseabra.com.br'),
('en','seo','title','Felipe Seabra — Front-End Developer'),
('en','seo','description','Portfolio and career timeline of Felipe Seabra, a Front-End focused Full-Stack Developer based in Dublin, Ireland.'),
('pt','social','github','https://github.com/felipe-seabra'),
('pt','social','linkedin','https://www.linkedin.com/in/felipe-seabra/'),
('pt','contact','email','hello@felipeseabra.com.br'),
('pt','seo','title','Felipe Seabra — Desenvolvedor Front-End'),
('pt','seo','description','Portfólio e trajetória profissional de Felipe Seabra, desenvolvedor Full-Stack com foco em Front-End em Dublin, Irlanda.')
on conflict (locale,section,field) do update set value=excluded.value,updated_at=now();

insert into public.site_content(locale,section,field,value)
select locale,'hero',field,value from public.site_content
where section='hero'
on conflict (locale,section,field) do nothing;
