begin;

create extension if not exists pgtap with schema extensions;

select plan(31);

-- Local auth fixtures. Supabase's Auth schema is available in the local stack.
insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'rls-admin@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'rls-user@test.local');

insert into public.admins (user_id)
values ('11111111-1111-1111-1111-111111111111');

insert into public.projects (slug, title, href, published, sort_order)
values
  ('rls-published', 'Published project', '#contact', true, 1),
  ('rls-draft', 'Draft project', '#contact', false, 2);

insert into public.timeline_entries (chapter, period, title, body, published, sort_order)
values
  ('Test', '2026', 'Published timeline', 'Published', true, 1),
  ('Test', '2026', 'Draft timeline', 'Draft', false, 2);

insert into public.site_content (locale, section, field, value)
values ('en', 'rls-test', 'message', 'Public content');

-- Anonymous access: public reads only.
set local role anon;

select is( (select count(*)::int from public.projects where slug like 'rls-%'), 2, 'anon sees only published projects');
select is( (select count(*)::int from public.timeline_entries where title like 'Published timeline'), 1, 'anon sees only published timeline entries');
select is( (select count(*)::int from public.site_content where section = 'rls-test'), 1, 'anon can read site content');
select throws_ok($$insert into public.projects (slug, title) values ('rls-anon-insert', 'Denied')$$, '42501', null, 'anon cannot insert projects');
select lives_ok($update public.projects set title = 'Denied' where slug = 'rls-published'$, 'anon update is filtered by RLS');
select lives_ok($delete from public.projects where slug = 'rls-published'$, 'anon delete is filtered by RLS');
select is((select count(*)::int from public.projects where slug = 'rls-published' and title = 'Published project'), 1, 'anon cannot modify projects');

-- Authenticated non-admin access: public reads remain filtered, writes are denied.
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select is( (select count(*)::int from public.projects where slug like 'rls-%'), 2, 'non-admin sees only published projects');
select is( (select count(*)::int from public.timeline_entries where title = 'Published timeline'), 1, 'non-admin sees only published timeline entries');
select is( (select count(*)::int from public.site_content where section = 'rls-test'), 1, 'non-admin can read site content');
select throws_ok($$insert into public.projects (slug, title) values ('rls-user-insert', 'Denied')$$, '42501', null, 'non-admin cannot insert projects');
select lives_ok($update public.projects set title = 'Denied' where slug = 'rls-published'$, 'non-admin update statement is accepted but RLS filters it');
select is((select title from public.projects where slug = 'rls-published'), 'Published project', 'non-admin cannot change projects');
select lives_ok($delete from public.projects where slug = 'rls-published'$, 'non-admin delete statement is accepted but RLS filters it');
select is((select count(*)::int from public.projects where slug = 'rls-published'), 1, 'non-admin cannot delete projects');
select throws_ok($$insert into public.timeline_entries (chapter, period, title, body) values ('Test', '2026', 'Denied', 'Denied')$$, '42501', null, 'non-admin cannot insert timeline entries');
select lives_ok($update public.site_content set value = 'Denied' where section = 'rls-test'$, 'non-admin site content update is accepted but RLS filters it');
select is((select value from public.site_content where section = 'rls-test'), 'Public content', 'non-admin cannot change site content');

-- Admin access: full CRUD on content tables.
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select is( (select count(*)::int from public.projects where slug like 'rls-%'), 2, 'admin sees published and draft projects');
select is( (select count(*)::int from public.timeline_entries where title in ('Published timeline', 'Draft timeline')), 2, 'admin sees published and draft timeline entries');
select lives_ok($$insert into public.projects (slug, title, href) values ('rls-admin-insert', 'Admin project')$$, 'admin can insert projects');
select lives_ok($$update public.projects set title = 'Admin updated' where slug = 'rls-draft'$$, 'admin can update projects');
select lives_ok($$delete from public.projects where slug = 'rls-admin-insert'$$, 'admin can delete projects');
select lives_ok($$insert into public.timeline_entries (chapter, period, title, body) values ('Admin', '2026', 'Admin entry', 'Created by admin')$$, 'admin can insert timeline entries');
select lives_ok($$update public.timeline_entries set body = 'Admin updated' where title = 'Admin entry'$$, 'admin can update timeline entries');
select lives_ok($$delete from public.timeline_entries where title = 'Admin entry'$$, 'admin can delete timeline entries');
select lives_ok($$insert into public.site_content (locale, section, field, value) values ('en', 'rls-test-admin', 'message', 'Admin')$$, 'admin can insert site content');
select lives_ok($$update public.site_content set value = 'Admin updated' where section = 'rls-test'$$, 'admin can update site content');
select lives_ok($$delete from public.site_content where section = 'rls-test-admin'$$, 'admin can delete site content');

-- The admins table is intentionally inaccessible to client roles.
select throws_ok($$select count(*) from public.admins$$, '42501', null, 'authenticated cannot read admins table directly');

select * from finish();
rollback;
