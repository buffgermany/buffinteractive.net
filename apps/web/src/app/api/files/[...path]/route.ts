import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync, existsSync } from "node:fs";
import { getAbsolutePath } from "@/lib/files";
import path from "node:path";

// ============================================================
// Internal Asset Service
//
// GET /api/files/[...path] — serves a file from the local
// storage directory. Supports partial content (range) for
// video seeking or large downloads.
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const localKey = pathSegments.join("/");
  const fullPath = getAbsolutePath(localKey);

  if (!existsSync(fullPath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  const stats = statSync(fullPath);
  const fileSize = stats.size;
  const range = request.headers.get("range");

  // Determine content type based on extension
  const ext = path.extname(fullPath).toLowerCase() || "";
  const contentTypeMap: Record<string, string> = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".zip": "application/zip",
    ".exe": "application/x-msdownload",
    ".dmg": "application/x-apple-diskimage",
  };
  const contentType = contentTypeMap[ext] || "application/octet-stream";

  // Handle Range Requests (important for video streaming)
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0] || "0", 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${fileSize}` },
      });
    }

    const chunksize = end - start + 1;
    const stream = createReadStream(fullPath, { start, end });

    return new NextResponse(stream as any, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize.toString(),
        "Content-Type": contentType,
      },
    });
  }

  // Regular download / direct serve
  const stream = createReadStream(fullPath);
  return new NextResponse(stream as any, {
    status: 200,
    headers: {
      "Content-Length": fileSize.toString(),
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
  });
}
