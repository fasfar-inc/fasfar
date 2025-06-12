"use client"

import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { FileMetadata, useFileUpload } from "@/hooks/use-file-upload"
import { useDigitalOceanUpload } from "@/hooks/use-digitalocean-upload"
import { Button } from "@/components/ui/button"

interface NewImageUploaderProps {
  type: 'avatar' | 'product'
  userId: string
  productId?: string
  onUploadStart?: () => void
  onUploadComplete?: (urls: string[]) => void
}

// Create some dummy initial files
const initialFiles: FileMetadata[] = []

export default function NewImageUploader({ type, userId, productId, onUploadStart, onUploadComplete }: NewImageUploaderProps) {
  const maxSizeMB = 5
  const maxSize = maxSizeMB * 1024 * 1024 // 5MB default
  const maxFiles = type === 'avatar' ? 1 : 6
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const { uploadToDigitalOcean, isUploading } = useDigitalOceanUpload()

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
    maxSize,
    multiple: type === 'product',
    maxFiles,
    initialFiles,
  })

  const handleUpload = async () => {
    onUploadStart?.()

    const uploadPromises = files.map(async (fileMetadata) => {
      if (fileMetadata.file instanceof File) {
        const result = await uploadToDigitalOcean({
          file: fileMetadata.file,
          type,
          userId,
          productId,
        })
        if (result.success && result.url) {
          return result.url
        }
      }
      return null
    })

    const urls = (await Promise.all(uploadPromises)).filter((url): url is string => url !== null)
    setUploadedUrls(urls)
    onUploadComplete?.(urls)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
        />
        {files.length > 0 ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium">
                Uploaded Files ({files.length})
              </h3>
              {type === 'product' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openFileDialog}
                  disabled={files.length >= maxFiles}
                >
                  <UploadIcon
                    className="-ms-0.5 size-3.5 opacity-60"
                    aria-hidden="true"
                  />
                  Add more
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-accent relative aspect-square rounded-md"
                >
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="size-full rounded-[inherit] object-cover"
                  />
                  <Button
                    onClick={() => removeFile(file.id)}
                    size="icon"
                    className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                    aria-label="Remove image"
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div
              className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <ImageIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">
              {type === 'avatar' ? 'Drop your avatar here' : 'Drop your images here'}
            </p>
            <p className="text-muted-foreground text-xs">
              SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
            </p>
            <Button variant="outline" className="mt-4" onClick={openFileDialog}>
              <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
              Select {type === 'avatar' ? 'avatar' : 'images'}
            </Button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      {files.length > 0 && (
        <Button 
          onClick={handleUpload} 
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : `Upload ${type === 'avatar' ? 'avatar' : 'images'}`}
        </Button>
      )}

      {uploadedUrls.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-medium">Uploaded URLs:</h3>
          <div className="space-y-2">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="text-sm break-all">
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {url}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
