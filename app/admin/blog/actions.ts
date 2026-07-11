"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function saveBlogPost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const bodyMarkdown = String(formData.get("body_markdown") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? ""));
  const published = formData.get("published") === "on";

  if (!title || !slug || !excerpt || !bodyMarkdown) {
    throw new Error("Title, slug, excerpt, and body are required");
  }

  const supabase = await createClient();

  if (id) {
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("published")
      .eq("id", id)
      .maybeSingle();

    const nowPublishing = published && !existing?.published;

    const { error } = await supabase
      .from("blog_posts")
      .update({
        title,
        slug,
        excerpt,
        body_markdown: bodyMarkdown,
        tags,
        published,
        published_at: nowPublishing ? new Date().toISOString() : undefined,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor: "admin",
      action: nowPublishing ? "blog.published" : "blog.updated",
      object_type: "blog_posts",
      object_id: id,
      payload: { after: { title, slug, published } },
    });
  } else {
    const { data: created, error } = await supabase
      .from("blog_posts")
      .insert({
        title,
        slug,
        excerpt,
        body_markdown: bodyMarkdown,
        tags,
        published,
        published_at: published ? new Date().toISOString() : null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor: "admin",
      action: "blog.created",
      object_type: "blog_posts",
      object_id: created.id,
      payload: { after: { title, slug, published } },
    });
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function deleteBlogPost(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.from("audit_logs").insert({
    actor: "admin",
    action: "blog.deleted",
    object_type: "blog_posts",
    object_id: id,
    payload: null,
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}
