"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import type { Session } from "next-auth"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, ArrowRight, Save, Camera, MapPin, AlertCircle } from "lucide-react"
import { GeolocationRequest } from "@/components/geolocation-request"
import AddressAutocompleteFree from "@/components/address-autocomplete-free"
import { ImageUploadWithPreview, type UploadedImage } from "@/components/image-upload-with-preview"
import { LocationPickerMap } from "@/components/location-picker-map"
import FormSteps from "@/components/form-steps"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

const STEPS = ["Informations", "Photos", "Localisation", "Finalisation"]

const LeafletMapComponent = dynamic(
  () => import("@/components/leaflet-map-component").then((mod) => mod.LeafletMapComponent),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-2 text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    ),
  },
)


export default function NewProductPage() {
  const { data: session, status } = useSession() as { data: Session & { user: { id: string } } | null, status: string }
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
    latitude: 35.1264,
    longitude: 33.4299,
  })
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<{ id: string, slug: string, name: string }[]>([])
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [showGeolocationRequest, setShowGeolocationRequest] = useState(true)

  const requestGeolocation = () => {
    setIsRequestingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleGeolocationAccept([position.coords.latitude, position.coords.longitude])
        setIsRequestingLocation(false)
      },
      (error) => {
        console.error("Error getting geolocation:", error)
        setLocationError("Unable to retrieve your position. Please try again or enable geolocation.")
        setIsRequestingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    )
  }

  const handleGeolocationAccept = (position: [number, number]) => {
    setUserLocation(position)
    setLocationError(null)
    setShowGeolocationRequest(false)
    localStorage.setItem("geolocation-consent", "granted")
    handleLocationChange(position[0], position[1])
  }

  const handleGeolocationDecline = () => {
    setShowGeolocationRequest(false)
    const defaultLat = 35.1264
    const defaultLng = 33.4299
    setUserLocation([defaultLat, defaultLng])
    setLocationError("You have refused geolocation. The map will display all products available in Turkey.")
    localStorage.setItem("geolocation-consent", "denied")
    handleLocationChange(defaultLat, defaultLng, "Nicosia, Cyprus")
  }

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

  useEffect(() => {
    const storedLat = localStorage.getItem("user-latitude")
    const storedLng = localStorage.getItem("user-longitude")
    const geolocationConsent = localStorage.getItem("geolocation-consent")

    if (storedLat && storedLng) {
      const lat = parseFloat(storedLat)
      const lng = parseFloat(storedLng)
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
          const address = data.display_name || "Current Location"
          handleLocationChange(lat, lng, address)
        })
        .catch(() => {
          handleLocationChange(lat, lng, "Current Location")
        })
    } else if (geolocationConsent === "granted") {
      handleGetCurrentLocation()
    } else if (geolocationConsent === "denied") {
      handleGeolocationDecline()
    } else {
      setShowGeolocationRequest(true)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleAddressChange = async (address: string) => {
    let lat = 35.1856;
    let lng = 33.3823;
    let cityCountry = "Nicosia, Cyprus";

    if (address) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
          cityCountry = address;
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
    }));
    setAddressIsValid(true);
    if (errors.location) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.location;
        return newErrors;
      });
    }
  };

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
    if (errors.location) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.location
        return newErrors
      })
    }
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
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
      const productUniqueId = `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      
      // Show initial progress notification
      toast({
        title: "Processing your product",
        description: "We're preparing your ad for submission...",
        duration: 3000,
      })

      const imagesToUpload = images.filter((img) => img.file)
      let processedImages = [...images]

      if (imagesToUpload.length > 0) {
        setIsUploading(true)
        
        // Notify user about image upload
        toast({
          title: "Uploading images",
          description: `Uploading ${imagesToUpload.length} image${imagesToUpload.length > 1 ? 's' : ''}...`,
          duration: 5000,
        })

        const uploadPromises = imagesToUpload.map(async (img, index) => {
          if (!img.file) return img

          try {
            const formData = new FormData()
            formData.append('file', img.file)
            formData.append('type', 'product')
            formData.append('userId', session?.user?.id || '')
            formData.append('productId', productUniqueId)

            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            })

            if (!response.ok) {
              throw new Error('Upload failed')
            }

            const data = await response.json()
            return {
              ...img,
              imageUrl: data.url,
              file: undefined,
            }
          } catch (error) {
            console.error(`Error uploading image ${index}:`, error)
            throw new Error(`Failed to upload image ${index + 1}`)
          }
        })

        processedImages = await Promise.all(uploadPromises)
        setIsUploading(false)
        
        // Notify completion of uploads
        toast({
          title: "Images uploaded",
          description: "All images have been successfully uploaded",
          duration: 3000,
        })
      }

      const selectedCategory = categories.find(cat => cat.slug === formData.category)
      if (!selectedCategory) {
        throw new Error("Invalid category selected")
      }

      // Notify about product creation
      toast({
        title: "Creating your product",
        description: "Saving product details to our database...",
        duration: 3000,
      })

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
          imageUrl: img.imageUrl || img.preview,
          isPrimary: img.isPrimary,
        })),
      }

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

      toast({
        title: "Product created successfully",
        description: "Your product has been added to the market.",
        variant: "default",
      })

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

  const renderSummary = () => {
    return (
      <div className="space-y-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
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

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-3 flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-rose-500" />
            Location
          </h3>

          {locationError && (
          <div className="mt-2 mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>{locationError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-2 bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
              onClick={requestGeolocation}
              disabled={isRequestingLocation}
            >
              {isRequestingLocation ? (
                <>
                  <span className="animate-spin mr-1">⏳</span>
                  Location...
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3 mr-1 pulse-location" />
                  Enable my position
                </>
              )}
            </Button>
          </div>
        )}
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
                refreshMap={currentStep === 2}
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

        {apiError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <div className="border-t pt-6">
          <div className="flex justify-center">
            <Button
              type="submit"
              form="product-form"
              className="bg-rose-500 hover:bg-rose-600 flex items-center gap-2 px-8 py-6 text-lg"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isUploading ? "Uploading..." : "Publishing..."}
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Publish
                </>
              )}
            </Button>
          </div>
          
          {isSubmitting && (
            <div className="mt-4">
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500" 
                  style={{ 
                    width: isUploading ? '40%' : '80%',
                    transition: 'width 0.8s ease'
                  }} 
                />
              </div>
              <p className="text-xs text-center mt-2 text-muted-foreground">
                {isUploading 
                  ? `Uploading images` 
                  : "Finalizing your listing"}
              </p>
            </div>
          )}
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

      {showGeolocationRequest && (
          <GeolocationRequest onAccept={handleGeolocationAccept} onDecline={handleGeolocationDecline} />
      )}

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

            <div className={currentStep === 1 ? "block" : "hidden"}>
              <div className="space-y-2">
                <Label htmlFor="images">Product images</Label>
                <ImageUploadWithPreview images={images} onChange={setImages} maxImages={5} />
              </div>
              {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
            </div>

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
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}

                {typeof formData.latitude === 'number' && typeof formData.longitude === 'number' ? (
                  <div className="w-full mt-2 animate-fadeIn">
                    <LocationPickerMap
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      address={formData.location}
                      onLocationChange={handleLocationChange}
                      refreshMap={currentStep === 2}
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
            </div>

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
