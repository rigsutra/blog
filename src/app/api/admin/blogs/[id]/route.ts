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

    // If the blog is already published and this is an auto-save, write to draft
    // fields only — don't touch the live content users can see.
    if (_autosave && existing.status === "published") {
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

    const sanitized = sanitizeContent(content);
    const readingTime = calculateReadingTime(sanitized);
    const slug =
      title !== existing.title ? generateSlug(title) : existing.slug;

    // Check slug uniqueness if changed
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

    const wasPublished = existing.status === "published";
    const isPublishing = status === "published";

    // When publishing, merge draft content if it exists, then clear draft fields
    const finalTitle = (wasPublished && existing.hasDraft && existing.draftTitle) ? existing.draftTitle : title;
    const finalExcerpt = (wasPublished && existing.hasDraft && existing.draftExcerpt !== null) ? existing.draftExcerpt : (excerpt || "");
    const finalContent = (wasPublished && existing.hasDraft && existing.draftContent) ? existing.draftContent : sanitized;
    const finalSanitized = (wasPublished && existing.hasDraft && existing.draftContent)
      ? existing.draftContent
      : sanitized;
    const finalReadingTime = calculateReadingTime(finalSanitized);
    const finalSlug = finalTitle !== existing.title ? generateSlug(finalTitle) : existing.slug;

    const blog = await prisma.blog.update({
      where: { id: parseInt(id) },
      data: {
        title: finalTitle,
        slug: finalSlug,
        excerpt: finalExcerpt,
        content: finalContent,
        coverImage: coverImage !== undefined ? coverImage || null : existing.coverImage,
        categoryId: categoryId ? parseInt(categoryId) : null,
        status: status || existing.status,
        readingTime: finalReadingTime,
        publishedAt: isPublishing && !wasPublished ? new Date() : existing.publishedAt,
        // Clear draft fields once published
        draftTitle: null,
        draftExcerpt: null,
        draftContent: null,
        hasDraft: false,
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
