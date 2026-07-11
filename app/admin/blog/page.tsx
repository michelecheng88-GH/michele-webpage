import Link from "next/link";
import type { Metadata } from "next";
import { getAllBlogPostsAdmin } from "@/lib/data/admin-blog";

export const metadata: Metadata = { title: "Blog — Admin" };

export default async function AdminBlogListPage() {
  let posts: Awaited<ReturnType<typeof getAllBlogPostsAdmin>> = [];
  let loadError = false;
  try {
    posts = await getAllBlogPostsAdmin();
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load blog posts. Please refresh the page.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-950">Blog posts</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-full bg-navy-950 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-gold-500 hover:text-navy-950"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-10 text-navy-800/60">No posts yet — create your first one.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/admin/blog/${post.id}`}
              className="flex items-center justify-between rounded-xl border border-navy-900/10 bg-white px-5 py-4 hover:border-gold-500"
            >
              <div>
                <p className="font-semibold text-navy-950">{post.title}</p>
                <p className="text-xs text-navy-800/60">/{post.slug}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  post.published ? "bg-green-50 text-green-700" : "bg-navy-900/5 text-navy-800/70"
                }`}
              >
                {post.published ? "Published" : "Draft"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
