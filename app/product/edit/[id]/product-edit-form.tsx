"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, ArrowRight, Loader2, Save, Camera, MapPin, AlertCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUploadWithPreview, UploadedImage } from "@/components/image-upload-with-preview"
import AddressAutocompleteFree from "@/components/address-autocomplete-free"
import LocationPickerMap from "@/components/location-picker-map"
import FormSteps from "@/components/form-steps"

const STEPS = ["Informations", "Photos", "Localisation", "Finalisation"]

const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes highlightPulse {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(244, 114, 182, 0.1);
  }
  100% {
    background-color: transparent;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-highlight {
  animation: highlightPulse 2s ease-in-out 2;
  border-radius: 4px;
  padding: 2px 4px;
}
`

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style")
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

// Types
export interface Product {
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

  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<{ id: string, slug: string, name: string }[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [addressIsValid, setAddressIsValid] = useState(true)

  // États du formulaire
  const [formData, setFormData] = useState({
    title: product.title,
    description: product.description || "",
    price: product.price.toString(),
    category: product.categoryId,
    condition: product.condition,
    location: product.location || "Nicosia, Cyprus",
    latitude: product.latitude ?? 35.1856,
    longitude: product.longitude ?? 33.3823,
  })

  const [images, setImages] = useState<UploadedImage[]>(
    product.productImages.map((img) => ({
      id: img.id,
      preview: img.imageUrl,
      imageUrl: img.imageUrl,
      isPrimary: img.isPrimary,
    }))
  )

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      setIsLoadingCategories(true)
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()
        const cats = data.map((cat: any) => ({
          id: cat.id,
          slug: cat.slug,
          name: cat.name
        }))
        setCategories(cats || [])
      } catch (e) {
        console.error("Error fetching categories:", e)
        setCategories([])
      } finally {
        setIsLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddressChange = async (address: string) => {
    let lat = 35.1856
    let lng = 33.3823
    let cityCountry = "Nicosia, Cyprus"

    if (address) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
        const data = await res.json()
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat)
          lng = parseFloat(data[0].lon)
          cityCountry = address
        }
      } catch (e) {
        // fallback to default
      }
    }

    setFormData((prev) => ({
      ...prev,
      location: cityCountry,
      latitude: lat,
      longitude: lng,
    }))
    setAddressIsValid(true)
  }

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    let cityCountry = "Nicosia, Cyprus"
    if (address) {
      const parts = address.split(",").map(s => s.trim())
      cityCountry = `${parts[parts.length - 4] || "Nicosia"}, ${parts[parts.length - 1] || "Cyprus"}`
    }
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: cityCountry,
    }))
    setAddressIsValid(true)
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 0) {
      if (!formData.title.trim()) newErrors.title = "The title is required"
      if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
        newErrors.price = "Please enter a valid price"
      }
      if (!formData.category) {
        newErrors.category = "The category is required"
      }
      if (!formData.condition) newErrors.condition = "The product condition is required"
    } else if (currentStep === 1) {
      if (images.length === 0) newErrors.images = "Add at least one image"
    } else if (currentStep === 2) {
      if (!formData.location) {
        newErrors.location = "The location is required"
      } else if (!addressIsValid) {
        newErrors.location = "Please select a valid address from the list or use your current location"
      }
    }

    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep()) return

    try {
      setSaving(true)

      const productData = {
        title: formData.title,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        categoryId: formData.category,
        condition: formData.condition,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
      }

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

      // Handle images
      const existingImageIds = product.productImages.map((img) => img.id)
      const currentImageIds = images.map((img) => img.id)

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

      await Promise.all(
        images
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

      router.push(`/product/${product.id}`)
    } catch (error) {
      console.error("Error updating the product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while updating the product.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
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
      <div className="flex items-center gap-2">
        <Link href={`/product/${product.id}`} className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to the product
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-left">Modify your ad</h1>
        <p className="text-muted-foreground mb-6 text-left">Update your product information to make it more attractive</p>
      </div>

      <FormSteps steps={STEPS} currentStep={currentStep} onStepClick={(step) => setCurrentStep(step)} />

      <Card className="mt-6 max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{STEPS[currentStep]}</CardTitle>
          <CardDescription>
            {currentStep === 0 && "Fill in the basic information about your product"}
            {currentStep === 1 && "Add attractive photos of your product"}
            {currentStep === 2 && "Indicate where your product is located"}
            {currentStep === 3 && "Check the details before publishing your ad"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Information */}
            <div className={currentStep === 0 ? "block" : "hidden"}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">
                    Ad title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: iPhone 13 Pro Max 256GB Graphite"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your product, its condition, its features..."
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">
                      Price (€) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Ex: 499.99"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingCategories ? (
                          <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                        ) : categories.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">No categories available</div>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.slug}>
                              {cat.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="condition">
                      Condition <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => handleSelectChange("condition", value)}
                    >
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
              </div>
            </div>

            {/* Step 2: Photos */}
            <div className={currentStep === 1 ? "block" : "hidden"}>
              <div className="space-y-2">
                <Label htmlFor="images">Product images</Label>
                <ImageUploadWithPreview images={images} onChange={setImages} maxImages={5} />
              </div>
            </div>

            {/* Step 3: Location */}
            <div className={currentStep === 2 ? "block" : "hidden"}>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-rose-500" />
                    <span>Your current city is selected</span>
                    <span className="text-xs px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full">Default</span>
                  </div>
                  
                  <div className="relative group">
                    <AddressAutocompleteFree
                      value={formData.location}
                      onChange={handleAddressChange}
                      placeholder="Or search for a specific location..."
                      required
                      onValidationChange={setAddressIsValid}
                    />
                  </div>
                </div>

                {typeof formData.latitude === 'number' && typeof formData.longitude === 'number' ? (
                  <div className="w-full mt-2 animate-fadeIn">
                    <LocationPickerMap
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      address={formData.location}
                      onLocationChange={handleLocationChange}
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center animate-highlight">
                      Click anywhere on the map to set a precise location
                    </p>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-md p-8 text-center animate-pulse">
                    <div className="flex justify-center">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Loading your location...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Summary */}
            <div className={currentStep === 3 ? "block" : "hidden"}>
              <div className="space-y-8">
                {/* Main Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Images */}
                    <div className="w-full md:w-1/3">
                      {images.length > 0 ? (
                        <div className="aspect-square rounded-lg overflow-hidden border relative">
                          {images.find((img) => img.isPrimary) ? (
                            <img
                              src={images.find((img) => img.isPrimary)?.preview || images[0].preview}
                              alt="Main image"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={images[0].preview || "/placeholder.svg"}
                              alt="Main image"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded-full px-2 py-1 text-xs">
                            {images.length} photo{images.length > 1 ? "s" : ""}
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-square rounded-lg border flex items-center justify-center bg-gray-100">
                          <Camera className="h-12 w-12 text-gray-300" />
                        </div>
                      )}

                      {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {images.slice(0, 4).map((image, index) => (
                            <div key={index} className="aspect-square rounded-md overflow-hidden border">
                              <img
                                src={image.preview || "/placeholder.svg"}
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{formData.title || "Title not defined"}</h3>
                      <p className="text-2xl font-bold text-rose-500 mt-2">
                        {formData.price ? `${Number(formData.price).toLocaleString()} €` : "Price not defined"}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Category</h4>
                          <p className="mt-1">
                            {formData.category
                              ? categories.find(cat => cat.slug === formData.category)?.name || "Not defined"
                              : "Not defined"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Condition</h4>
                          <p className="mt-1">
                            {formData.condition
                              ? {
                                  NEW: "New",
                                  LIKE_NEW: "Like new",
                                  GOOD: "Good",
                                  FAIR: "Fair",
                                  POOR: "Poor",
                                }[formData.condition]
                              : "Not defined"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-500">Description</h4>
                        <p className="mt-1 text-sm whitespace-pre-wrap">
                          {formData.description || "No description provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-rose-500" />
                    Location
                  </h3>

                  <div className="flex items-start mb-3">
                    <p className="text-sm">{formData.location || "Address not specified"}</p>
                  </div>

                  {typeof formData.latitude === 'number' && typeof formData.longitude === 'number' ? (
                    <div className="w-full mt-2 animate-fadeIn">
                      <LocationPickerMap
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                        address={formData.location}
                        onLocationChange={handleLocationChange}
                      />    
                      <p className="text-xs text-muted-foreground mt-2 text-center animate-highlight">
                        Click anywhere on the map to set a precise location
                      </p>
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-md p-8 text-center">
                      <div className="flex justify-center">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Enter an address to display the map
                      </p>
                    </div>
                  )}
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Confirmation */}
                <div className="border-t pt-6">
                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      className="bg-rose-500 hover:bg-rose-600 flex items-center gap-2 px-8 py-6 text-lg"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          Save changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className="bg-rose-500 hover:bg-rose-600 flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  )
}
