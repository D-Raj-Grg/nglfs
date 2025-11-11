"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Upload, X, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { uploadAvatar } from "@/lib/stores/profile-store";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUploadComplete?: (url: string) => void;
  className?: string;
}

/**
 * Avatar Upload Component with drag-and-drop support
 * - Supports JPEG, PNG, WebP formats
 * - Max file size: 2MB
 * - Client-side image preview
 * - Drag-and-drop or click to upload
 */
export function AvatarUpload({
  currentAvatarUrl,
  onUploadComplete,
  className,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate file before upload
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid file type. Please upload a JPEG, PNG, or WebP image.",
      };
    }

    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size must be less than 2MB.",
      };
    }

    return { valid: true };
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = async (file: File) => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    try {
      const result = await uploadAvatar(file);

      if (result.success && result.url) {
        toast.success("Avatar uploaded successfully!");
        onUploadComplete?.(result.url);
      } else {
        toast.error(result.error || "Failed to upload avatar");
        setPreview(currentAvatarUrl || null);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
      setPreview(currentAvatarUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle file input change
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  /**
   * Handle drag events
   */
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  /**
   * Trigger file input click
   */
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Remove avatar preview
   */
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Avatar Preview / Upload Area */}
      <div
        className={cn(
          "relative group cursor-pointer",
          "w-32 h-32 rounded-full overflow-hidden",
          "border-2 border-dashed transition-all duration-200",
          isDragging
            ? "border-purple-500 bg-purple-500/10 scale-105"
            : "border-gray-300 dark:border-gray-700 hover:border-purple-500",
          isUploading && "pointer-events-none opacity-70"
        )}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <>
            {/* Avatar Image */}
            <img
              src={preview}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>

            {/* Remove button */}
            {!isUploading && (
              <button
                onClick={handleRemove}
                className={cn(
                  "absolute top-2 right-2 p-1.5 rounded-full",
                  "bg-red-500 text-white opacity-0 group-hover:opacity-100",
                  "transition-opacity hover:bg-red-600"
                )}
                aria-label="Remove avatar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          // Upload placeholder
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
            {isUploading ? (
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            ) : (
              <>
                <User className="w-12 h-12 text-gray-400 mb-2" />
                <Upload className="w-6 h-6 text-gray-400" />
              </>
            )}
          </div>
        )}

        {/* Loading spinner */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Upload instructions */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {preview ? "Click to change avatar" : "Click or drag to upload"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          JPEG, PNG, or WebP (max 2MB)
        </p>
      </div>

      {/* Alternative: Upload button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isUploading}
        className="mt-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            {preview ? "Change Avatar" : "Upload Avatar"}
          </>
        )}
      </Button>
    </div>
  );
}
