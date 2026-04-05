import { notFound } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import BlogForm from "@/components/admin/BlogForm";
import { prisma } from "@/lib/prisma";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditPageProps) {
  const { id } = await params;
  const blog = await prisma.blog.findUnique({
    where: { id: parseInt(id) },
  });

  if (!blog) notFound();

  // When a published blog has unsaved draft changes, load the draft content in
  // the editor so the admin sees what they were working on — not the live version.
  const editTitle = (blog.hasDraft && blog.draftTitle) ? blog.draftTitle : blog.title;
  const editExcerpt = (blog.hasDraft && blog.draftExcerpt !== null) ? blog.draftExcerpt : blog.excerpt;
  const editContent = (blog.hasDraft && blog.draftContent) ? blog.draftContent : blog.content;

  return (
    <AdminLayout>
      <BlogForm
        initialData={{
          id: blog.id,
          title: editTitle,
          slug: blog.slug,
          excerpt: editExcerpt,
          content: editContent,
          coverImage: blog.coverImage,
          categoryId: blog.categoryId,
          status: blog.status,
          hasDraft: blog.hasDraft,
        }}
      />
    </AdminLayout>
  );
}
