"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
  Plus,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { uploadMultipleImages } from "@/lib/upload";

interface ImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  folder?: "room-bookings/hotels" | "room-bookings/rooms" | string;
  maxFiles?: number;
  label?: string;
  description?: string;
}

const SAMPLE_LUXURY_PHOTOS = [
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
];

export default function ImageUpload({
  value = [],
  onChange,
  folder = "room-bookings/hotels",
  maxFiles = 8,
  label = "Property & Room Photos",
  description = "Upload high-resolution images or paste direct image URLs (Unsplash, CDN, Web links).",
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(value);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlTextarea, setUrlTextarea] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state if value prop changes
  React.useEffect(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(images)) {
      setImages(value);
    }
  }, [value]);

  const updateImages = (newImagesList: string[]) => {
    setImages(newImagesList);
    if (onChange) onChange(newImagesList);
  };

  // 1. Handle File Uploads
  const handleFiles = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    const filesArray = Array.from(filesList);
    const remainingSlots = maxFiles - images.length;

    if (remainingSlots <= 0) {
      setErrorMessage(`You have reached the maximum limit of ${maxFiles} photos.`);
      return;
    }

    const filesToUpload = filesArray.slice(0, remainingSlots);

    try {
      setIsUploading(true);
      const results = await uploadMultipleImages(filesToUpload, folder);
      const newUrls = results.map((r) => r.secure_url || r.url).filter(Boolean);

      const updated = [...images, ...newUrls];
      updateImages(updated);
      setSuccessMessage(`Successfully uploaded ${newUrls.length} photo${newUrls.length > 1 ? "s" : ""}!`);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setErrorMessage(err.message || "Failed to upload images. You can also paste direct image URLs below.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 2. Handle Textarea / URL Links
  const handleAddUrlsFromTextarea = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!urlTextarea.trim()) {
      setErrorMessage("Please paste at least one valid image URL.");
      return;
    }

    // Split by newlines, commas, or spaces
    const extractedUrls = urlTextarea
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("/")));

    if (extractedUrls.length === 0) {
      setErrorMessage("No valid URLs found. Make sure URLs start with http:// or https://");
      return;
    }

    const remainingSlots = maxFiles - images.length;
    if (remainingSlots <= 0) {
      setErrorMessage(`You have reached the maximum limit of ${maxFiles} photos.`);
      return;
    }

    const urlsToAdd = extractedUrls.slice(0, remainingSlots);
    const updated = [...images, ...urlsToAdd];
    updateImages(updated);
    setUrlTextarea("");
    setSuccessMessage(`Added ${urlsToAdd.length} image link${urlsToAdd.length > 1 ? "s" : ""} to your gallery!`);
  };

  // 3. Add Sample Photos Preset
  const handleAddSamplePhotos = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const remainingSlots = maxFiles - images.length;
    if (remainingSlots <= 0) {
      setErrorMessage(`Limit reached (${maxFiles} photos). Remove some photos first.`);
      return;
    }

    const toAdd = SAMPLE_LUXURY_PHOTOS.slice(0, remainingSlots);
    const updated = [...images, ...toAdd];
    updateImages(updated);
    setSuccessMessage(`Added ${toAdd.length} sample photos.`);
  };

  // 4. Remove Photo
  const handleRemove = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    updateImages(updated);
    setSuccessMessage(null);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Header & Photo Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-indigo-400" />
            <span>{label}</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-500/20">
            {images.length}/{maxFiles} Photos Added
          </span>
        </div>
      </div>

      {/* Upload Mode Selector (Tabs) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 w-fit">
        <button
          type="button"
          onClick={() => setUploadMode("file")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            uploadMode === "file"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UploadCloud className="h-3.5 w-3.5" />
          <span>Upload Image Files</span>
        </button>

        <button
          type="button"
          onClick={() => setUploadMode("url")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            uploadMode === "url"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <LinkIcon className="h-3.5 w-3.5" />
          <span>Paste Image Links (URL)</span>
        </button>
      </div>

      {/* MODE 1: FILE UPLOAD (DRAG & DROP) */}
      {uploadMode === "file" && images.length < maxFiles && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
            isDragOver
              ? "border-indigo-500 bg-indigo-950/20 scale-[1.01]"
              : "border-slate-800 bg-slate-900/50 hover:border-indigo-500/50 hover:bg-slate-900/80"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-600/10">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </div>

          <div>
            <div className="text-xs sm:text-sm font-bold text-white">
              {isUploading ? (
                "Uploading high-res photos..."
              ) : (
                <>
                  <span className="text-indigo-400 underline">Click to upload</span> or drag and drop
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports JPG, PNG, WEBP, AVIF (Max 10MB per image)
            </p>
          </div>
        </div>
      )}

      {/* MODE 2: IMAGE LINK UPLOAD TEXTAREA */}
      {uploadMode === "url" && images.length < maxFiles && (
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 animate-in fade-in">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5 text-indigo-400" />
              <span>Paste Image Link(s) Textarea</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2.5">
              Paste one or multiple high-res image URLs (Unsplash, Pexels, Imgur, Cloudinary, AWS S3, etc.). Separate multiple links by new lines or commas.
            </p>
            <textarea
              rows={4}
              value={urlTextarea}
              onChange={(e) => setUrlTextarea(e.target.value)}
              placeholder="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b
https://images.unsplash.com/photo-1540555700478-4be289fbecef
https://images.unsplash.com/photo-1618773928121-c32242e63f39"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleAddUrlsFromTextarea}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span>Add Image Links</span>
            </button>

            <button
              type="button"
              onClick={handleAddSamplePhotos}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Load Sample Photos</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-300 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Uploaded Photos Gallery Previews */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold text-slate-300">
            Selected Photos ({images.length}) — First photo is the primary cover:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md transition-all hover:border-indigo-500/40"
              >
                <img src={url} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    title="Remove Photo"
                    className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-lg transition-transform hover:scale-110"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {idx === 0 ? (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-indigo-600/90 backdrop-blur-md text-[9px] font-bold text-white shadow">
                    Cover Photo
                  </div>
                ) : (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[9px] font-bold text-slate-300 border border-white/10">
                    Photo #{idx + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
