"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Upload, Star, StarOff } from "lucide-react"

export interface UploadedImage {
  file?: File
  preview: string
  isPrimary: boolean
  imageUrl?: string
}

interface ImageUploadWithPreviewProps {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  maxImages?: number
}

export function ImageUploadWithPreview({ images, onChange, maxImages = 5 }: ImageUploadWithPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files))
    }
  }

  const addFiles = (files: File[]) => {
    // Filtrer pour n'accepter que les images
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    // Limiter le nombre d'images
    const availableSlots = maxImages - images.length
    const filesToAdd = imageFiles.slice(0, availableSlots)

    if (filesToAdd.length === 0) return

    // Créer des objets UploadedImage pour chaque fichier
    const newImages = filesToAdd.map((file) => {
      return {
        file,
        preview: URL.createObjectURL(file),
        isPrimary: images.length === 0 && filesToAdd.indexOf(file) === 0, // Premier fichier est principal si aucune image n'existe
      }
    })

    // Mettre à jour l'état
    onChange([...images, ...newImages])

    // Réinitialiser l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files))
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]

    // Si l'image supprimée était principale, définir la première image restante comme principale
    const wasMainImage = newImages[index].isPrimary

    // Libérer l'URL de l'objet pour éviter les fuites de mémoire
    if (newImages[index].preview.startsWith("blob:")) {
      URL.revokeObjectURL(newImages[index].preview)
    }

    newImages.splice(index, 1)

    if (wasMainImage && newImages.length > 0) {
      newImages[0].isPrimary = true
    }

    onChange(newImages)
  }

  const setMainImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }))

    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive ? "border-rose-500 bg-rose-50" : "border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <Upload className="h-10 w-10 text-gray-400" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Déposez vos images ici</h3>
            <p className="text-sm text-gray-500">Formats acceptés: JPG, PNG, GIF (max {maxImages} images)</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= maxImages}
          >
            Sélectionner des fichiers
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={images.length >= maxImages}
          />
        </div>
      </div>

      {images.length > 0 && (
        <div>
          <Label className="block mb-2">
            Images téléchargées ({images.length}/{maxImages})
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div
                  className={`aspect-square rounded-md overflow-hidden border-2 ${
                    image.isPrimary ? "border-rose-500" : "border-gray-200"
                  }`}
                >
                  <img
                    src={image.preview || "/placeholder.svg"}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-white rounded-full p-1 shadow hover:bg-gray-100 transition-colors"
                    title="Supprimer l'image"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMainImage(index)}
                    className="bg-white rounded-full p-1 shadow hover:bg-gray-100 transition-colors"
                    title={image.isPrimary ? "Image principale" : "Définir comme image principale"}
                    disabled={image.isPrimary}
                  >
                    {image.isPrimary ? (
                      <Star className="h-4 w-4 text-rose-500" />
                    ) : (
                      <StarOff className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                </div>

                {image.isPrimary && (
                  <div className="absolute bottom-0 left-0 right-0 bg-rose-500 text-white text-xs py-1 text-center">
                    Image principale
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
