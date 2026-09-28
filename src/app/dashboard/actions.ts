"use server";

import {createClient} from "@/lib/supabase/server";
import {prisma} from "@/lib/prisma";
import type {Locale} from "@/lib/i18n";

export type DashboardProject = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  stack: string[];
  href: string;
  github_url: string | null;
  image_url: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
};

export type DashboardTimeline = {
  id: string;
  locale: Locale;
  chapter: string;
  period: string;
  title: string;
  body: string;
  tags: string[];
  published: boolean;
  sort_order: number;
};

export type DashboardContentRow = {
  locale: Locale;
  section: string;
  field: string;
  value: string;
};

function isValidLocale(locale: unknown): locale is Locale {
  return locale === "en" || locale === "pt";
}

async function verifyAdminSession() {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase client is not configured.", user: null };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized: Please sign in.", user: null };
  }

  try {
    const adminRecord = await prisma.admin.findUnique({
      where: { user_id: user.id },
    });

    if (!adminRecord) {
      return { error: "Access denied: This account is not an admin.", user };
    }

    return { error: null, user };
  } catch (err: unknown) {
    console.error("Database error while verifying admin privileges:", err);
    return { error: "Database error while verifying admin privileges.", user };
  }
}

export async function getDashboardData(locale: Locale) {
  const auth = await verifyAdminSession();
  if (auth.error || !auth.user) {
    return {
      authenticated: Boolean(auth.user),
      isAdmin: false,
      error: auth.error ?? "Unauthorized",
      projects: [] as DashboardProject[],
      timeline: [] as DashboardTimeline[],
      content: [] as DashboardContentRow[],
    };
  }

  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";

  try {
    const [projects, timeline, content] = await Promise.all([
      prisma.project.findMany({
        orderBy: { sort_order: "asc" },
      }),
      prisma.timelineEntry.findMany({
        orderBy: { sort_order: "asc" },
      }),
      prisma.siteContent.findMany({
        where: { locale: safeLocale },
      }),
    ]);

    return {
      authenticated: true,
      isAdmin: true,
      error: null,
      projects: projects.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        description: p.description,
        stack: p.stack,
        href: p.href,
        github_url: p.github_url,
        image_url: p.image_url,
        featured: p.featured,
        published: p.published,
        sort_order: p.sort_order,
      })) as DashboardProject[],
      timeline: timeline.map((t) => ({
        id: t.id,
        locale: t.locale as Locale,
        chapter: t.chapter,
        period: t.period,
        title: t.title,
        body: t.body,
        tags: t.tags,
        published: t.published,
        sort_order: t.sort_order,
      })) as DashboardTimeline[],
      content: content.map((c) => ({
        locale: c.locale as Locale,
        section: c.section,
        field: c.field,
        value: c.value,
      })) as DashboardContentRow[],
    };
  } catch (err: unknown) {
    console.error("Failed to load dashboard data:", err);
    return {
      authenticated: true,
      isAdmin: true,
      error: "CMS content could not be loaded from database.",
      projects: [] as DashboardProject[],
      timeline: [] as DashboardTimeline[],
      content: [] as DashboardContentRow[],
    };
  }
}

export async function saveProjectAction(data: Omit<DashboardProject, "id"> & { id?: string }) {
  const auth = await verifyAdminSession();
  if (auth.error) {
    return { success: false, error: auth.error, data: null };
  }

  if (!data.slug?.trim() || !data.title?.trim()) {
    return { success: false, error: "Title and slug are required.", data: null };
  }

  try {
    const payload = {
      slug: data.slug.trim(),
      title: data.title.trim(),
      category: data.category ?? "",
      description: data.description ?? "",
      stack: Array.isArray(data.stack) ? data.stack : [],
      href: data.href ?? "#contact",
      github_url: data.github_url || null,
      image_url: data.image_url || null,
      featured: Boolean(data.featured),
      published: Boolean(data.published),
      sort_order: Number.isFinite(data.sort_order) ? data.sort_order : 0,
    };

    let saved;
    if (data.id) {
      saved = await prisma.project.update({
        where: { id: data.id },
        data: payload,
      });
    } else {
      saved = await prisma.project.create({
        data: payload,
      });
    }

    return {
      success: true,
      error: null,
      data: {
        id: saved.id,
        slug: saved.slug,
        title: saved.title,
        category: saved.category,
        description: saved.description,
        stack: saved.stack,
        href: saved.href,
        github_url: saved.github_url,
        image_url: saved.image_url,
        featured: saved.featured,
        published: saved.published,
        sort_order: saved.sort_order,
      } as DashboardProject,
    };
  } catch (err: unknown) {
    console.error("Failed to save project:", err);
    return { success: false, error: "Failed to save project.", data: null };
  }
}

