import Link from "next/link";
import type { Metadata } from "next";
import { BlogEditorForm } from "@/components/admin/BlogEditorForm";

export const metadata: Metadata = { title: "New post — Admin" };

export default function AdminNewBlogPostPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/admin/blog" className="text-sm font-semibold text-navy-800 hover:text-gold-500">
        ← Back to Blog
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-navy-950">New post</h1>
      <div className="mt-8">
        <BlogEditorForm />
      </div>
    </main>
  );
}
