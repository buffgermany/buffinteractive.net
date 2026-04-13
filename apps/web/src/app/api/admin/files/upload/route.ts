import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { saveFile } from "@/lib/files";
import { createId } from "@paralleldrive/cuid2";
import path from "node:path";

// ============================================================
// Admin Asset Upload Service
//
// POST /api/admin/files/upload
// Accepts multipart/form-data with `file` and `type` (image|asset).
// Protected by admin role check.
// ============================================================

export const config = {
  api: {
    bodyParser: false, // Disabling body parser to handle large multi-part uploads
  },
};

export async function POST(request: NextRequest) {
  // 1. Auth Guard
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as "image" | "product" | "human"; // Target category

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const id = createId();
    const extension = path.extname(file.name);
    const filename = `${id}${extension}`;
    
    // Determine path based on type
    let localKey = "";
    if (type === "image") {
      localKey = `images/${filename}`;
    } else {
      localKey = `products/${filename}`;
    }

    await saveFile(localKey, buffer);

    return NextResponse.json({
      success: true,
      localKey,
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    });
  } catch (error) {
    console.error("[upload] Failed to process upload:", error);
    return new NextResponse("Upload failed", { status: 500 });
  }
}
