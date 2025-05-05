"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Loader2, X, Upload, ImageIcon, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface UploadedImage {
  file?: File
  preview: string
  url?: string
  isPrimary: boolean
}

interface ImageUploadProps {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  maxImages?: number
  maxSize?: number // en Mo
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 5,
  maxSize = 5, // 5 Mo par défaut
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploadError(null)

      // Vérifier si on a déjà atteint le nombre maximum d'images
      if (images.length + acceptedFiles.length > maxImages) {
        setUploadError(`You cannot add more than ${maxImages} images`)
        return
      }

      // Vérifier la taille des fichiers
      const oversizedFiles = acceptedFiles.filter((file) => file.size > maxSize * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        setUploadError(`Some files exceed the maximum size of ${maxSize} Mo`)
        return
      }

      setIsUploading(true)

      try {
        // Simuler un délai d'upload pour l'UX
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Créer des objets URL pour les aperçus
        const newImages = acceptedFiles.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          isPrimary: images.length === 0 && acceptedFiles.indexOf(file) === 0, // La première image est principale par défaut
        }))

        // Mettre à jour les images
        onChange([...images, ...newImages])
      } catch (error) {
        console.error("Error processing images:", error)
        setUploadError("An error occurred while processing images")
      } finally {
        setIsUploading(false)
      }
    },
    [images, onChange, maxImages, maxSize],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    },
    maxFiles: maxImages - images.length,
    disabled: isUploading || images.length >= maxImages,
  })

  const handleRemoveImage = (index: number) => {
    const newImages = [...images]

    // Si on supprime l'image principale, définir la première image restante comme principale
    const wasMainImage = newImages[index].isPrimary

    // Libérer l'URL de l'aperçu pour éviter les fuites de mémoire
    if (newImages[index].preview && !newImages[index].url) {
      URL.revokeObjectURL(newImages[index].preview)
    }

    newImages.splice(index, 1)

    if (wasMainImage && newImages.length > 0) {
      newImages[0].isPrimary = true
    }

    onChange(newImages)
  }

  const handleSetPrimary = (index: number) => {
    const newImages = images.map((image, i) => ({
      ...image,
      isPrimary: i === index,
    }))
    onChange(newImages)
  }

  // Fonction pour simuler un upload vers un service de stockage
  const simulateUploadToStorage = async (file: File): Promise<string> => {
    // Dans un cas réel, vous utiliseriez un service comme Cloudinary, AWS S3, etc.
    // Pour l'instant, on simule juste un délai et on retourne l'URL de l'aperçu
    await new Promise((resolve) => setTimeout(resolve, 500))
    return URL.createObjectURL(file)
  }

  // Fonction pour préparer les images avant soumission du formulaire
  const prepareImagesForSubmission = async () => {
    // Cette fonction serait appelée avant de soumettre le formulaire
    const preparedImages = await Promise.all(
      images.map(async (image) => {
        if (image.file && !image.url) {
          // Simuler l'upload et obtenir une URL
          const uploadedUrl = await simulateUploadToStorage(image.file)
          return {
            ...image,
            url: uploadedUrl,
          }
        }
        return image
      }),
    )
    return preparedImages
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-rose-500 bg-rose-50" : "border-gray-300 hover:border-rose-500 hover:bg-gray-50",
          (isUploading || images.length >= maxImages) && "opacity-50 cursor-not-allowed",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-rose-500 animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-gray-400" />
          )}
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>Drop your images here...</p>
            ) : isUploading ? (
              <p>Processing images...</p>
            ) : images.length >= maxImages ? (
              <p>Maximum number of images reached ({maxImages})</p>
            ) : (
              <div>
                <p className="font-medium">Drop your images here, or click to select</p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG or WEBP • Max {maxImages} images • {maxSize} Mo max per image
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}

      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">
              Uploaded images ({images.length}/{maxImages})
            </h3>
            {images.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || images.length >= maxImages}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Add more
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "relative group aspect-square rounded-md overflow-hidden border",
                  image.isPrimary && "ring-2 ring-rose-500",
                )}
              >
                <img
                  src={image.preview || image.url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {!image.isPrimary && (
                      <Button
                        type="button"
                        size="icon"
                        variant="default"
                        className="h-8 w-8 rounded-full bg-white text-rose-500 hover:bg-gray-100"
                        onClick={() => handleSetPrimary(index)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {image.isPrimary && (
                  <div className="absolute bottom-0 left-0 right-0 bg-rose-500 text-white text-xs py-1 text-center">
                    Main image
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
