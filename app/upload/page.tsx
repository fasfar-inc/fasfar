"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import type { Session } from "next-auth"
import NewImageUploader from "@/components/new-image-upload"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export default function UploadPage() {
  const { data: session, status } = useSession() as { data: Session & { user: { id: string } } | null, status: string }
  const [uploadType, setUploadType] = useState<'avatar' | 'product'>('avatar')

  // Rediriger si non connecté
  if (status === "unauthenticated") {
    redirect("/api/auth/signin")
  }

  // Afficher un loader pendant le chargement de la session
  if (status === "loading") {
    return <div>Loading...</div>
  }

  // Générer un ID unique pour les produits
  const generateProductId = () => {
    return `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Upload Images</h1>
        <div className="flex gap-2">
          <Button
            variant={uploadType === 'avatar' ? 'default' : 'outline'}
            onClick={() => setUploadType('avatar')}
          >
            Avatar Upload
          </Button>
          <Button
            variant={uploadType === 'product' ? 'default' : 'outline'}
            onClick={() => setUploadType('product')}
          >
            Product Upload
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <NewImageUploader
          type={uploadType}
          userId={session?.user?.id || ''}
          productId={uploadType === 'product' ? generateProductId() : undefined}
        />
      </div>
    </div>
  )
}