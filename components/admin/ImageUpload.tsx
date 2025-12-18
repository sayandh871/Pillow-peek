"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ 
  value, 
  onChange, 
  onRemove,
  disabled 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  // In a real scenario with UploadThing, you'd use their hooks.
  // This is a robust mock that simulates the UX of uploading.
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    
    // Simulating upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In real life, you'd upload to S3/UploadThing here
    // const results = await uploadFiles(acceptedFiles);
    // const newUrls = results.map(r => r.url);
    
    const newUrls = acceptedFiles.map(file => URL.createObjectURL(file));
    onChange([...value, ...newUrls]);
    
    setIsUploading(false);
  }, [value, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.svg']
    },
    disabled: disabled || isUploading,
    multiple: true
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {value.map((url) => (
          <div 
            key={url} 
            className="group relative aspect-square overflow-hidden rounded-xl border border-light-300 bg-light-100"
          >
            <img
              src={url}
              alt="Upload preview"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <button
              type="button"
              onClick={() => onRemove(url)}
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        <div
          {...getRootProps()}
          className={cn(
            "flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-light-300 bg-light-100 transition-colors hover:bg-light-200",
            isDragActive && "border-dark-900 bg-light-200",
            (disabled || isUploading) && "cursor-not-allowed opacity-50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-dark-500" />
            ) : (
              <Upload className="mb-3 h-8 w-8 text-dark-500" />
            )}
            <p className="mb-2 text-caption text-dark-700 font-medium">
              {isDragActive ? "Drop here" : "Upload Images"}
            </p>
            <p className="text-footnote text-dark-500">
              Drag & drop or click
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
