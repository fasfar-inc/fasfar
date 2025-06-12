import { useState } from 'react'

interface UploadResponse {
  success: boolean
  url?: string
  error?: string
}

type UploadType = 'avatar' | 'product'

interface UploadParams {
  file: File
  type: UploadType
  userId: string
  productId?: string
}

export function useDigitalOceanUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadToDigitalOcean = async ({ file, type, userId, productId }: UploadParams): Promise<UploadResponse> => {
    try {
      setIsUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('userId', userId)
      if (productId) {
        formData.append('productId', productId)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      return { success: true, url: data.url }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return {
    uploadToDigitalOcean,
    isUploading,
    uploadProgress,
  }
} 