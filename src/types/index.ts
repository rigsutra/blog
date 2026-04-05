export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  status: "draft" | "published";
  readingTime: number;
  categoryId: number | null;
  category?: Category | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  _count?: {
    blogs: number;
  };
}

export interface AdminUser {
  id: number;
  username: string;
  createdAt: Date;
}

export interface BlogCardProps {
  blog: Blog & { category?: Category | null };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
