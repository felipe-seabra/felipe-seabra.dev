import {describe,expect,it,vi} from "vitest";
import {NextRequest} from "next/server";
import {GET} from "@/app/api/content/route";
import {prisma} from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    siteContent: { findMany: vi.fn() },
    timelineEntry: { findMany: vi.fn() },
    project: { findMany: vi.fn() },
  },
}));

describe("GET /api/content", () => {
  it("returns content, timeline and projects for valid locale", async () => {
    vi.mocked(prisma.siteContent.findMany).mockResolvedValueOnce([
      { id: "1", locale: "en", section: "hero", field: "title", value: "Hero Title", updated_at: new Date() },
    ]);
    vi.mocked(prisma.timelineEntry.findMany).mockResolvedValueOnce([
      {
        id: "time-1",
        locale: "en",
        chapter: "01",
        period: "2024",
        title: "Job Title",
        body: "Description",
        tags: ["React"],
        published: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
    vi.mocked(prisma.project.findMany).mockResolvedValueOnce([
      {
        id: "proj-1",
        slug: "pizza-shopping",
        title: "Pizza Shopping",
        category: "E-commerce",
        description: "Store",
        stack: ["Next.js"],
        href: "https://www.pizzashopping.com.br",
        github_url: null,
        image_url: null,
        featured: true,
        published: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    const req = new NextRequest("http://localhost:3000/api/content?locale=en");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.content).toEqual({ "hero.title": "Hero Title" });
    expect(data.timeline).toHaveLength(1);
    expect(data.projects).toHaveLength(1);
    expect(data.projects[0].title).toBe("Pizza Shopping");
  });

  it("handles database failures gracefully with status 500 and safe error message", async () => {
    vi.mocked(prisma.siteContent.findMany).mockRejectedValueOnce(new Error("Table does not exist"));

    const req = new NextRequest("http://localhost:3000/api/content?locale=en");
    const res = await GET(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data).toEqual({ error: "Content is temporarily unavailable." });
  });
});