export async function deleteProjectAction(id: string) {
  const auth = await verifyAdminSession();
  if (auth.error) {
    return { success: false, error: auth.error };
  }

  if (!id || typeof id !== "string") {
    return { success: false, error: "Invalid project ID." };
  }

  try {
    await prisma.project.delete({
      where: { id },
    });
    return { success: true, error: null };
  } catch (err: unknown) {
    console.error("Failed to delete project:", err);
    return { success: false, error: "Failed to delete project." };
  }
}

export async function saveTimelineAction(data: Omit<DashboardTimeline, "id"> & { id?: string }) {
  const auth = await verifyAdminSession();
  if (auth.error) {
    return { success: false, error: auth.error, data: null };
  }

  if (!isValidLocale(data.locale)) {
    return { success: false, error: "Invalid locale. Must be 'en' or 'pt'.", data: null };
  }

  if (!data.chapter?.trim() || !data.period?.trim() || !data.title?.trim()) {
    return { success: false, error: "Chapter, period, and title are required.", data: null };
  }

  try {
    const payload = {
      locale: data.locale,
      chapter: data.chapter.trim(),
      period: data.period.trim(),
      title: data.title.trim(),
      body: data.body ?? "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      published: Boolean(data.published),
      sort_order: Number.isFinite(data.sort_order) ? data.sort_order : 0,
    };

    let saved;
    if (data.id) {
      saved = await prisma.timelineEntry.update({
        where: { id: data.id },
        data: payload,
      });
    } else {
      saved = await prisma.timelineEntry.create({
        data: payload,
      });
    }

    return {
      success: true,
      error: null,
      data: {
        id: saved.id,
        locale: saved.locale as Locale,
        chapter: saved.chapter,
        period: saved.period,
        title: saved.title,
        body: saved.body,
        tags: saved.tags,
        published: saved.published,
        sort_order: saved.sort_order,
      } as DashboardTimeline,
    };
  } catch (err: unknown) {
    console.error("Failed to save timeline entry:", err);
    return { success: false, error: "Failed to save timeline entry.", data: null };
  }
}

export async function deleteTimelineAction(id: string) {
  const auth = await verifyAdminSession();
  if (auth.error) {
    return { success: false, error: auth.error };
  }

  if (!id || typeof id !== "string") {
    return { success: false, error: "Invalid timeline entry ID." };
  }

  try {
    await prisma.timelineEntry.delete({
      where: { id },
    });
    return { success: true, error: null };
  } catch (err: unknown) {
    console.error("Failed to delete timeline entry:", err);
    return { success: false, error: "Failed to delete timeline entry." };
  }
}

export async function saveContentAction(rows: DashboardContentRow[]) {
  const auth = await verifyAdminSession();
  if (auth.error) {
    return { success: false, error: auth.error };
  }

  if (!Array.isArray(rows)) {
    return { success: false, error: "Invalid content payload." };
  }

  for (const row of rows) {
    if (!isValidLocale(row.locale)) {
      return { success: false, error: "Invalid locale. Must be 'en' or 'pt'." };
    }
  }

  try {
    await prisma.$transaction(
      rows.map((row) =>
        prisma.siteContent.upsert({
          where: {
            locale_section_field: {
              locale: row.locale,
              section: row.section,
              field: row.field,
            },
          },
          update: {
            value: row.value,
          },
          create: {
            locale: row.locale,
            section: row.section,
            field: row.field,
            value: row.value,
          },
        })
      )
    );

    return { success: true, error: null };
  } catch (err: unknown) {
    console.error("Failed to save content:", err);
    return { success: false, error: "Failed to save content." };
  }
}
