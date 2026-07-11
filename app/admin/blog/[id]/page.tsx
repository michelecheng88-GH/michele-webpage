import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostByIdAdmin } from "@/lib/data/admin-blog";
import { BlogEditorForm } from "@/components/admin/BlogEditorForm";
import { deleteBlogPost } from "@/app/admin/blog/actions";

export const metadata: Metadata = { title: "Edit post — Admin" };

export default async function AdminEditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let post: Awaited<ReturnType<typeof getBlogPostByIdAdmin>> = null;
  let loadError = false;
  try {
    post = await getBlogPostByIdAdmin(id);
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load this post. Please refresh the page.
        </p>
      </main>
    );
  }

  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/admin/blog" className="text-sm font-semibold text-navy-800 hover:text-gold-500">
        ← Back to Blog
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-navy-950">Edit post</h1>
      <div className="mt-8">
        <BlogEditorForm post={post} />
      </div>

      <form action={deleteBlogPost} className="mt-8 border-t border-navy-900/10 pt-6">
        <input type="hidden" name="id" value={post.id} />
        <button
          type="submit"
          className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Delete post
        </button>
      </form>
    </main>
  );
}
