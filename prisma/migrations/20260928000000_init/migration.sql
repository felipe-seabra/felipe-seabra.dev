-- CreateTable
CREATE TABLE "admins" (
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("user_id"),
    CONSTRAINT "admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "stack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "href" TEXT NOT NULL DEFAULT '#contact',
    "github_url" TEXT,
    "image_url" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "locale" TEXT NOT NULL DEFAULT 'en',
    "chapter" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_entries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "timeline_entries_locale_check" CHECK ("locale" IN ('en', 'pt'))
);

-- CreateTable
CREATE TABLE "site_content" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "locale" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_content_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "site_content_locale_check" CHECK ("locale" IN ('en', 'pt'))
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_public_order_idx" ON "projects"("published", "featured", "sort_order");

-- CreateIndex
CREATE INDEX "timeline_public_order_idx" ON "timeline_entries"("published", "sort_order");

-- CreateIndex
CREATE INDEX "timeline_locale_order_idx" ON "timeline_entries"("locale", "published", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "site_content_locale_section_field_key" ON "site_content"("locale", "section", "field");

-- Enable Row Level Security (RLS)
ALTER TABLE "admins" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "timeline_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "site_content" ENABLE ROW LEVEL SECURITY;

-- Revoke and Grant Permissions
REVOKE ALL ON TABLE "admins" FROM anon, authenticated;
GRANT SELECT ON TABLE "projects" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "projects" TO authenticated;
GRANT SELECT ON TABLE "timeline_entries" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "timeline_entries" TO authenticated;
GRANT SELECT ON TABLE "site_content" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "site_content" TO authenticated;

-- Admin authorization function for Supabase RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admins
    WHERE user_id = (SELECT auth.uid())
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- RLS Policies
DROP POLICY IF EXISTS "Public can read published projects" ON "projects";
CREATE POLICY "Public can read published projects"
  ON "projects" FOR SELECT
  TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "Admins can manage projects" ON "projects";
CREATE POLICY "Admins can manage projects"
  ON "projects" FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Public can read published timeline" ON "timeline_entries";
CREATE POLICY "Public can read published timeline"
  ON "timeline_entries" FOR SELECT
  TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "Admins can manage timeline" ON "timeline_entries";
CREATE POLICY "Admins can manage timeline"
  ON "timeline_entries" FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Public can read site content" ON "site_content";
CREATE POLICY "Public can read site content"
  ON "site_content" FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage site content" ON "site_content";
CREATE POLICY "Admins can manage site content"
  ON "site_content" FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Initial Seed Data

-- Projects
INSERT INTO "projects" ("slug", "title", "category", "description", "stack", "href", "featured", "published", "sort_order")
VALUES
  ('pizza-shopping', 'Pizza Shopping', 'E-commerce / Front-End', 'Production e-commerce experience focused on a fast ordering flow, responsive UI and conversion.', ARRAY['Next.js', 'TypeScript', 'Tailwind CSS'], 'https://www.pizzashopping.com.br', true, true, 10),
  ('kifol', 'Kifol Fertilizantes', 'Corporate / Web', 'Corporate website for a Brazilian fertilizer company, combining content architecture, responsive UI and SEO.', ARRAY['Next.js', 'TypeScript', 'SEO'], 'https://www.kifol.com.br/', true, true, 20),
  ('jocar-polimentos', 'Jocar Polimentos', 'Automotive / Web', 'Professional automotive detailing website focused on services, local search visibility and conversion.', ARRAY['Next.js', 'TypeScript', 'SEO'], 'https://www.jocarpolimentos.com.br/', true, true, 30)
ON CONFLICT ("slug") DO UPDATE SET
  "title" = EXCLUDED."title",
  "category" = EXCLUDED."category",
  "description" = EXCLUDED."description",
  "stack" = EXCLUDED."stack",
  "href" = EXCLUDED."href",
  "featured" = EXCLUDED."featured",
  "published" = EXCLUDED."published",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

-- Site Content (Hero, Social, Contact, SEO)
INSERT INTO "site_content" ("locale", "section", "field", "value")
VALUES
  -- Hero
  ('en', 'hero', 'title', 'A career built at the intersection of technology, design and people.'),
  ('en', 'hero', 'intro', 'From technology and education to modern web development, this is the path that brought me here.'),
  ('pt', 'hero', 'title', 'Uma carreira construída no encontro entre tecnologia, design e pessoas.'),
  ('pt', 'hero', 'intro', 'Da tecnologia e educação ao desenvolvimento web moderno, este é o caminho que me trouxe até aqui.'),
  -- Social
  ('en', 'social', 'github', 'https://github.com/felipe-seabra'),
  ('en', 'social', 'linkedin', 'https://www.linkedin.com/in/felipe-seabra/'),
  ('pt', 'social', 'github', 'https://github.com/felipe-seabra'),
  ('pt', 'social', 'linkedin', 'https://www.linkedin.com/in/felipe-seabra/'),
  -- Contact
  ('en', 'contact', 'email', 'hello@felipeseabra.com.br'),
  ('pt', 'contact', 'email', 'hello@felipeseabra.com.br'),
  -- SEO
  ('en', 'seo', 'title', 'Felipe Seabra — Front-End Developer'),
  ('en', 'seo', 'description', 'Portfolio and career timeline of Felipe Seabra, a Front-End focused Full-Stack Developer based in Dublin, Ireland.'),
  ('pt', 'seo', 'title', 'Felipe Seabra — Desenvolvedor Front-End'),
  ('pt', 'seo', 'description', 'Portfólio e trajetória profissional de Felipe Seabra, desenvolvedor Full-Stack com foco em Front-End em Dublin, Irlanda.')
ON CONFLICT ("locale", "section", "field") DO UPDATE SET
  "value" = EXCLUDED."value",
  "updated_at" = CURRENT_TIMESTAMP;
