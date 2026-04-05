import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import BlogCard from "@/components/public/BlogCard";
import { Blog, Category } from "@/types";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await prisma.blog.findUnique({
    where: { slug, status: "published" },
  });
  if (!blog) return { title: "Not Found" };
  return {
    title: blog.title,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: blog.coverImage ? [{ url: blog.coverImage }] : [],
      type: "article",
      publishedTime: blog.publishedAt?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
    },
  };
}

export async function generateStaticParams() {
  const blogs = await prisma.blog.findMany({
    where: { status: "published" },
    select: { slug: true },
  });
  return blogs.map((b) => ({ slug: b.slug }));
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;

  const blog = await prisma.blog.findUnique({
    where: { slug, status: "published" },
    include: { category: true },
  });
  if (!blog) notFound();

  const related = await prisma.blog.findMany({
    where: {
      status: "published",
      id: { not: blog.id },
      categoryId: blog.categoryId ?? undefined,
    },
    include: { category: true },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all articles
      </Link>

      {/* Category */}
      {blog.category && (
        <Link href={`/?category=${blog.category.slug}`}>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full mb-6 hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors">
            <Tag className="w-3 h-3" />
            {blog.category.name}
          </span>
        </Link>
      )}

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-6 tracking-tight">
        {blog.title}
      </h1>

      {/* Meta */}
      <div className="flex items-center gap-6 text-sm text-gray-400 dark:text-gray-500 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{blog.readingTime} min read</span>
        </div>
      </div>

      {/* Cover Image */}
      {blog.coverImage && (
        <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden mb-10">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Excerpt */}
      {blog.excerpt && (
        <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-8 font-light italic border-l-4 border-blue-200 dark:border-blue-800 pl-5">
          {blog.excerpt}
        </p>
      )}

      {/* Content */}
      <div
        className="blog-content text-gray-800 dark:text-gray-200"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Related posts */}
      {related.length > 0 && (
        <section className="mt-16 pt-12 border-t border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            More articles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {related.slice(0, 2).map((r) => (
              <BlogCard
                key={r.id}
                blog={r as Blog & { category: Category | null }}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
