"use client";

import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  disabled,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md border">
          <Image
            src={value}
            alt="Uploaded"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-7 w-7"
            onClick={() => onChange(null)}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <CldUploadWidget
          signatureEndpoint="/api/cloudinary/sign"
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          options={{
            sources: ["local", "url", "camera"],
            multiple: false,
            maxFiles: 1,
            resourceType: "image",
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif"],
            maxFileSize: 5000000, // 5 MB
            cropping: true,
            croppingAspectRatio: 16 / 9,
          }}
          onOpen={() => setUploading(true)}
          onClose={() => setUploading(false)}
          onSuccess={(result: any) => {
            if (result?.info?.secure_url) {
              onChange(result.info.secure_url);
            }
            setUploading(false);
          }}
          onError={() => setUploading(false)}
        >
          {({ open }) => (
            <Button
              type="button"
              variant="outline"
              onClick={() => open()}
              disabled={disabled || uploading}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="mr-2 h-4 w-4" />
              )}
              Upload Image
            </Button>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}