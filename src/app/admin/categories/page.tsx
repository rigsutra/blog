"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Pencil, Trash2, Check, X, Tag } from "lucide-react";
import { Category } from "@/types";

type CatWithCount = Category & { _count: { blogs: number } };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CatWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    if (res.ok) { setNewName(""); fetchCategories(); }
    else setError(data.error || "Failed to create category");
    setCreating(false);
  };

  const handleUpdate = async (id: number, name: string) => {
    if (!name.trim()) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) { setEditing(null); fetchCategories(); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"? Posts will become uncategorized.`)) return;
    setDeleting(id);
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setDeleting(null);
    fetchCategories();
  };

  const inputClass = "border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Organize your posts with categories</p>
        </div>

        {/* Create form */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Add Category</h2>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-3 bg-red-50 dark:bg-red-950/50 p-2 rounded-lg border border-red-200 dark:border-red-900">
              {error}
            </p>
          )}
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setError(""); }}
              placeholder="Category name..."
              className={`${inputClass} flex-1 py-2 px-3`}
            />
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {creating ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <Plus className="w-4 h-4" />}
              Add
            </button>
          </form>
        </div>

        {/* List */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <Tag className="w-8 h-8 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
              <p>No categories yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between px-5 py-4">
                  {editing?.id === cat.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <input
                        type="text"
                        value={editing.name}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        autoFocus
                        className={`${inputClass} flex-1 py-1.5 px-3`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(cat.id, editing.name);
                          if (e.key === "Escape") setEditing(null);
                        }}
                      />
                      <button onClick={() => handleUpdate(cat.id, editing.name)}
                        className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/50 rounded-lg">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditing(null)}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
                        <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{cat.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {cat._count.blogs} post{cat._count.blogs !== 1 ? "s" : ""} · /{cat.slug}
                        </p>
                      </div>
                    </div>
                  )}

                  {editing?.id !== cat.id && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditing({ id: cat.id, name: cat.name })}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} disabled={deleting === cat.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg disabled:opacity-40">
                        {deleting === cat.id ? (
                          <span className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin block" />
                        ) : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
