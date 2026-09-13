import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Resource file storage adapter.
 *
 *  - REAL SUPABASE MODE: files live in the private `resources` bucket.
 *    Uploads/downloads go through the server with the anon key + RLS
 *    (see supabase/migrations/0001_init.sql — bucket policies).
 *  - DEMO MODE: files live under ./demo-uploads (gitignored). This is a
 *    REAL local store — bytes are written, validated, and served back —
 *    not a simulated URL.
 *
 * Both adapters return the same StoredFile shape; callers never branch.
 */

export const RESOURCES_BUCKET = "resources";
export const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  txt: "text/plain",
  mp4: "video/mp4",
  mp3: "audio/mpeg",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

export const ACCEPTED_EXTENSIONS = Object.keys(MIME_BY_EXT);

export function mimeForName(name: string): string | undefined {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXT[ext];
}

const DEMO_DIR = join(process.cwd(), "demo-uploads");

function demoPathFor(originalName: string): string {
  // Flat namespace with a uuid prefix — no user-controlled directories.
  return `${randomUUID()}-${basename(originalName).replace(/[^a-zA-Z0-9._-]/g, "_")}`;
}

/** Resolves a stored key to an absolute path, refusing anything outside the demo dir. */
function safeDemoPath(key: string): string | null {
  const full = resolve(join(DEMO_DIR, key));
  if (!full.startsWith(resolve(DEMO_DIR))) return null;
  return full;
}

export interface StoredFile {
  path: string;
  name: string;
  bytes: number;
  mime: string;
}

export async function saveFile(
  buffer: Buffer,
  originalName: string,
  mime: string
): Promise<StoredFile> {
  if (isSupabaseConfigured()) {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const path = `${user.id}/${randomUUID()}-${basename(originalName).replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage
      .from(RESOURCES_BUCKET)
      .upload(path, buffer, { contentType: mime, upsert: false });
    if (error) throw new Error(error.message);

    return { path, name: basename(originalName), bytes: buffer.byteLength, mime };
  }

  // Demo mode: real disk write.
  const key = demoPathFor(originalName);
  if (!existsSync(DEMO_DIR)) mkdirSync(DEMO_DIR, { recursive: true });
  writeFileSync(join(DEMO_DIR, key), buffer);
  return { path: key, name: basename(originalName), bytes: buffer.byteLength, mime };
}

export interface ReadFileResult {
  buffer: Buffer;
  mime: string;
  name: string;
}

export async function readFile(key: string): Promise<ReadFileResult | null> {
  if (isSupabaseConfigured()) {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.storage.from(RESOURCES_BUCKET).download(key);
    if (error || !data) return null;
    const buffer = Buffer.from(await data.arrayBuffer());
    return { buffer, mime: mimeForName(key) ?? "application/octet-stream", name: basename(key) };
  }

  const full = safeDemoPath(key);
  if (!full || !existsSync(full)) return null;
  return {
    buffer: readFileSync(full),
    mime: mimeForName(key) ?? "application/octet-stream",
    name: basename(key),
  };
}

export async function deleteFile(key: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    await supabase.storage.from(RESOURCES_BUCKET).remove([key]);
    return;
  }
  const full = safeDemoPath(key);
  if (full && existsSync(full)) unlinkSync(full);
}

/** Content fingerprint for upload integrity checks / dedupe. */
export function checksum(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 16);
}
