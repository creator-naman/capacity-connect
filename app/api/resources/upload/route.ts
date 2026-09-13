import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_BYTES,
  mimeForName,
  saveFile,
} from "@/lib/storage/adapter";

/**
 * Trainer resource upload. Multipart POST from the Library UI.
 *
 * Validation: authenticated trainer/admin session, extension allow-list,
 * declared MIME consistency, hard 25 MB cap. Rejects everything else with
 * a specific, user-presentable message.
 */
export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in to upload resources." }, { status: 401 });
  }
  if (user.status !== "active" || (user.role !== "trainer" && user.role !== "admin")) {
    return NextResponse.json({ error: "Only trainers can upload resources." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Malformed upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File is too large — the limit is 25 MB." },
      { status: 413 }
    );
  }

  const name = file.name || "resource";
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      {
        error: `Unsupported file type ".${ext}". Allowed: ${ACCEPTED_EXTENSIONS.join(", ")}.`,
      },
      { status: 415 }
    );
  }

  const expectedMime = mimeForName(name);
  if (file.type && expectedMime && file.type !== expectedMime && file.type !== "application/octet-stream") {
    return NextResponse.json(
      { error: "The file's contents do not match its extension." },
      { status: 415 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength !== file.size) {
    return NextResponse.json({ error: "Upload was truncated — try again." }, { status: 400 });
  }

  try {
    const stored = await saveFile(buffer, name, expectedMime ?? "application/octet-stream");
    return NextResponse.json({ file: stored });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
