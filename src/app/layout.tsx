import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_SITE_NAME || "Ashish Blog's",
    template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME || "Ashish Blog's"}`,
  },
  description:
    "My name is Ashish, and I'm a software Engineer and this website is to share by ideas thought it could be related to any topic but mostly about technology lifestyle and life itself some times about presonla life blogger sharing my thoughts, experiences, and insights on various topics. Welcome to my personal blog where I explore a wide range of subjects, from technology and programming to lifestyle and travel. Join me on this journey as I share my ideas, stories, and perspectives with the world.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
