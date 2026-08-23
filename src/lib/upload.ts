export interface UploadResult {
  url: string;
  secure_url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export interface UploadResponse {
  success: boolean;
  url?: string;
  secure_url?: string;
  publicId?: string;
  results?: UploadResult[];
  error?: string;
}

/**
 * Uploads a single image File to Cloudinary via /api/upload
 */
export async function uploadImage(
  file: File,
  folder: "room-bookings/hotels" | "room-bookings/rooms" | string = "room-bookings/hotels"
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data: UploadResponse = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to upload image");
  }

  return {
    url: data.url || data.secure_url || "",
    secure_url: data.secure_url || data.url || "",
    publicId: data.publicId || "",
  };
}

/**
 * Uploads multiple image files to Cloudinary in a single batch
 */
export async function uploadMultipleImages(
  files: File[],
  folder: "room-bookings/hotels" | "room-bookings/rooms" | string = "room-bookings/hotels"
): Promise<UploadResult[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data: UploadResponse = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to upload images");
  }

  if (data.results && data.results.length > 0) {
    return data.results;
  }

  if (data.url || data.secure_url) {
    return [
      {
        url: data.url || data.secure_url || "",
        secure_url: data.secure_url || data.url || "",
        publicId: data.publicId || "",
      },
    ];
  }

  return [];
}

/**
 * Uploads an image by URL to Cloudinary
 */
export async function uploadImageUrl(
  url: string,
  folder: "room-bookings/hotels" | "room-bookings/rooms" | string = "room-bookings/hotels"
): Promise<UploadResult> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, folder }),
  });

  const data: UploadResponse = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to upload image by URL");
  }

  return {
    url: data.url || data.secure_url || "",
    secure_url: data.secure_url || data.url || "",
    publicId: data.publicId || "",
  };
}

/**
 * Deletes an image from Cloudinary by its publicId
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  const res = await fetch(`/api/upload?publicId=${encodeURIComponent(publicId)}`, {
    method: "DELETE",
  });

  const data = await res.json();
  return res.ok && data.success;
}
