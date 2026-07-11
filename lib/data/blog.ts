import { createClient } from "@/lib/supabase/server";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body_markdown: string;
  published: boolean;
  published_at: string | null;
  tags: string[] | null;
};

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, body_markdown, published, published_at, tags")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) throw new Error(`Failed to load blog posts: ${error.message}`);
  return data ?? [];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, body_markdown, published, published_at, tags")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error(`Failed to load blog post: ${error.message}`);
  return data;
}
