"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import type { Session } from "next-auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { motion } from "framer-motion"

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Icons
import {
  Loader2,
  Star,
  Package,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Home,
  FileText,
  CheckCircle2,
} from "lucide-react"

// Components
import NewImageUploader from "@/components/new-image-upload"

// Types
import type { UserResponse, ProductResponse } from "@/lib/types"

export default function ProfilePage() {
  const { data: session, status } = useSession() as {
    data: (Session & { user: { id: string } }) | null
    status: string
  }
  const router = useRouter()
  const { toast } = useToast()

  const [user, setUser] = useState<UserResponse | null>(null)
  const [userProducts, setUserProducts] = useState<ProductResponse[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    postalCode: "",
    bio: "",
    profileImage: "",
  })
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false)
  const [uploadedProfileImageUrl, setUploadedProfileImageUrl] = useState<string | null>(null)

  // Redirect to login page if user is not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Load user data
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData(session.user.id)
      fetchUserProducts(session.user.id)
    }
  }, [session])

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setFormData({
          username: userData.username || "",
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          city: userData.city || "",
          address: userData.address || "",
          postalCode: userData.postalCode || "",
          bio: userData.bio || "",
          profileImage: userData.profileImage || "",
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProducts = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/products`)
      if (response.ok) {
        const data = await response.json()
        setUserProducts(data.products)
      }
    } catch (error) {
      console.error("Error loading user products:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setIsSaving(true)
    try {
      const dataToSave = { ...formData }
      if (uploadedProfileImageUrl) {
        dataToSave.profileImage = uploadedProfileImageUrl
      }

      const response = await fetch(`/api/users/${session.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setIsEditing(false)
        setUploadedProfileImageUrl(null) // Reset URL after saving
        toast({
          title: "Profile updated",
          description: "Your information has been updated successfully.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "An error occurred while updating the profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Delete a product
  const handleDeleteProduct = async () => {
    if (!deleteProductId) return

    try {
      const response = await fetch(`/api/products/${deleteProductId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Update product list
        setUserProducts(userProducts.filter((product) => product.id !== deleteProductId))
        toast({
          title: "Product deleted",
          description: "Your product has been deleted successfully.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "An error occurred while deleting the product",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting the product",
        variant: "destructive",
      })
    } finally {
      setDeleteProductId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Profile not found</CardTitle>
            <CardDescription>Unable to load profile information. Please login.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/login")}>Login</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and account settings</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-rose-400 to-rose-500 h-24" />
            <div className="px-6 -mt-12 pb-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  <AvatarImage
                    src={user.profileImage || "/placeholder.svg?height=96&width=96"}
                    alt={user.username}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-rose-100 text-rose-500 text-xl">
                    {user.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="mt-4 text-center">
                  <h2 className="text-xl font-semibold">{user.username}</h2>
                  <p className="text-gray-500">
                    {user.firstName} {user.lastName}
                  </p>

                  {user.isVerified && (
                    <div className="mt-2 flex justify-center">
                      <Badge className="bg-green-100 text-green-700 border-0 flex items-center gap-1 px-2 py-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Account
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-100 p-2 rounded-full">
                    <Star className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="font-medium">
                      {(user.rating ?? 0).toFixed(1)} ({user.reviewsCount ?? 0} reviews)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-rose-100 p-2 rounded-full">
                    <Package className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Products</p>
                    <p className="font-medium">
                      {user.productsCount} product{user.productsCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {user.city && (
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-100 p-2 rounded-full">
                      <MapPin className="h-4 w-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{user.city}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="bg-rose-100 p-2 rounded-full">
                    <Calendar className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member since</p>
                    <p className="font-medium">
                      {format(new Date(user.createdAt), "MMMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {user.bio && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="font-medium mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-rose-500" />
                      About
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{user.bio}</p>
                  </div>
                </>
              )}

              <Separator className="my-6" />

              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-rose-500" />
                  Contact Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-2 text-gray-400" />
                    <span className="text-gray-600">{user.email}</span>
                  </p>
                  {user.phone && (
                    <p className="flex items-center">
                      <Phone className="h-3.5 w-3.5 mr-2 text-gray-400" />
                      <span className="text-gray-600">{user.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {!isEditing ? (
                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              ) : null}
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          {isEditing ? (
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-rose-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="hover:bg-white/20">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col items-center space-y-4 mb-6">
                    <Avatar className="h-24 w-24 border-2 border-rose-200">
                      <AvatarImage
                        src={uploadedProfileImageUrl || formData.profileImage || "/placeholder.svg?height=96&width=96"}
                        alt={user.username}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-rose-100 text-rose-500 text-xl">
                        {user.username?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-full max-w-sm">
                      <Label htmlFor="profileImage" className="text-sm font-medium mb-1.5 block">
                        Profile Image
                      </Label>
                      <NewImageUploader
                        type="avatar"
                        userId={session?.user?.id || ""}
                        onUploadStart={() => setIsUploadingProfileImage(true)}
                        onUploadComplete={(urls) => {
                          if (urls && urls.length > 0) {
                            setUploadedProfileImageUrl(urls[0])
                          }
                          setIsUploadingProfileImage(false)
                        }}
                      />
                      {isUploadingProfileImage && (
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          Uploading...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="username" className="text-sm font-medium">
                        Username
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        First Name
                      </Label>
                      <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name
                      </Label>
                      <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-sm font-medium">
                        City
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="address" className="text-sm font-medium">
                        Address
                      </Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="postalCode" className="text-sm font-medium">
                        Postal Code
                      </Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <Label htmlFor="bio" className="text-sm font-medium">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Tell others about yourself..."
                        className="resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="reviews" className="w-full">
              <TabsList className="w-full grid grid-cols-1 mb-6 bg-rose-50 p-1">
                <TabsTrigger
                  value="reviews"
                  className="data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
                >
                  Received Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reviews" className="mt-0">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-rose-50 to-rose-100">
                    <CardTitle>Received Reviews</CardTitle>
                    <CardDescription>Reviews left by other users on your transactions</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="bg-rose-50 p-4 rounded-full mb-4">
                        <Star className="h-8 w-8 text-rose-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                      <p className="text-gray-500 max-w-md">
                        Reviews will appear here once other users leave feedback on your transactions.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>

      {/* Confirmation dialog box for product deletion */}
      <AlertDialog open={deleteProductId !== null} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent className="border-0 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible. The product will be permanently deleted from the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-rose-100">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-rose-500 hover:bg-rose-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
