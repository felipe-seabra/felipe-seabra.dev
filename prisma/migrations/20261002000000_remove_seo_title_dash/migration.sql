-- Remove em dashes from persisted SEO titles.

UPDATE "site_content"
SET
  "value" = 'Felipe Seabra | Front-End Developer',
  "updated_at" = CURRENT_TIMESTAMP
WHERE "locale" = 'en'
  AND "section" = 'seo'
  AND "field" = 'title';

UPDATE "site_content"
SET
  "value" = 'Felipe Seabra | Desenvolvedor Front-End',
  "updated_at" = CURRENT_TIMESTAMP
WHERE "locale" = 'pt'
  AND "section" = 'seo'
  AND "field" = 'title';
