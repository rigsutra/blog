"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Category } from "@/types";

interface SearchFilterProps {
  categories: Category[];
}

export default function SearchFilter({ categories }: SearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const isFirstRender = useRef(true);

  const updateUrl = useCallback(
    (newSearch: string, newCategory: string) => {
      const params = new URLSearchParams();
      if (newSearch) params.set("search", newSearch);
      if (newCategory) params.set("category", newCategory);
      const query = params.toString();
      router.replace(query ? `/?${query}` : "/", { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    // Skip on initial mount — prevents scroll-to-top when navigating back
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      updateUrl(search, category);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, category, updateUrl]);

  const clearSearch = () => {
    setSearch("");
    updateUrl("", category);
  };

  const inputClass =
    "w-full border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
      {/* Search — 3/4 the width of the category dropdown */}
      <div className="relative w-full sm:w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className={`${inputClass} pl-10 pr-10 py-2.5`}
        />
        {search && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category — base width, search is 3/4 of this (180/240 = 0.75) */}
      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          updateUrl(search, e.target.value);
        }}
        className={`${inputClass} py-2.5 px-4 w-full sm:w-[150px]`}
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name} ({cat._count?.blogs ?? 0})
          </option>
        ))}
      </select>
    </div>
  );
}
