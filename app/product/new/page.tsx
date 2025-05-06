"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, ArrowRight, Save, Camera, MapPin, AlertCircle } from "lucide-react"
import AddressAutocompleteFree from "@/components/address-autocomplete-free"
import { ImageUploadWithPreview, type UploadedImage } from "@/components/image-upload-with-preview"
import LocationPickerMap from "@/components/dynamic-location-picker-map"
import FormSteps from "@/components/form-steps"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { uploadImage } from "@/lib/image-upload-service"
import { toast } from "@/components/ui/use-toast"

const STEPS = ["Informations", "Photos", "Localisation", "Finalisation"]

export default function NewProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [addressIsValid, setAddressIsValid] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<{ id: string, slug: string, name: string }[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/product/new")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchCategories() {
      setIsLoadingCategories(true)
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()
        // Transform the categories to match the expected format
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Effacer l'erreur si l'utilisateur corrige le champ
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Selecting ${name}:`, value) // Debug log
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Effacer l'erreur si l'utilisateur corrige le champ
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleAddressChange = (address: string, lat?: number, lng?: number) => {
    setFormData((prev) => ({
      ...prev,
      location: address,
      latitude: lat || prev.latitude,
      longitude: lng || prev.longitude,
    }))

    // Effacer l'erreur si l'utilisateur corrige le champ
    if (errors.location) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.location
        return newErrors
      })
    }
  }

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: address || prev.location,
    }))

    // Si nous avons une adresse, considérer que l'adresse est valide
    if (address) {
      setAddressIsValid(true)

      // Effacer l'erreur si l'utilisateur corrige le champ
      if (errors.location) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.location
          return newErrors
        })
      }
    }
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          // Use reverse geocoding to get the address
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(response => response.json())
            .then(data => {
              const address = data.display_name || "Current Location"
              handleLocationChange(latitude, longitude, address)
            })
            .catch(() => {
              handleLocationChange(latitude, longitude, "Current Location")
            })
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Error",
            description: "Could not get your current location",
            variant: "destructive"
          })
        }
      )
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive"
      })
    }
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 0) {
      if (!formData.title.trim()) newErrors.title = "The title is required"
      if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
        newErrors.price = "Please enter a valid price"
      }
      if (!formData.category) {
        console.log("Category validation failed:", formData.category) // Debug log
        newErrors.category = "The category is required"
      }
      if (!formData.condition) newErrors.condition = "The product condition is required"
    } else if (currentStep === 1) {
      if (images.length === 0) newErrors.images = "Add at least one image"
    } else if (currentStep === 2) {
      if (!formData.location) {
        newErrors.location = "The location is required"
      } else if (!addressIsValid) {
        newErrors.location =
          "Please select a valid address from the list or use your current location"
      }
    }

    setErrors(newErrors)
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

  // Simplifier les données d'image pour l'API
  const prepareImageData = () => {
    return images.map((img) => ({
      imageUrl: img.imageUrl || img.preview,
      isPrimary: img.isPrimary,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setApiError(null)

    try {
      // Vérifier s'il y a des images à télécharger
      const imagesToUpload = images.filter((img) => img.file)
      let processedImages = [...images]

      if (imagesToUpload.length > 0) {
        setIsUploading(true)

        // Télécharger les images qui ont des fichiers
        const uploadPromises = imagesToUpload.map(async (img, index) => {
          if (!img.file) return img

          try {
            const uploadedUrl = await uploadImage(img.file)
            return {
              ...img,
              imageUrl: uploadedUrl,
              file: undefined, // Delete the file after upload
            }
          } catch (error) {
            console.error(`Error uploading image ${index}:`, error)
            throw new Error(`Failed to upload image ${index + 1}`)
          }
        })

        processedImages = await Promise.all(uploadPromises)
        setIsUploading(false)
      }

      // Find the selected category
      const selectedCategory = categories.find(cat => cat.slug === formData.category)
      if (!selectedCategory) {
        throw new Error("Invalid category selected")
      }

      // Préparer les données du produit
      const productData = {
        title: formData.title,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        categoryId: selectedCategory.id,
        condition: formData.condition,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        images: processedImages.map((img) => ({
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary,
        })),
      }

      console.log("Product data to send:", productData)

      // Envoyer les données à l'API
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "An error occurred while creating the product")
      }

      // Afficher un message de succès
      toast({
        title: "Product created successfully",
        description: "Your product has been added to the market.",
        variant: "default",
      })

      // Rediriger vers la page du produit
      router.push(`/product/${data.id}`)
    } catch (error: any) {
      console.error("Error creating product:", error)
      setApiError(error.message || "An error occurred while creating the product")
      toast({
        title: "Error",
        description: error.message || "An error occurred while creating the product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    )
  }

  // Fonction pour rendre le récapitulatif complet
  const renderSummary = () => {
    return (
      <div className="space-y-8">
        {/* Informations principales */}
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

            {/* Détails du produit */}
            <div className="flex-1">
              <h3 className="text-xl font-bold">{formData.title || "Titre non défini"}</h3>
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

        {/* Localisation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-3 flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-rose-500" />
            Location
          </h3>

          <div className="flex items-start mb-3">
            <p className="text-sm">{formData.location || "Address not specified"}</p>
          </div>

          {formData.latitude && formData.longitude && (
            <div className="h-[200px] rounded-lg overflow-hidden border">
              <LocationPickerMap
                latitude={formData.latitude}
                longitude={formData.longitude}
                address={formData.location}
                onLocationChange={handleLocationChange}
                height="200px"
              />
            </div>
          )}
        </div>

        {/* Afficher les erreurs API s'il y en a */}
        {apiError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        {/* Avertissement et confirmation */}
        <div className="border-t pt-6">


          <div className="flex justify-center">
            <Button
              type="submit"
              form="product-form"
              className="bg-rose-500 hover:bg-rose-600 flex items-center gap-2 px-8 py-6 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Publication en cours...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Publish the ad
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 ">
      <div className="flex items-center gap-2">
        <Link href="/" className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </div>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-left">Sell an article</h1>
        <p className="text-muted-foreground mb-6 text-left">Create an attractive ad to sell your product quickly</p>
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
            {/* Étape 1: Informations */}
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
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
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
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                  </div>

                  <div>
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger id="category" className={errors.category ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingCategories ? (
                          <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                        ) : categories.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">No category</div>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.slug}>
                              {cat.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <Label htmlFor="condition">
                      Condition <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => handleSelectChange("condition", value)}
                    >
                      <SelectTrigger id="condition" className={errors.condition ? "border-red-500" : ""}>
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
                    {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Étape 2: Photos */}
            <div className={currentStep === 1 ? "block" : "hidden"}>
              <div className="space-y-2">
                <Label htmlFor="images">Product images</Label>
                <ImageUploadWithPreview images={images} onChange={setImages} maxImages={5} />
              </div>
              {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
            </div>

            {/* Étape 3: Localisation */}
            <div className={currentStep === 2 ? "block" : "hidden"}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <AddressAutocompleteFree
                    value={formData.location}
                    onChange={handleAddressChange}
                    label="Product location"
                    placeholder="Enter the address where the product is located"
                    required
                    onValidationChange={setAddressIsValid}
                  />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    <span>or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGetCurrentLocation}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Use my current location
                  </Button>
                </div>
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}

                {formData.latitude && formData.longitude ? (
                  <LocationPickerMap
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    address={formData.location}
                    onLocationChange={handleLocationChange}
                    height="400px"
                  />
                ) : (
                  <div className="border border-dashed rounded-md p-8 text-center">
                    <div className="flex justify-center">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Enter an address or use your current location to display the map
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Étape 4: Récapitulatif */}
            <div className={currentStep === 3 ? "block" : "hidden"}>{renderSummary()}</div>
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
