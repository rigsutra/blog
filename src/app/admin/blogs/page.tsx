"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Search, Pencil, Trash2, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Blog, Category } from "@/types";

type BlogWithCategory = Blog & { category: Category | null };

function AdminBlogsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [blogs, setBlogs] = useState<BlogWithCategory[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [deleting, setDeleting] = useState<number | null>(null);
  const page = parseInt(searchParams.get("page") || "1");

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    params.set("page", String(page));
    const res = await fetch(`/api/admin/blogs?${params.toString()}`);
    const data = await res.json();
    setBlogs(data.blogs || []);
    setMeta(data.meta || { total: 0, totalPages: 1, page: 1 });
    setLoading(false);
  }, [search, status, page]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
    setDeleting(null);
    fetchBlogs();
  };

  const updateFilters = (newSearch: string, newStatus: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newStatus) params.set("status", newStatus);
    router.push(`/admin/blogs?${params.toString()}`);
  };

  const selectClass = "py-2 px-4 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Blogs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {meta.total} post{meta.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setTimeout(() => updateFilters(e.target.value, status), 400);
            }}
            placeholder="Search blogs..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); updateFilters(search, e.target.value); }}
          className={selectClass}
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <p className="text-3xl mb-3">📝</p>
            <p>No blogs found.</p>
            <Link href="/admin/blogs/new" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block">
              Create your first post
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                {["Title", "Category", "Status", "Date", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={`text-left px-${i === 0 || i === 4 ? "6" : "4"} py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                      i === 1 ? "hidden md:table-cell" : i === 3 ? "hidden sm:table-cell" : ""
                    } ${i === 4 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-xs">{blog.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-xs">{blog.slug}</p>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    {blog.category ? (
                      <span className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        {blog.category.name}
                      </span>
                    ) : <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      blog.status === "published"
                        ? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400"
                        : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(blog.updatedAt)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {blog.status === "published" && (
                        <Link href={`/blog/${blog.slug}`} target="_blank"
                          className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="View post">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                      <Link href={`/admin/blogs/${blog.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(blog.id, blog.title)}
                        disabled={deleting === blog.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 disabled:opacity-40"
                        title="Delete"
                      >
                        {deleting === blog.id ? (
                          <span className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin block" />
                        ) : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (status) params.set("status", status);
            if (p > 1) params.set("page", String(p));
            return (
              <Link key={p} href={`/admin/blogs?${params.toString()}`}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}>
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminBlogsPage() {
  return (
    <AdminLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <AdminBlogsInner />
      </Suspense>
    </AdminLayout>
  );
}
