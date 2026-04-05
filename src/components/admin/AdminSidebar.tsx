"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Tag,
  LogOut,
  Feather,
  Plus,
  Sun,
  Moon,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/blogs", label: "All Blogs", icon: FileText },
  { href: "/admin/blogs/new", label: "New Blog", icon: Plus },
  { href: "/admin/categories", label: "Categories", icon: Tag },
];

function SidebarThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="sidebar-link text-gray-500 dark:text-gray-400 w-full text-left"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleNavClick = () => {
    // Close the mobile drawer when a nav link is tapped
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 min-h-screen bg-white dark:bg-gray-950
          border-r border-gray-200 dark:border-gray-800
          flex flex-col
          transform transition-transform duration-200 ease-in-out
          md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="h-14 md:h-16 flex items-center justify-between px-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <Link
            href="/"
            onClick={handleNavClick}
            className="flex items-center gap-2 font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Feather className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Blog Admin</span>
          </Link>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/admin/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={handleNavClick}
                className={`sidebar-link ${isActive ? "active" : "text-gray-600 dark:text-gray-400"}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1 shrink-0">
          <SidebarThemeToggle />
          <Link
            href="/"
            target="_blank"
            onClick={handleNavClick}
            className="sidebar-link text-gray-600 dark:text-gray-400"
          >
            <FileText className="w-4 h-4 shrink-0" />
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="sidebar-link text-gray-600 dark:text-gray-400 w-full text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
