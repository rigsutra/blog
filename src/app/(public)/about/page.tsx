import type { Metadata } from "next";
import { Feather, Pen, BookOpen, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Ashish and the ideas behind this blog.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-950/50 rounded-2xl mb-6">
          <Feather className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          About Me
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
          Hi, I’m Ashish — a software engineer sharing thoughts on technology, life, and everything in between.
        </p>
      </div>

      {/* Story */}
      <div className="mb-16 space-y-5">
        <p className=" text-gray-600 dark:text-gray-400 leading-relaxed">
          This blog is my personal space to share ideas, experiences, and lessons I pick up along the way.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          I mostly write about technology and programming, but you’ll also find thoughts on lifestyle, personal growth, and occasional glimpses into my life.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          The goal is simple — to keep things honest, useful, and worth your time. No noise, just meaningful content and real perspectives.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Pen,
            title: "Real Thoughts",
            desc: "Sharing genuine ideas, experiences, and perspectives without the fluff.",
          },
          {
            icon: BookOpen,
            title: "Learning Journey",
            desc: "Documenting what I learn in tech, life, and everything in between.",
          },
          {
            icon: Heart,
            title: "Simple & Honest",
            desc: "Clean writing focused on clarity, usefulness, and authenticity.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800"
          >
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-xl flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}