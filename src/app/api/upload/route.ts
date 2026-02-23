import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  uploadToR2,
  generateUploadKey,
  UPLOAD_LIMITS,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/upload";
import { checkRateLimit, uploadRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Auth guard — only admin can upload
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 20 uploads per 15 minutes
  const rl = await checkRateLimit(uploadRateLimit);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string | null) ?? "uploads";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const isPdf = file.type === "application/pdf";
  const isImage = (ALLOWED_IMAGE_TYPES as readonly string[]).includes(
    file.type
  );

  if (!isImage && !isPdf) {
    return NextResponse.json(
      {
        error:
          "File type not allowed. Accepted: JPG, PNG, WebP, GIF, PDF",
      },
      { status: 400 }
    );
  }

  // Validate file size
  const maxSize = isPdf ? UPLOAD_LIMITS.pdf : UPLOAD_LIMITS.image;
  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    return NextResponse.json(
      { error: `File too large. Max size is ${maxMB}MB.` },
      { status: 400 }
    );
  }

  const key = generateUploadKey(file.name, folder);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const url = await uploadToR2(buffer, key, file.type);
    return NextResponse.json({ url, key });
  } catch (err) {
    console.error("R2 upload error:", err);
    return NextResponse.json(
      { error: "Upload failed. Check R2 configuration." },
      { status: 500 }
    );
  }
}
