import fs from "node:fs/promises";
import path from "node:path";
import { createReadStream, existsSync } from "node:fs";

// ============================================================
// Internal File Storage Utility
//
// Manages local disk storage for assets (videos, installers).
// Storage is located in the root `/storage` directory.
// ============================================================

const STORAGE_PATH = process.env["STORAGE_PATH"] ?? path.join(process.cwd(), "../../storage");

/**
 * Ensure the base storage directories exist
 */
export async function ensureStorage() {
  const dirs = [
    STORAGE_PATH,
    path.join(STORAGE_PATH, "products"),
    path.join(STORAGE_PATH, "images"),
  ];

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

/**
 * Get the full absolute path for a local key
 */
export function getAbsolutePath(localKey: string): string {
  // Prevent directory traversal attacks
  const sanitized = localKey.replace(/\.\./g, "");
  return path.join(STORAGE_PATH, sanitized);
}

/**
 * Save a physical file to disk
 */
export async function saveFile(localKey: string, data: Buffer | ArrayBuffer | string) {
  await ensureStorage();
  const fullPath = getAbsolutePath(localKey);
  const dir = path.dirname(fullPath);

  if (!existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }

  await fs.writeFile(fullPath, Buffer.from(data as string));
  return localKey;
}

/**
 * Delete a file from disk
 */
export async function deleteFile(localKey: string) {
  const fullPath = getAbsolutePath(localKey);
  if (existsSync(fullPath)) {
    await fs.unlink(fullPath);
  }
}

/**
 * Generate a "local URL" — used internally for Next.js image components
 * or as a download link.
 */
export function getAssetUrl(localKey: string): string {
  return `/api/files/${localKey}`;
}
