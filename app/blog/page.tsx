import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedBlogPosts } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "Insights — Michele Cheng",
  description: "Articles on AI readiness, operational visibility, and ESG compliance for SMEs.",
};

export default async function BlogListPage() {
  let posts: Awaited<ReturnType<typeof getPublishedBlogPosts>> = [];
  let loadError = false;
  try {
    posts = await getPublishedBlogPosts();
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
        <h1 className="text-2xl font-bold text-navy-950">Couldn&apos;t load articles</h1>
        <p className="mt-3 text-navy-800/80">Please try again in a moment.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">
          Insights
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy-950">
          Articles &amp; field notes
        </h1>
      </div>

      {posts.length === 0 ? (
        <p className="mt-16 text-navy-800/60">No articles yet — check back soon.</p>
      ) : (
        <div className="mt-14 flex flex-col gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block rounded-2xl border border-navy-900/10 bg-white p-8 transition hover:border-gold-500 hover:shadow-md"
            >
              {post.published_at && (
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">
                  {new Date(post.published_at).toLocaleDateString("en-SG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
              <h2 className="mt-3 text-2xl font-bold text-navy-950">{post.title}</h2>
              <p className="mt-3 text-navy-800/80">{post.excerpt}</p>
              {post.tags && post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-cream-100 px-3 py-1 text-xs font-medium text-navy-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
