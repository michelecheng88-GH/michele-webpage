"use client";

import { useEffect, useRef, useState } from "react";
import { saveBlogPost } from "@/app/admin/blog/actions";
import { slugify } from "@/lib/utils/slugify";
import type { BlogPost } from "@/lib/data/blog";

export function BlogEditorForm({ post }: { post?: BlogPost }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body_markdown ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [published, setPublished] = useState(post?.published ?? false);
  const slugManuallyEdited = useRef(Boolean(post));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  function handleTitleChange(value: string) {
    setTitle(value);
    setDirty(true);
    if (!slugManuallyEdited.current) {
      setSlug(slugify(value));
    }
  }

  return (
    <form action={saveBlogPost} className="flex flex-col gap-4">
      {post && <input type="hidden" name="id" value={post.id} />}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-navy-800">Title</span>
        <input
          name="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-navy-800">Slug</span>
        <input
          name="slug"
          value={slug}
          onChange={(e) => {
            slugManuallyEdited.current = true;
            setSlug(e.target.value);
            setDirty(true);
          }}
          required
          className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 font-mono text-sm text-navy-950"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-navy-800">Excerpt</span>
        <textarea
          name="excerpt"
          rows={2}
          value={excerpt}
          onChange={(e) => {
            setExcerpt(e.target.value);
            setDirty(true);
          }}
          required
          className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-navy-800">Body (Markdown)</span>
        <textarea
          name="body_markdown"
          rows={14}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setDirty(true);
          }}
          required
          className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 font-mono text-sm text-navy-950"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-navy-800">Tags (comma-separated)</span>
        <input
          name="tags"
          value={tags}
          onChange={(e) => {
            setTags(e.target.value);
            setDirty(true);
          }}
          className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          checked={published}
          onChange={(e) => {
            setPublished(e.target.checked);
            setDirty(true);
          }}
        />
        <span className="font-medium text-navy-800">Published</span>
      </label>

      <button
        type="submit"
        className="mt-2 self-start rounded-full bg-navy-950 px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950"
      >
        {post ? "Save changes" : "Create post"}
      </button>
    </form>
  );
}
