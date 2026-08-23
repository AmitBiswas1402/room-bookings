"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadMultipleImages, uploadImage, deleteImage, UploadResult } from "@/lib/upload";

interface ImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  folder?: "room-bookings/hotels" | "room-bookings/rooms" | string;
  maxFiles?: number;
  label?: string;
  description?: string;
}

export default function ImageUpload({
  value = [],
  onChange,
  folder = "room-bookings/hotels",
  maxFiles = 5,
  label = "Hotel & Room Photos",
  description = "Upload high-resolution images (JPG, PNG, WEBP up to 10MB each)",
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(value);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setErrorMessage(null);

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
      setImages(updated);
      if (onChange) onChange(updated);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setErrorMessage(err.message || "Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    setImages(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-indigo-400" />
            <span>{label}</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {images.length}/{maxFiles} Photos
        </span>
      </div>

      {/* Drag & Drop Upload Zone */}
      {images.length < maxFiles && (
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
              : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80"
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
                "Uploading to Cloudinary..."
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

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Uploaded Photos Gallery Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md"
            >
              <img src={url} alt={`Uploaded ${idx + 1}`} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-lg transition-transform hover:scale-110"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {idx === 0 && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[9px] font-bold text-white border border-white/10">
                  Cover Photo
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
