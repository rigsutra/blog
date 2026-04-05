"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { Menu } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-semibold text-gray-900 dark:text-white text-sm">
          Blog Admin
        </span>
      </div>

      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto md:ml-0 mt-14 md:mt-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
