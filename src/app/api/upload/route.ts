import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { syncUserInDb, requireRole } from "@/lib/authorization";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Helper to upload buffer via Cloudinary stream
 */
async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string = "room-bookings/hotels"
): Promise<UploadApiResponse> {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * POST /api/upload
 * Handles single/multiple image uploads from File, FormData, or URL
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authorization: User must be signed in as OWNER or ADMIN (or authenticated user)
    const access = await requireRole("OWNER", "ADMIN", "GUEST");
    if (access.status) {
      return NextResponse.json(
        { error: access.status === 401 ? "Authentication required" : "Unauthorized access" },
        { status: access.status }
      );
    }

    // 2. Validate Cloudinary Credentials
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary configuration environment variables are missing" },
        { status: 500 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    // ----------------------------------------------------
    // CASE A: JSON Body (Image URL or URLs)
    // ----------------------------------------------------
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      const folder = (body.folder && typeof body.folder === "string") ? body.folder.trim() : "room-bookings/hotels";

      // Multiple URLs
      if (Array.isArray(body.urls) && body.urls.length > 0) {
        const uploadPromises = body.urls.map(async (url: string) => {
          if (typeof url !== "string" || !url.trim()) return null;
          const res = await cloudinary.uploader.upload(url.trim(), {
            folder,
            resource_type: "image",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          });
          return {
            url: res.secure_url,
            secure_url: res.secure_url,
            publicId: res.public_id,
            width: res.width,
            height: res.height,
            format: res.format,
            bytes: res.bytes,
          };
        });

        const results = (await Promise.all(uploadPromises)).filter(Boolean);
        return NextResponse.json({ success: true, results });
      }

      // Single URL
      const imageUrl = body.url;
      if (!imageUrl || typeof imageUrl !== "string") {
        return NextResponse.json({ error: "No valid image URL provided" }, { status: 400 });
      }

      const result = await cloudinary.uploader.upload(imageUrl.trim(), {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        secure_url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      });
    }

    // ----------------------------------------------------
    // CASE B: FormData (File, Files, or URL)
    // ----------------------------------------------------
    const formData = await req.formData();
    const folder = (formData.get("folder") as string) || "room-bookings/hotels";
    const urlParam = formData.get("url");

    // Single URL in FormData
    if (typeof urlParam === "string" && urlParam.trim()) {
      const result = await cloudinary.uploader.upload(urlParam.trim(), {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        secure_url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      });
    }

    // Check for multiple files ("files")
    const allFiles = formData.getAll("files");
    const singleFile = formData.get("file");

    const filesToUpload: File[] = [];
    if (allFiles && allFiles.length > 0) {
      for (const item of allFiles) {
        if (item instanceof File && item.size > 0) {
          filesToUpload.push(item);
        }
      }
    } else if (singleFile instanceof File && singleFile.size > 0) {
      filesToUpload.push(singleFile);
    }

    if (filesToUpload.length === 0) {
      return NextResponse.json(
        { error: "No image file or URL was provided in request" },
        { status: 400 }
      );
    }

    // Validate file types & size
    for (const f of filesToUpload) {
      if (!ALLOWED_TYPES.has(f.type)) {
        return NextResponse.json(
          { error: `File "${f.name}" has unsupported format (${f.type}). Only JPG, PNG, WEBP, GIF, and AVIF allowed.` },
          { status: 400 }
        );
      }
      if (f.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${f.name}" exceeds maximum allowed size (10MB).` },
          { status: 400 }
        );
      }
    }

    // If single file upload
    if (filesToUpload.length === 1) {
      const file = filesToUpload[0];
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadBufferToCloudinary(buffer, folder);

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        secure_url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      });
    }

    // If multiple files upload
    const uploadPromises = filesToUpload.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const res = await uploadBufferToCloudinary(buffer, folder);
      return {
        url: res.secure_url,
        secure_url: res.secure_url,
        publicId: res.public_id,
        width: res.width,
        height: res.height,
        format: res.format,
        bytes: res.bytes,
      };
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Cloudinary upload API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload processing failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * Allows deleting an uploaded image by publicId
 */
export async function DELETE(req: NextRequest) {
  try {
    const access = await requireRole("OWNER", "ADMIN", "GUEST");
    if (access.status) {
      return NextResponse.json(
        { error: access.status === 401 ? "Authentication required" : "Unauthorized access" },
        { status: access.status }
      );
    }

    const { searchParams } = new URL(req.url);
    let publicId = searchParams.get("publicId");

    if (!publicId) {
      const body = await req.json().catch(() => ({}));
      publicId = body.publicId;
    }

    if (!publicId || typeof publicId !== "string") {
      return NextResponse.json({ error: "Missing publicId parameter" }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId.trim());

    return NextResponse.json({
      success: true,
      result: result.result, // e.g. "ok" or "not found"
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image deletion failed" },
      { status: 500 }
    );
  }
}
