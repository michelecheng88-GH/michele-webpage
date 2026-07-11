import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { getBlogPostBySlug } from "@/lib/data/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Article not found — Michele Cheng" };
  return { title: `${post.title} — Michele Cheng`, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post: Awaited<ReturnType<typeof getBlogPostBySlug>> = null;
  let loadError = false;
  try {
    post = await getBlogPostBySlug(slug);
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
        <h1 className="text-2xl font-bold text-navy-950">Couldn&apos;t load this article</h1>
        <p className="mt-3 text-navy-800/80">Please try again in a moment.</p>
      </main>
    );
  }

  if (!post) notFound();

  const html = marked.parse(post.body_markdown, { async: false }) as string;

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <Link href="/blog" className="text-sm font-semibold text-navy-800 hover:text-gold-500">
        ← Back to Insights
      </Link>

      {post.published_at && (
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-gold-500">
          {new Date(post.published_at).toLocaleDateString("en-SG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy-950">{post.title}</h1>

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

      <article
        className="prose mt-10 max-w-none prose-headings:text-navy-950 prose-a:text-gold-500"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="mt-16 rounded-2xl bg-navy-950 p-8 text-center text-cream-50">
        <p className="text-lg font-semibold">Curious where your business stands?</p>
        <Link
          href="/quiz"
          className="mt-4 inline-block rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400"
        >
          Take the Free S.A.F.E.R. AI Quiz
        </Link>
      </div>
    </main>
  );
}
