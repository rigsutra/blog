import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateSlug, calculateReadingTime, sanitizeContent } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blog = await prisma.blog.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, excerpt, content, coverImage, categoryId, status, _autosave } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.blog.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const wasPublished = existing.status === "published";

    // Auto-save on a published blog → write to draft fields only.
    // Live content stays untouched so readers never see half-finished edits.
    if (_autosave && wasPublished) {
      const sanitizedDraft = sanitizeContent(content);
      const blog = await prisma.blog.update({
        where: { id: parseInt(id) },
        data: {
          draftTitle: title,
          draftExcerpt: excerpt || "",
          draftContent: sanitizedDraft,
          hasDraft: true,
        },
        include: { category: true },
      });
      return NextResponse.json({ blog });
    }

    const isPublishing = status === "published";

    // Re-publishing an already-published post: always use the current request
    // body (the live editor state — more up-to-date than the last auto-save),
    // clear any pending draft overlay, and revalidate the public page.
    if (isPublishing && wasPublished) {
      const sanitized = sanitizeContent(content);
      const liveSlug = title !== existing.title ? generateSlug(title) : existing.slug;

      if (liveSlug !== existing.slug) {
        const slugExists = await prisma.blog.findFirst({
          where: { slug: liveSlug, id: { not: parseInt(id) } },
        });
        if (slugExists) {
          return NextResponse.json(
            { error: "A blog with this title already exists" },
            { status: 400 }
          );
        }
      }

      const blog = await prisma.blog.update({
        where: { id: parseInt(id) },
        data: {
          title,
          slug: liveSlug,
          excerpt: excerpt || "",
          content: sanitized,
          readingTime: calculateReadingTime(sanitized),
          coverImage: coverImage !== undefined ? coverImage || null : existing.coverImage,
          categoryId: categoryId ? parseInt(categoryId) : null,
          draftTitle: null,
          draftExcerpt: null,
          draftContent: null,
          hasDraft: false,
        },
        include: { category: true },
      });

      revalidatePath(`/blog/${blog.slug}`);
      if (liveSlug !== existing.slug) revalidatePath(`/blog/${existing.slug}`);
      revalidatePath("/");
      return NextResponse.json({ blog });
    }

    // All other cases: draft→draft, draft→published (first publish).
    const sanitized = sanitizeContent(content);
    const readingTime = calculateReadingTime(sanitized);
    const slug = title !== existing.title ? generateSlug(title) : existing.slug;

    if (slug !== existing.slug) {
      const slugExists = await prisma.blog.findFirst({
        where: { slug, id: { not: parseInt(id) } },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "A blog with this title already exists" },
          { status: 400 }
        );
      }
    }

    const blog = await prisma.blog.update({
      where: { id: parseInt(id) },
      data: {
        title,
        slug,
        excerpt: excerpt || "",
        content: sanitized,
        coverImage: coverImage !== undefined ? coverImage || null : existing.coverImage,
        categoryId: categoryId ? parseInt(categoryId) : null,
        status: status || existing.status,
        readingTime,
        publishedAt: isPublishing && !wasPublished ? new Date() : existing.publishedAt,
        // Clear any draft overlay when the record becomes (or stays) a plain draft
        ...(status === "draft" && {
          draftTitle: null,
          draftExcerpt: null,
          draftContent: null,
          hasDraft: false,
        }),
      },
      include: { category: true },
    });

    if (blog.status === "published") {
      revalidatePath(`/blog/${blog.slug}`);
      if (slug !== existing.slug) revalidatePath(`/blog/${existing.slug}`);
      revalidatePath("/");
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.blog.findUnique({ where: { id: parseInt(id) } });
    await prisma.blog.delete({ where: { id: parseInt(id) } });

    if (existing?.status === "published") {
      revalidatePath(`/blog/${existing.slug}`);
      revalidatePath("/");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}
