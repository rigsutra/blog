import Link from "next/link";
import { Feather } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white"
            >
              <Feather className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {process.env.NEXT_PUBLIC_SITE_NAME || "Ashish Blog's"}
            </Link>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
                "A modern blog sharing ideas, stories, and perspectives."}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Navigation
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Admin
            </h3>
            <Link
              href="/admin/login"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Admin Panel
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            &copy; {year} {process.env.NEXT_PUBLIC_SITE_NAME || "Ashish Blog's"}
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
