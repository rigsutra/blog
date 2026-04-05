import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Tag } from "lucide-react";
import { Blog, Category } from "@/types";
import { formatDate } from "@/lib/utils";

interface BlogCardProps {
  blog: Blog & { category?: Category | null };
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <article className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300">
      {/* Cover Image */}
      <Link href={`/blog/${blog.slug}`}>
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 overflow-hidden">
          {blog.coverImage ? (
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold text-blue-200 dark:text-gray-600 select-none">
                {blog.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-6">
        {/* Category */}
        {blog.category && (
          <Link href={`/?category=${blog.category.slug}`}>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full mb-3 hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors">
              <Tag className="w-3 h-3" />
              {blog.category.name}
            </span>
          </Link>
        )}

        {/* Title */}
        <Link href={`/blog/${blog.slug}`}>
          <h2 className="font-bold text-gray-900 dark:text-white text-lg leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {blog.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">
          {blog.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{blog.readingTime} min read</span>
          </div>
        </div>
      </div>
    </article>
  );
}
