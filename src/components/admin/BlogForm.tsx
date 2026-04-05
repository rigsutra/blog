"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Save, Eye, Send, ArrowLeft, ImageIcon, X, Upload, AlertCircle } from "lucide-react";
import { generateSlugClient as generateSlug } from "@/lib/client-utils";
import { Category } from "@/types";
import Image from "next/image";

const BlogEditor = dynamic(() => import("./BlogEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 min-h-[400px] flex items-center justify-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900">
      <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-gray-500 dark:border-t-gray-400 rounded-full animate-spin mr-2" />
      Loading editor...
    </div>
  ),
});

interface BlogFormProps {
  initialData?: {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    categoryId: number | null;
    status: string;
    hasDraft?: boolean;
  };
}

export default function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    coverImage: initialData?.coverImage || "",
    categoryId: initialData?.categoryId?.toString() || "",
    status: initialData?.status || "draft",
  });

  // ── Upload tracking ──────────────────────────────────────────
  // Counts how many uploads (cover + inline editor images) are in flight
  const [activeUploads, setActiveUploads] = useState(0);
  // When Publish is clicked while an upload is in progress we store the
  // intended status here and execute the save once all uploads finish
  const [pendingPublish, setPendingPublish] = useState<string | null>(null);

  // ── Other UI state ───────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [hasDraft, setHasDraft] = useState(initialData?.hasDraft ?? false);
  const [preview, setPreview] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isEdit = !!initialData;
  // Tracks the real blog ID once it has been created (first save of a new post).
  // Using a ref so autoSave / executeSave always read the latest value without
  // needing to be re-created on every render.
  const blogIdRef = useRef<number | null>(initialData?.id ?? null);

  // ── Derived publish-button state ─────────────────────────────
  const isUploading = activeUploads > 0;
  // Button is busy if: an upload is running (with queued publish), OR the API call is in flight
  const publishBusy = saving || (isUploading && pendingPublish !== null);
  const publishLabel = saving
    ? "Publishing..."
    : isUploading && pendingPublish !== null
    ? "Uploading image…"
    : "Publish";

  // ── Auto-execute pending publish when all uploads finish ─────
  useEffect(() => {
    if (activeUploads === 0 && pendingPublish !== null) {
      const status = pendingPublish;
      setPendingPublish(null);
      executeSave(status);
    }
    // executeSave is stable (useCallback below), safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUploads, pendingPublish]);

  // ── Categories ────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  // ── Slug auto-generate ────────────────────────────────────────
  useEffect(() => {
    const existingSlug = initialData?.slug ?? "";
    if (!isEdit && form.title && !existingSlug) {
      setForm((f) => ({ ...f, slug: generateSlug(f.title) }));
    }
  }, [form.title, isEdit, initialData]);

  // ── Auto-save draft ───────────────────────────────────────────
  const autoSave = useCallback(async () => {
    if (!form.title || !form.content) return;
    setSaveStatus("saving");
    try {
      const id = blogIdRef.current;
      const url = id ? `/api/admin/blogs/${id}` : "/api/admin/blogs";
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        // _autosave: true tells the API to write to draft fields only when
        // the blog is already published, leaving live content untouched.
        body: JSON.stringify({ ...form, status: form.status, _autosave: true }),
      });
      const data = await res.json();
      if (res.ok) {
        // First time this new post is saved — remember its ID so every
        // subsequent auto-save and manual save uses PUT, not POST.
        if (!id && data.blog?.id) {
          blogIdRef.current = data.blog.id;
          // Silently update the URL to /admin/blogs/:id/edit so a page
          // refresh won't create yet another entry.
          window.history.replaceState(null, "", `/admin/blogs/${data.blog.id}/edit`);
        }
        // If the blog is published, the server wrote to draft fields — show banner
        if (form.status === "published") {
          setHasDraft(true);
        }
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  }, [form]);

  useEffect(() => {
    if (!form.title || !form.content) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { autoSave(); }, 5000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [form.content, form.title, autoSave]);

  // ── Core save (API call) ──────────────────────────────────────
  const executeSave = useCallback(async (status: string) => {
    if (!form.title || !form.content) {
      alert("Title and content are required.");
      return;
    }
    setSaving(true);
    try {
      const id = blogIdRef.current;
      const url = id ? `/api/admin/blogs/${id}` : "/api/admin/blogs";
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      });
      const data = await res.json();
      if (res.ok) {
        // Store the ID on first creation so future saves never POST again
        if (!id && data.blog?.id) {
          blogIdRef.current = data.blog.id;
        }
        setHasDraft(false);
        setForm((f) => ({ ...f, status }));
        router.push(`/admin/blogs/${data.blog.id}/edit`);
        router.refresh();
      } else {
        alert(data.error || "Failed to save");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  }, [form, router]);

  // ── Button click handlers ─────────────────────────────────────
  const handleSaveDraft = () => {
    // Draft saves go immediately — no need to wait for images
    executeSave("draft");
  };

  const handlePublish = () => {
    if (activeUploads > 0) {
      // Queue the publish; it will fire once all uploads complete
      setPendingPublish("published");
      return;
    }
    executeSave("published");
  };

  // ── Image upload helpers ──────────────────────────────────────
  const handleCoverUpload = async (file: File) => {
    setActiveUploads((n) => n + 1);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setForm((f) => ({ ...f, coverImage: data.url }));
      } else {
        alert(data.error || "Upload failed");
      }
    } finally {
      setActiveUploads((n) => n - 1);
    }
  };

  // Passed to BlogEditor — each inline image upload increments/decrements the counter
  const handleEditorImageUpload = async (file: File): Promise<string> => {
    setActiveUploads((n) => n + 1);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      return data.url;
    } finally {
      setActiveUploads((n) => n - 1);
    }
  };

  const inputClass =
    "w-full py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? "Edit Post" : "New Post"}
            </h1>
            {/* Status line */}
            <p className="text-xs mt-0.5 flex items-center gap-1.5">
              {isUploading ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-blue-500 dark:text-blue-400">
                    Uploading {activeUploads} image{activeUploads > 1 ? "s" : ""}…
                  </span>
                </>
              ) : saveStatus === "saving" ? (
                <span className="text-gray-400 dark:text-gray-500">Auto-saving…</span>
              ) : saveStatus === "saved" ? (
                <span className="text-green-500 dark:text-green-400">
                  {form.status === "published" ? "Draft changes saved" : "Draft saved"}
                </span>
              ) : saveStatus === "error" ? (
                <span className="text-red-500 dark:text-red-400">Save failed</span>
              ) : (
                <span className="text-gray-400 dark:text-gray-500">
                  {isEdit ? "Last saved" : "Unsaved"}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview toggle */}
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-1.5 text-sm px-3 py-2 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Eye className="w-4 h-4" />
            {preview ? "Edit" : "Preview"}
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm px-3 py-2 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>

          {/* Publish — stays in loading until images are uploaded AND API call completes */}
          <button
            onClick={handlePublish}
            disabled={publishBusy}
            title={
              isUploading && pendingPublish !== null
                ? `Waiting for ${activeUploads} image upload${activeUploads > 1 ? "s" : ""} to finish…`
                : undefined
            }
            className="flex items-center gap-1.5 text-sm px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-70 disabled:cursor-wait font-medium min-w-[110px] justify-center"
          >
            {publishBusy ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {publishLabel}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Publish
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Unpublished changes banner ────────────────────────────── */}
      {hasDraft && form.status === "published" && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>You have unpublished changes. Click <strong>Publish</strong> to make them live.</span>
        </div>
      )}

      {/* ── Upload progress bar (visible when any upload is active) ── */}
      {isUploading && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300">
          <Upload className="w-4 h-4 shrink-0 animate-pulse" />
          <span>
            Uploading {activeUploads} image{activeUploads > 1 ? "s" : ""} to server…
          </span>
          <div className="ml-auto flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 animate-bounce"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Main grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main area */}
        <div className="lg:col-span-2 space-y-4">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Post title..."
            className="w-full text-3xl font-bold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 border-0 border-b-2 border-gray-100 dark:border-gray-800 focus:border-blue-300 dark:focus:border-blue-700 focus:outline-none pb-3 bg-transparent"
          />

          {preview ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 min-h-[400px]">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {form.title || "Untitled"}
              </h2>
              {form.excerpt && (
                <p className="text-gray-500 dark:text-gray-400 italic mb-6 text-lg border-l-4 border-blue-200 dark:border-blue-800 pl-4">
                  {form.excerpt}
                </p>
              )}
              <div
                className="blog-content dark:text-gray-200"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            </div>
          ) : (
            <BlogEditor
              content={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              onImageUpload={handleEditorImageUpload}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Settings */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Settings</h3>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">URL Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className={`${inputClass} font-mono`}
                placeholder="post-url-slug"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className={inputClass}
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={4}
              placeholder="Short description..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Cover image */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Cover Image</h3>

            {/* Preview thumbnail */}
            {form.coverImage && (
              <div className="relative rounded-lg overflow-hidden mb-2">
                <Image
                  src={form.coverImage}
                  alt="Cover"
                  width={400}
                  height={200}
                  className="w-full h-32 object-cover"
                />
                <button
                  onClick={() => setForm({ ...form, coverImage: "" })}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Upload in-progress overlay */}
            {activeUploads > 0 && !form.coverImage && (
              <div className="h-32 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 flex flex-col items-center justify-center gap-2 mb-2">
                <span className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-blue-600 dark:text-blue-400">Uploading to server…</span>
              </div>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={activeUploads > 0}
                className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activeUploads > 0 ? (
                  <span className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                {activeUploads > 0 ? "Uploading…" : "Upload image"}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverUpload(file);
                  e.target.value = "";
                }}
              />
              <input
                type="text"
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder="Or paste image URL..."
                className={`${inputClass} text-xs`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
