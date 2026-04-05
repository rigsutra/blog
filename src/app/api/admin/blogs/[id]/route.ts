import { NextRequest, NextResponse } from "next/server";
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
    // Live content (title/excerpt/content) stays untouched so readers never
    // see half-finished edits.
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

    // Manual publish of a published blog that has pending draft changes:
    // promote the draft fields to live fields, then clear them.
    const isPublishing = status === "published";
    if (isPublishing && wasPublished && existing.hasDraft) {
      const liveTitle   = existing.draftTitle   ?? title;
      const liveExcerpt = existing.draftExcerpt ?? excerpt ?? "";
      const liveContent = existing.draftContent ?? content;
      const liveSanitized = sanitizeContent(liveContent);
      const liveSlug = liveTitle !== existing.title
        ? generateSlug(liveTitle)
        : existing.slug;

      const blog = await prisma.blog.update({
        where: { id: parseInt(id) },
        data: {
          title: liveTitle,
          slug: liveSlug,
          excerpt: liveExcerpt,
          content: liveSanitized,
          readingTime: calculateReadingTime(liveSanitized),
          coverImage: coverImage !== undefined ? coverImage || null : existing.coverImage,
          categoryId: categoryId ? parseInt(categoryId) : null,
          draftTitle: null,
          draftExcerpt: null,
          draftContent: null,
          hasDraft: false,
        },
        include: { category: true },
      });
      return NextResponse.json({ blog });
    }

    // Normal save (draft blog, or first-time publish, or plain re-publish):
    // update live fields directly, no draft handling needed.
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
      },
      include: { category: true },
    });

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
    await prisma.blog.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}
