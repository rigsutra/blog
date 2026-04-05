import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const passwordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
    },
  });
  console.log("Admin user created:", admin.username);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "technology" },
      update: {},
      create: { name: "Technology", slug: "technology" },
    }),
    prisma.category.upsert({
      where: { slug: "design" },
      update: {},
      create: { name: "Design", slug: "design" },
    }),
    prisma.category.upsert({
      where: { slug: "programming" },
      update: {},
      create: { name: "Programming", slug: "programming" },
    }),
    prisma.category.upsert({
      where: { slug: "lifestyle" },
      update: {},
      create: { name: "Lifestyle", slug: "lifestyle" },
    }),
  ]);
  console.log("Categories created:", categories.map((c) => c.name).join(", "));

  // Create sample blogs
  const sampleBlogs = [
    {
      title: "Getting Started with Next.js 15",
      slug: "getting-started-with-nextjs-15",
      excerpt:
        "Next.js 15 brings exciting new features including improved performance, better developer experience, and the stable App Router. In this post we explore everything new.",
      content: `<h2>Introduction</h2><p>Next.js 15 is here, and it brings a host of improvements that make building React applications faster and more enjoyable. Whether you're a seasoned Next.js developer or just getting started, this guide will walk you through the most important features.</p><h2>What's New in Next.js 15</h2><p>The latest version includes several key improvements:</p><ul><li><strong>Improved Turbopack stability</strong> - The Rust-based bundler is now more stable and faster than ever</li><li><strong>Enhanced caching</strong> - Better cache invalidation strategies for dynamic content</li><li><strong>React 19 support</strong> - Full compatibility with React's latest features</li></ul><h2>Getting Started</h2><p>To create a new Next.js 15 project, run:</p><pre><code>npx create-next-app@latest my-app</code></pre><p>This sets up a new project with TypeScript, Tailwind CSS, and the App Router by default.</p><blockquote><p>Next.js 15 represents a significant step forward in the evolution of the framework, making it more performant and developer-friendly than ever before.</p></blockquote><h2>Conclusion</h2><p>Next.js 15 is a powerful release that builds on the solid foundation of previous versions. The improvements to performance, developer experience, and React compatibility make it an excellent choice for any web project.</p>`,
      coverImage: null,
      status: "published",
      readingTime: 5,
      categoryId: categories[0].id,
      publishedAt: new Date(),
    },
    {
      title: "The Art of Clean Code",
      slug: "the-art-of-clean-code",
      excerpt:
        "Writing clean, maintainable code is an art form. Discover the principles, patterns, and practices that separate good code from great code.",
      content: `<h2>Why Clean Code Matters</h2><p>Clean code is not just about aesthetics — it's about creating software that can be easily understood, maintained, and extended by anyone who works with it, including your future self.</p><h2>Key Principles</h2><h3>1. Meaningful Names</h3><p>Variables, functions, and classes should have names that reveal intent. A name like <code>getUserById</code> is infinitely better than <code>getData</code>.</p><h3>2. Small Functions</h3><p>Functions should do one thing, and do it well. If a function needs a comment to explain what it does, it probably needs to be broken down further.</p><h3>3. DRY - Don't Repeat Yourself</h3><p>Duplication is the enemy of maintainability. Whenever you find yourself copying code, consider extracting it into a reusable function.</p><blockquote><p>"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler</p></blockquote><h2>Conclusion</h2><p>Clean code is a practice, not a destination. Every commit is an opportunity to leave the codebase a little better than you found it.</p>`,
      coverImage: null,
      status: "published",
      readingTime: 7,
      categoryId: categories[2].id,
      publishedAt: new Date(Date.now() - 86400000),
    },
    {
      title: "Designing for Accessibility",
      slug: "designing-for-accessibility",
      excerpt:
        "Accessibility isn't an afterthought — it's a core design principle. Learn how to build inclusive web experiences that work for everyone.",
      content: `<h2>What is Web Accessibility?</h2><p>Web accessibility means that websites, tools, and technologies are designed and developed so that people with disabilities can use them. More than 1 billion people worldwide live with some form of disability.</p><h2>Core Principles (WCAG)</h2><ul><li><strong>Perceivable</strong> - Information must be presentable in ways users can perceive</li><li><strong>Operable</strong> - UI components must be operable by all users</li><li><strong>Understandable</strong> - Information must be understandable</li><li><strong>Robust</strong> - Content must be robust enough for assistive technologies</li></ul><h2>Practical Tips</h2><p>Start with semantic HTML. Use proper heading hierarchy, landmark elements, and ARIA labels where necessary. Ensure sufficient color contrast and never rely on color alone to convey information.</p><blockquote><p>Accessibility is not a feature, it's a social trend. — Antonio Santos</p></blockquote>`,
      coverImage: null,
      status: "published",
      readingTime: 6,
      categoryId: categories[1].id,
      publishedAt: new Date(Date.now() - 172800000),
    },
  ];

  for (const blog of sampleBlogs) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: {},
      create: blog,
    });
  }
  console.log("Sample blogs created:", sampleBlogs.length);

  console.log("\nSeeding complete!");
  console.log("Admin credentials: username=admin, password=admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
