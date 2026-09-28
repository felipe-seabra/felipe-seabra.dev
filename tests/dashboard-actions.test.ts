import {describe,expect,it,vi} from "vitest";
import {
  getDashboardData,
  saveProjectAction,
  deleteProjectAction,
  saveTimelineAction,
  deleteTimelineAction,
  saveContentAction,
} from "@/app/dashboard/actions";
import {createClient} from "@/lib/supabase/server";
import {prisma} from "@/lib/prisma";
import type {User} from "@supabase/supabase-js";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    admin: { findUnique: vi.fn() },
    project: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    timelineEntry: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    siteContent: { findMany: vi.fn(), upsert: vi.fn() },
    $transaction: vi.fn(),
  },
}));

type MockServerClient = Awaited<ReturnType<typeof createClient>>;

function mockAuth(user: Partial<User> | null, error: Error | null = null): NonNullable<MockServerClient> {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: user as User | null },
        error,
      }),
    },
  } as unknown as NonNullable<MockServerClient>;
}

function mockAdminSession() {
  vi.mocked(createClient).mockResolvedValueOnce(
    mockAuth({ id: "admin-id", email: "admin@test.com" })
  );
  vi.mocked(prisma.admin.findUnique).mockResolvedValueOnce({
    user_id: "admin-id",
    created_at: new Date(),
  });
}

describe("Dashboard Server Actions Authorization", () => {
  it("rejects unauthenticated user from accessing dashboard data", async () => {
    vi.mocked(createClient).mockResolvedValueOnce(mockAuth(null, new Error("No session")));

    const res = await getDashboardData("en");
    expect(res.authenticated).toBe(false);
    expect(res.isAdmin).toBe(false);
    expect(res.error).toMatch(/Unauthorized/);
  });

  it("rejects authenticated non-admin user with access denied", async () => {
    vi.mocked(createClient).mockResolvedValueOnce(
      mockAuth({ id: "non-admin-id", email: "user@test.com" })
    );
    vi.mocked(prisma.admin.findUnique).mockResolvedValueOnce(null);

    const res = await getDashboardData("en");
    expect(res.authenticated).toBe(true);
    expect(res.isAdmin).toBe(false);
    expect(res.error).toMatch(/Access denied/);
  });

  it("blocks non-admin from mutating projects", async () => {
    vi.mocked(createClient).mockResolvedValueOnce(
      mockAuth({ id: "non-admin-id", email: "user@test.com" })
    );
    vi.mocked(prisma.admin.findUnique).mockResolvedValueOnce(null);

    const res = await saveProjectAction({
      slug: "test",
      title: "Test",
      category: "Web",
      description: "Desc",
      stack: ["React"],
      href: "https://test.com",
      github_url: null,
      image_url: null,
      featured: false,
      published: true,
      sort_order: 1,
    });
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/Access denied/);
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it("allows verified admin to perform operations", async () => {
    mockAdminSession();
    vi.mocked(prisma.project.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.timelineEntry.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.siteContent.findMany).mockResolvedValueOnce([]);

    const res = await getDashboardData("en");
    expect(res.authenticated).toBe(true);
    expect(res.isAdmin).toBe(true);
    expect(res.error).toBeNull();
  });
});

describe("Dashboard Error Handling and Locale Validation", () => {
  it("returns safe user-facing message and hides raw Prisma error when project save fails", async () => {
    mockAdminSession();
    vi.mocked(prisma.project.create).mockRejectedValueOnce(
      new Error("FATAL: PrismaClientKnownRequestError: Unique constraint failed on projects.slug at postgresql://user:pass@secret-host:5432/db")
    );

    const res = await saveProjectAction({
      slug: "pizza-shopping",
      title: "Pizza Shopping",
      category: "E-commerce",
      description: "Desc",
      stack: ["Next.js"],
      href: "https://example.com",
      github_url: null,
      image_url: null,
      featured: true,
      published: true,
      sort_order: 1,
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("Failed to save project.");
    expect(res.error).not.toMatch(/Prisma/);
    expect(res.error).not.toMatch(/postgresql/);
    expect(res.error).not.toMatch(/secret-host/);
  });

  it("returns safe user-facing message when project delete fails", async () => {
    mockAdminSession();
    vi.mocked(prisma.project.delete).mockRejectedValueOnce(
      new Error("Foreign key constraint failed on delete")
    );

    const res = await deleteProjectAction("invalid-id");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Failed to delete project.");
    expect(res.error).not.toMatch(/constraint/);
  });

  it("validates locale on timeline entry and rejects unsupported locale", async () => {
    mockAdminSession();

    const res = await saveTimelineAction({
      locale: "fr" as unknown as "en",
      chapter: "01",
      period: "2024",
      title: "Title",
      body: "Body",
      tags: [],
      published: true,
      sort_order: 1,
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("Invalid locale. Must be 'en' or 'pt'.");
    expect(prisma.timelineEntry.create).not.toHaveBeenCalled();
  });

  it("returns safe user-facing message when timeline save fails", async () => {
    mockAdminSession();
    vi.mocked(prisma.timelineEntry.create).mockRejectedValueOnce(
      new Error("DB connection error")
    );

    const res = await saveTimelineAction({
      locale: "en",
      chapter: "01",
      period: "2024",
      title: "Title",
      body: "Body",
      tags: [],
      published: true,
      sort_order: 1,
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("Failed to save timeline entry.");
  });

  it("returns safe user-facing message when timeline delete fails", async () => {
    mockAdminSession();
    vi.mocked(prisma.timelineEntry.delete).mockRejectedValueOnce(
      new Error("DB error")
    );

    const res = await deleteTimelineAction("time-1");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Failed to delete timeline entry.");
  });

  it("validates locale on site content and rejects unsupported locale", async () => {
    mockAdminSession();

    const res = await saveContentAction([
      { locale: "de" as unknown as "en", section: "hero", field: "title", value: "Hallo" },
    ]);

    expect(res.success).toBe(false);
    expect(res.error).toBe("Invalid locale. Must be 'en' or 'pt'.");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("returns safe user-facing message when content save fails", async () => {
    mockAdminSession();
    vi.mocked(prisma.$transaction).mockRejectedValueOnce(
      new Error("Internal Prisma error with sensitive SQL state 42P01")
    );

    const res = await saveContentAction([
      { locale: "en", section: "hero", field: "title", value: "New Title" },
    ]);

    expect(res.success).toBe(false);
    expect(res.error).toBe("Failed to save content.");
    expect(res.error).not.toMatch(/42P01/);
    expect(res.error).not.toMatch(/Prisma/);
  });
});
