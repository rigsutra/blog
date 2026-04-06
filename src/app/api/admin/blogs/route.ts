import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateSlug, calculateReadingTime, sanitizeContent } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.title = { contains: search };
    }
    if (status) {
      where.status = status;
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: { category: true },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    return NextResponse.json({
      blogs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching admin blogs:", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, excerpt, content, coverImage, categoryId, status } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const slug = generateSlug(title);
    const sanitized = sanitizeContent(content);
    const readingTime = calculateReadingTime(sanitized);

    // Ensure unique slug
    const existing = await prisma.blog.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const blog = await prisma.blog.create({
      data: {
        title,
        slug: finalSlug,
        excerpt: excerpt || "",
        content: sanitized,
        coverImage: coverImage || null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        status: status || "draft",
        readingTime,
        publishedAt: status === "published" ? new Date() : null,
      },
      include: { category: true },
    });

    if (blog.status === "published") {
      revalidatePath(`/blog/${blog.slug}`);
      revalidatePath("/");
    }

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}
