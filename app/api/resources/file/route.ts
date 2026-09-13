import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { deleteFile, readFile } from "@/lib/storage/adapter";

/**
 * Authenticated resource download. Serves the stored bytes of a trainer
 * resource to signed-in users (content is training material, so any
 * active account may read it; write access is trainer/admin only and
 * storage paths are server-generated, not user-controlled).
 */
export async function GET(request: Request) {
  const user = await getSession();
  if (!user || user.status !== "active") {
    return NextResponse.json({ error: "Sign in to access resources." }, { status: 401 });
  }

  const path = new URL(request.url).searchParams.get("path");
  if (!path || path.includes("..") || path.startsWith("/")) {
    return NextResponse.json({ error: "Invalid resource path." }, { status: 400 });
  }

  const file = await readFile(path);
  if (!file) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(file.buffer.byteLength),
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.name)}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/** Removes the stored bytes of a resource (trainer/admin only). */
export async function DELETE(request: Request) {
  const user = await getSession();
  if (!user || user.status !== "active" || (user.role !== "trainer" && user.role !== "admin")) {
    return NextResponse.json({ error: "Only trainers can delete resources." }, { status: 403 });
  }

  const path = new URL(request.url).searchParams.get("path");
  if (!path || path.includes("..") || path.startsWith("/")) {
    return NextResponse.json({ error: "Invalid resource path." }, { status: 400 });
  }

  await deleteFile(path);
  return NextResponse.json({ ok: true });
}
