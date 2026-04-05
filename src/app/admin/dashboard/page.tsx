import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";
import { FileText, Tag, Eye, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [totalBlogs, publishedBlogs, draftBlogs, totalCategories, recentBlogs] =
    await Promise.all([
      prisma.blog.count(),
      prisma.blog.count({ where: { status: "published" } }),
      prisma.blog.count({ where: { status: "draft" } }),
      prisma.category.count(),
      prisma.blog.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { category: true },
      }),
    ]);

  const stats = [
    {
      label: "Total Blogs",
      value: totalBlogs,
      icon: FileText,
      color: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
      href: "/admin/blogs",
    },
    {
      label: "Published",
      value: publishedBlogs,
      icon: Eye,
      color: "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400",
      href: "/admin/blogs?status=published",
    },
    {
      label: "Drafts",
      value: draftBlogs,
      icon: FileText,
      color: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
      href: "/admin/blogs?status=draft",
    },
    {
      label: "Categories",
      value: totalCategories,
      icon: Tag,
      color: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400",
      href: "/admin/categories",
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Welcome back! Here&apos;s your blog overview.
            </p>
          </div>
          <Link
            href="/admin/blogs/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Post</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map(({ label, value, icon: Icon, color, href }) => (
            <Link
              key={label}
              href={href}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </Link>
          ))}
        </div>

        {/* Recent blogs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Posts</h2>
            <Link href="/admin/blogs" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentBlogs.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <p>No blogs yet.</p>
                <Link href="/admin/blogs/new" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block">
                  Create your first post
                </Link>
              </div>
            ) : (
              recentBlogs.map((blog) => (
                <div key={blog.id} className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                      {blog.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        blog.status === "published"
                          ? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400"
                          : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                      }`}>
                        {blog.status}
                      </span>
                      {blog.category && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline truncate">{blog.category.name}</span>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">{formatDate(blog.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/admin/blogs/${blog.id}/edit`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Edit
                    </Link>
                    {blog.status === "published" && (
                      <Link href={`/blog/${blog.slug}`} target="_blank" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hidden sm:inline">
                        View
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
