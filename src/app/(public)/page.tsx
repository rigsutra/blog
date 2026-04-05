import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BlogCard from "@/components/public/BlogCard";
import SearchFilter from "@/components/public/SearchFilter";
import { Blog, Category } from "@/types";

export const metadata: Metadata = {
  title: "Home",
  description: "Browse all articles and blog posts",
};

interface HomePageProps {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}

async function BlogList({
  search,
  category,
  page,
}: {
  search: string;
  category: string;
  page: number;
}) {
  const limit = 9;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { status: "published" };
  if (search) where.title = { contains: search };
  if (category) where.category = { slug: category };

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

  const totalPages = Math.ceil(total / limit);

  if (blogs.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">✍️</p>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No articles found
        </h3>
        <p className="text-gray-400 dark:text-gray-500">
          {search || category
            ? "Try adjusting your search or filter."
            : "Check back soon for new content."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <BlogCard
            key={blog.id}
            blog={blog as Blog & { category: Category | null }}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (category) params.set("category", category);
            if (p > 1) params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/?${params.toString()}`}
                scroll={false}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";
  const page = parseInt(params.page || "1");

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { blogs: { where: { status: "published" } } } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Ideas worth sharing
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
          Thoughtful articles on technology, design, and the creative process.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-10">
        <Suspense fallback={null}>
          <SearchFilter categories={categories as Category[]} />
        </Suspense>
      </div>

      {/* Blog grid */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-72 animate-pulse"
              />
            ))}
          </div>
        }
      >
        <BlogList search={search} category={category} page={page} />
      </Suspense>
    </div>
  );
}
