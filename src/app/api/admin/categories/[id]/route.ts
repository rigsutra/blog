import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Get all published blog slugs using this category before renaming
    const affectedBlogs = await prisma.blog.findMany({
      where: { categoryId: parseInt(id), status: "published" },
      select: { slug: true },
    });

    const slug = generateSlug(name);
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name: name.trim(), slug },
    });

    // Revalidate every blog page that displayed the old category name
    for (const blog of affectedBlogs) {
      revalidatePath(`/blog/${blog.slug}`);
    }
    revalidatePath("/");

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Collect affected blog slugs before unlinking
    const affectedBlogs = await prisma.blog.findMany({
      where: { categoryId: parseInt(id), status: "published" },
      select: { slug: true },
    });

    // Unlink blogs from this category first
    await prisma.blog.updateMany({
      where: { categoryId: parseInt(id) },
      data: { categoryId: null },
    });

    await prisma.category.delete({ where: { id: parseInt(id) } });

    // Revalidate every blog page that showed this category
    for (const blog of affectedBlogs) {
      revalidatePath(`/blog/${blog.slug}`);
    }
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
