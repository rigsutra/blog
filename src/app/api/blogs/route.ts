import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      status: "published",
    };

    if (search) {
      where.title = { contains: search };
    }

    if (category) {
      where.category = { slug: category };
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: { category: true },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    return NextResponse.json({
      blogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
