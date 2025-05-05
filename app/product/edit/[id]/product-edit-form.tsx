"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ImageUploadWithPreview, UploadedImage } from "@/components/image-upload-with-preview"
import AddressAutocompleteFree from "@/components/address-autocomplete-free"
import LocationPickerMap from "@/components/location-picker-map"

// Types
interface Product {
  id: string
  title: string
  description: string
  price: number
  categoryId: string
  subcategoryId?: string
  condition: string
  location?: string
  latitude?: number
  longitude?: number
  userId: string
  productImages: {
    id: string
    imageUrl: string
    isPrimary: boolean
  }[]
}

export default function ProductEditForm({ product }: { product: Product }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // États du formulaire
  const [title, setTitle] = useState(product.title)
  const [description, setDescription] = useState(product.description || "")
  const [price, setPrice] = useState(product.price.toString())
  const [category, setCategory] = useState(product.categoryId)
  const [condition, setCondition] = useState(product.condition)
  const [location, setLocation] = useState(product.location || "")
  const [latitude, setLatitude] = useState<number | undefined>(product.latitude)
  const [longitude, setLongitude] = useState<number | undefined>(product.longitude)
  const existingImages = product.productImages.map((img) => ({
    id: img.id,
    preview: img.imageUrl,
    imageUrl: img.imageUrl,
    isPrimary: img.isPrimary,
  }))

  const isOwner = session?.user?.id ? product.userId === session.user.id : false

  // Vérifier l'authentification et les droits d'accès
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (session && product.userId !== session.user.id) {
      toast({
        title: "Access denied",
        description: "You do not have permission to modify this product.",
        variant: "destructive",
      })
      router.push(`/product/${product.id}`)
    }
  }, [session, status, router, product.id, product.userId, toast])

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in to modify a product.",
        variant: "destructive",
      })
      return
    }

    // Validation de base
    if (!title.trim() || !price.trim() || !category || !condition) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      // Préparer les données du produit
      const productData = {
        title,
        description,
        price: Number.parseFloat(price),
        categoryId: category,
        condition,
        location,
        latitude,
        longitude,
      }

      // Mettre à jour le produit
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error updating the product")
      }

      // Gérer les images
      // 1. Supprimer les images qui ont été retirées
      const existingImageIds = product.productImages.map((img) => img.id)
      const currentImageIds = existingImages.map((img) => img.id)

      const deletedImageIds = existingImageIds.filter((id) => !currentImageIds.includes(id))

      if (deletedImageIds.length > 0) {
        await Promise.all(
          deletedImageIds.map((id) =>
            fetch(`/api/products/${product.id}/images/${id}`, {
              method: "DELETE",
            }),
          ),
        )
      }

      // 2. Mettre à jour les images existantes (isPrimary)
      await Promise.all(
        existingImages
          .filter((img) => img.id)
          .map((img) =>
            fetch(`/api/products/${product.id}/images/${img.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ isPrimary: img.isPrimary }),
            }),
          ),
      )

      toast({
        title: "Product updated",
        description: "Your product has been updated successfully.",
      })

      // Rediriger vers la page du produit
      router.push(`/product/${product.id}`)
    } catch (error) {
      console.error("Error updating the product:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred while updating the product.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Gérer les images
  const handleImagesChange = (newImages: UploadedImage[]) => {
    // Implementation of handleImagesChange
  }

  // Gérer la sélection d'adresse
  const handleAddressSelect = (address: string, lat?: number, lng?: number) => {
    setLocation(address)
    setLatitude(lat)
    setLongitude(lng)
  }

  // Gérer la sélection de position sur la carte
  const handleMapPositionChange = (lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
  }

  if (error) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/profile")}>Back to profile</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link
          href={`/product/${product.id}`}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to the product
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Modify your ad</h1>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General information</CardTitle>
                <CardDescription>Modify the main information of your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: iPhone 13 Pro - 256GB - Noir Sidéral"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your product in detail..."
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (€) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Ex: 299.99"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                        <SelectItem value="CLOTHING">Clothing</SelectItem>
                        <SelectItem value="FURNITURE">Furniture</SelectItem>
                        <SelectItem value="BOOKS">Books</SelectItem>
                        <SelectItem value="TOYS">Toys</SelectItem>
                        <SelectItem value="SPORTS">Sports</SelectItem>
                        <SelectItem value="VEHICLES">Vehicles</SelectItem>
                        <SelectItem value="JEWELRY">Jewelry</SelectItem>
                        <SelectItem value="HOME_APPLIANCES">Home appliances</SelectItem>
                        <SelectItem value="BEAUTY">Beauty</SelectItem>
                        <SelectItem value="GARDEN">Garden</SelectItem>
                        <SelectItem value="MUSIC">Music</SelectItem>
                        <SelectItem value="COLLECTIBLES">Collections</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select value={condition} onValueChange={setCondition} required>
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Select the condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="LIKE_NEW">Like new</SelectItem>
                        <SelectItem value="GOOD">Good</SelectItem>
                        <SelectItem value="FAIR">Fair</SelectItem>
                        <SelectItem value="POOR">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product images</CardTitle>
                <CardDescription>
                  Add or modify the images of your product. The first image will be the main image.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploadWithPreview images={existingImages} onChange={handleImagesChange} maxImages={8} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Indicate where your product is located to facilitate exchanges.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Address</Label>
                  <AddressAutocompleteFree
                    value={location}
                    onChange={(address, lat, lng) => {
                      setLocation(address)
                      setLatitude(lat)
                      setLongitude(lng)
                    }}
                    placeholder="Enter an address"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Position on the map</Label>
                  <div className="h-[300px] rounded-md overflow-hidden border">
                    <LocationPickerMap
                      latitude={latitude}
                      longitude={longitude}
                      onLocationChange={(lat, lng) => {
                        setLatitude(lat)
                        setLongitude(lng)
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    You can adjust the position by moving the marker on the map.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end space-x-4 mt-6">
            <Button type="button" variant="outline" onClick={() => router.push(`/product/${product.id}`)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-rose-500 hover:bg-rose-600" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
}
