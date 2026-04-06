import Link from "next/link";
import { Feather } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Ashish Blog’s";

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Top row: brand left, nav right */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Feather className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {siteName}
            </Link>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              A software engineer sharing thoughts on technology, life, and everything learned along the way.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col sm:items-end gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-400 dark:text-gray-500">
          <p>&copy; {year} {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
