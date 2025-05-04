"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Home,
  Users,
  ShoppingBag,
  Settings,
  LayoutDashboard,
  Package,
  MessageSquare,
  Bell,
  ChevronDown,
  Search,
  Menu,
  PlusCircle,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown,
  MoreHorizontal,
  LogOut,
  Loader2,
  MapPin,
  Plus,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Image } from "lucide-react"
import { ImageUploadWithPreview, type UploadedImage } from "@/components/image-upload-with-preview"
import { uploadImage } from "@/lib/image-upload-service"
import AddressAutocompleteFree from "@/components/address-autocomplete-free"
import LocationPickerMap from "@/components/location-picker-map"

// Add new imports for charts
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"


// Types
interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon: string
  color?: string
  order: number
  isActive: boolean
  productCount: number
}

interface User {
  id: number
  username: string
  email: string
  firstName: string | null
  lastName: string | null
  profileImage: string | null
  role: string
  isActive: boolean
  isVerified: boolean
  createdAt: string
  lastLogin: string | null
  city: string | null
  _count: {
    products: number
    reviewsReceived: number
  }
}

interface Product {
  id: number
  title: string
  description: string
  price: number
  categoryId: string
  condition: string
  location: string
  latitude: number | null
  longitude: number | null
  isActive: boolean
  isSold: boolean
  viewsCount: number
  createdAt: string
  updatedAt: string
  sellerId: number
  seller: {
    id: number
    username: string
    email: string
    firstName: string
    lastName: string
    profileImage: string | null
    city: string | null
    isVerified: boolean
  }
  images: {
    id: number
    imageUrl: string
    isPrimary: boolean
  }[]
  primaryImage: string | null
  favoritesCount: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

// Icônes disponibles pour les catégories
const availableIcons = [
  "Home",
  "Car",
  "Smartphone",
  "Laptop",
  "Utensils",
  "Shirt",
  "Dumbbell",
  "Flower",
  "Book",
  "Music",
  "Camera",
  "Tv",
  "Gift",
  "Baby",
  "Briefcase",
  "Palette",
]

// Composant pour afficher l'icône dynamiquement
const DynamicIcon = ({ name }: { name: string }) => {
  switch (name) {
    case "Home":
      return <Home className="h-5 w-5" />
    case "Car":
      return <Package className="h-5 w-5" />
    case "Smartphone":
      return <ShoppingBag className="h-5 w-5" />
    case "Laptop":
      return <Settings className="h-5 w-5" />
    case "Utensils":
      return <Users className="h-5 w-5" />
    case "Shirt":
      return <Bell className="h-5 w-5" />
    case "Dumbbell":
      return <MessageSquare className="h-5 w-5" />
    case "Flower":
      return <Home className="h-5 w-5" />
    default:
      return <Package className="h-5 w-5" />
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState<Partial<Category>>({ 
    name: "", 
    slug: "", 
    icon: "Home",
    isActive: true,
    order: 0
  })
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [addressIsValid, setAddressIsValid] = useState(false)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    title: "",
    description: "",
    price: 0,
    categoryId: "",
    condition: "NEW",
    location: "",
    latitude: null,
    longitude: null,
    isActive: true,
    isSold: false
  })
  const [sortBy, setSortBy] = useState("date_desc")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    bio: "",
    role: "USER",
  })
  // Add new state for image management
  const [editingProductImages, setEditingProductImages] = useState<Product | null>(null);
  // Add new state for delete confirmation
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  // Add new state for users
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  // Add new form state for user creation/editing
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "USER",
  })

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [status, session, router])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (!response.ok) throw new Error("Failed to fetch categories")
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast.error("Failed to load categories")
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchCategories()
    }
  }, [status, session])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          sortBy,
          ...(searchQuery && { search: searchQuery })
        })
        
        const response = await fetch(`/api/products?${params}`)
        if (!response.ok) throw new Error("Failed to fetch products")
        const data = await response.json()
        setProducts(data.products)
        setTotalPages(data.pagination.pages)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast.error("Failed to load products")
      } finally {
        setLoadingProducts(false)
      }
    }

    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchProducts()
    }
  }, [status, session, page, sortBy, searchQuery])

  // Fetch users
  const fetchUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const response = await fetch("/api/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      // Filter out the current user
      const filteredUsers = data.users.filter((user: User) => 
        user.id !== Number(session?.user?.id)
      )
      setUsers(filteredUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to fetch users")
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Handle adding a new category
  const handleAddCategory = async () => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create category")
      }

      const createdCategory = await response.json()
      setCategories([...categories, createdCategory])
      setIsAddingCategory(false)
      setNewCategory({ name: "", slug: "", icon: "Home", isActive: true, order: 0 })
      toast.success("Category created successfully")
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create category")
    }
  }

  // Handle updating a category
  const handleUpdateCategory = async () => {
    if (!editingCategory) return

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingCategory),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update category")
      }

      const updatedCategory = await response.json()
      setCategories(categories.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      ))
      setEditingCategory(null)
      toast.success("Category updated successfully")
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update category")
    }
  }

  // Handle deleting a category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete category")
      }

      setCategories(categories.filter(cat => cat.id !== categoryId))
      setCategoryToDelete(null)
      toast.success("Category deleted successfully")
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete category")
    }
  }

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle adding a new product
  const handleAddProduct = async () => {
    try {
      setIsUploading(true)
      // Upload images first
      const imagesToUpload = images.filter((img) => img.file)
      let processedImages = [...images]

      if (imagesToUpload.length > 0) {
        const uploadPromises = imagesToUpload.map(async (img, index) => {
          if (!img.file) return img

          try {
            const uploadedUrl = await uploadImage(img.file)
            return {
              ...img,
              imageUrl: uploadedUrl,
              file: undefined,
            }
          } catch (error) {
            console.error(`Error uploading image ${index}:`, error)
            throw new Error(`Failed to upload image ${index + 1}`)
          }
        })

        processedImages = await Promise.all(uploadPromises)
      }

      // Get the category from the selected category ID
      const selectedCategory = categories.find(cat => cat.id === newProduct.categoryId)
      if (!selectedCategory) {
        throw new Error("Invalid category selected")
      }

      // Prepare product data with images
      const productData = {
        ...newProduct,
        categoryId: selectedCategory.id, // Use the category ID directly
        images: processedImages.map((img) => ({
          imageUrl: img.imageUrl,
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

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create product")
      }

      const createdProduct = await response.json()
      setProducts([createdProduct, ...products])
      setIsAddingProduct(false)
      setNewProduct({
        title: "",
        description: "",
        price: 0,
        categoryId: "",
        condition: "NEW",
        location: "",
        latitude: null,
        longitude: null,
        isActive: true,
        isSold: false
      })
      setImages([])
      toast.success("Product created successfully")
    } catch (error) {
      console.error("Error creating product:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create product")
    } finally {
      setIsUploading(false)
    }
  }

  // Handle updating a product
  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    try {
      setIsUploading(true)
      // Upload new images if any
      const imagesToUpload = images.filter((img) => img.file)
      let processedImages = [...images]

      if (imagesToUpload.length > 0) {
        const uploadPromises = imagesToUpload.map(async (img, index) => {
          if (!img.file) return img

          try {
            const uploadedUrl = await uploadImage(img.file)
            return {
              ...img,
              imageUrl: uploadedUrl,
              file: undefined,
            }
          } catch (error) {
            console.error(`Error uploading image ${index}:`, error)
            throw new Error(`Failed to upload image ${index + 1}`)
          }
        })

        processedImages = await Promise.all(uploadPromises)
      }

      // Get the category from the selected category ID
      const selectedCategory = categories.find(cat => cat.id === editingProduct.categoryId)
      if (!selectedCategory) {
        throw new Error("Invalid category selected")
      }

      // Prepare product data with images
      const productData = {
        ...editingProduct,
        categoryId: selectedCategory.id,
        images: processedImages.map((img) => ({
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary,
        })),
      }

      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update product")
      }

      const updatedProduct = await response.json()
      setProducts(products.map(p => 
        p.id === updatedProduct.id ? updatedProduct : p
      ))
      setEditingProduct(null)
      setImages([])
      setCurrentStep(1)
      toast.success("Product updated successfully")
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update product")
    } finally {
      setIsUploading(false)
    }
  }

  // Handle deleting a product
  const handleDeleteProduct = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete product")
      }

      setProducts(products.filter(p => p.id !== productId))
      setProductToDelete(null)
      toast.success("Product deleted successfully")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete product")
    }
  }

  const handleAddressChange = (address: string, lat?: number, lng?: number) => {
    setNewProduct((prev) => ({
      ...prev,
      location: address,
      latitude: lat || prev.latitude,
      longitude: lng || prev.longitude,
    }))

    if (lat && lng) {
      setAddressIsValid(true)
    }
  }

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    setNewProduct((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: address || "Unknown Location",
    }))

    if (address) {
      setAddressIsValid(true)
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
          toast.error("Could not get your current location")
        }
      )
    } else {
      toast.error("Geolocation is not supported by your browser")
    }
  }

  // Handle add user
  const handleAddUser = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create user")
      }

      const createdUser = await response.json()
      setUsers((prev) => [createdUser, ...prev])
      setShowAddUserModal(false)
      setNewUser({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        bio: "",
        role: "USER",
      })
      toast.success("User created successfully")
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create user")
    }
  }

  // Handle edit user
  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: selectedUser.username,
          email: selectedUser.email,
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          role: selectedUser.role,
          isActive: selectedUser.isActive,
          isVerified: selectedUser.isVerified,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update user")
      }

      const updatedUser = await response.json()
      setUsers((prev) =>
        prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      )
      setShowEditUserModal(false)
      setSelectedUser(null)
      toast.success("User updated successfully")
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update user")
    }
  }

  // Handle delete user
  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete user")
      }

      setUsers(users.filter(u => u.id !== userId))
      setUserToDelete(null)
      toast.success("User deleted successfully")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete user")
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct({
      ...product,
      title: product.title || "",
      description: product.description || "",
      price: product.price || 0,
      categoryId: product.categoryId || "",
      condition: product.condition || "NEW",
      location: product.location || "",
      latitude: product.latitude || null,
      longitude: product.longitude || null,
      isActive: product.isActive || false,
      isSold: product.isSold || false,
    })
    setImages(product.images?.map(img => ({
      imageUrl: img.imageUrl,
      isPrimary: img.isPrimary,
      file: undefined,
      preview: img.imageUrl // Add preview URL for existing images
    })) || [])
    setCurrentStep(1)
    setAddressIsValid(!!product.latitude && !!product.longitude)
  }

  // Add new handler for updating images
  const handleUpdateProductImages = async () => {
    if (!editingProductImages) return;

    try {
      setIsUploading(true);
      // Upload new images if any
      const imagesToUpload = images.filter((img) => img.file);
      let processedImages = [...images];

      if (imagesToUpload.length > 0) {
        const uploadPromises = imagesToUpload.map(async (img, index) => {
          if (!img.file) return img;

          try {
            const uploadedUrl = await uploadImage(img.file);
            return {
              ...img,
              imageUrl: uploadedUrl,
              file: undefined,
            };
          } catch (error) {
            console.error(`Error uploading image ${index}:`, error);
            throw new Error(`Failed to upload image ${index + 1}`);
          }
        });

        processedImages = await Promise.all(uploadPromises);
      }

      const response = await fetch(`/api/products/${editingProductImages.id}/images`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: processedImages.map((img) => ({
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update product images");
      }

      const updatedProduct = await response.json();
      setProducts(products.map(p => 
        p.id === updatedProduct.id ? updatedProduct : p
      ));
      setEditingProductImages(null);
      setImages([]);
      toast.success("Product images updated successfully");
    } catch (error) {
      console.error("Error updating product images:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update product images");
    } finally {
      setIsUploading(false);
    }
  };

  // Add handlers for user management
  const handleCreateUser = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userForm),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create user")
      }

      const newUser = await response.json()
      setUsers([newUser, ...users])
      setIsCreatingUser(false)
      setUserForm({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "USER",
      })
      toast.success("User created successfully")
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create user")
    }
  }

  // Add the users table section
  const renderUsersTable = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input type="search" placeholder="Rechercher un utilisateur..." className="pl-10 pr-4" />
          </div>

          <Button className="bg-rose-500 hover:bg-rose-600" onClick={() => setIsCreatingUser(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Ajouter un utilisateur
          </Button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{`${user.firstName || ""} ${user.lastName || ""}`}</TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user._count.products}</TableCell>
                  <TableCell>{user._count.reviewsReceived}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-rose-500 hover:text-rose-600"
                        onClick={() => setUserToDelete(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )

  // Add the create user dialog
  const renderCreateUserDialog = () => (
    <Dialog open={isCreatingUser} onOpenChange={setIsCreatingUser}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new user.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input
              value={userForm.username}
              onChange={(e) =>
                setUserForm({ ...userForm, username: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={userForm.password}
              onChange={(e) =>
                setUserForm({ ...userForm, password: e.target.value })
              }
            />
          </div>
          <div>
            <Label>First Name</Label>
            <Input
              value={userForm.firstName}
              onChange={(e) =>
                setUserForm({ ...userForm, firstName: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              value={userForm.lastName}
              onChange={(e) =>
                setUserForm({ ...userForm, lastName: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Role</Label>
            <Select
              value={userForm.role}
              onValueChange={(value) =>
                setUserForm({ ...userForm, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCreatingUser(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateUser}>Create User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Add the delete user confirmation dialog
  const renderDeleteUserDialog = () => (
    <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            User: <span className="font-medium">{userToDelete?.username}</span>
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setUserToDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Add the edit user dialog
  const renderEditUserDialog = () => (
    <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Modify user details.
          </DialogDescription>
        </DialogHeader>
        {editingUser && (
          <div className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                value={editingUser.username}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, username: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>First Name</Label>
              <Input
                value={editingUser.firstName || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, firstName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={editingUser.lastName || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, lastName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={editingUser.role}
                onValueChange={(value) =>
                  setEditingUser({ ...editingUser, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={editingUser.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  setEditingUser({ ...editingUser, isActive: value === "active" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingUser(null)}>
            Cancel
          </Button>
          <Button onClick={handleEditUser}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Update the role badge component
  const RoleBadge = ({ role }: { role: string }) => {
    const badgeVariants = {
      ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
      USER: "bg-blue-100 text-blue-800 border-blue-200",
      MODERATOR: "bg-green-100 text-green-800 border-green-200",
    }

    return (
      <Badge
        variant="outline"
        className={`${badgeVariants[role as keyof typeof badgeVariants] || "bg-gray-100 text-gray-800 border-gray-200"}`}
      >
        {role}
      </Badge>
    )
  }

  // Update the dashboard preview section
  const renderDashboardUsersPreview = () => (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>Latest registered users</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.slice(0, 5).map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.username || "User"} />
                      <AvatarFallback>{user.username?.substring(0, 2) || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.username}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      user.isActive
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-rose-50 text-rose-600 border-rose-200"
                    }
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => setActiveTab("users")}>
          View all users
        </Button>
      </CardFooter>
    </Card>
  )

  // Update the dashboard section
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Produits Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => p.isActive).length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {products.filter(p => p.isActive && !p.isSold).length} disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Utilisateurs Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.isActive).length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {users.filter(u => u.isActive && u._count.products > 0).length} vendeurs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Catégories Actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.filter(c => c.isActive).length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {categories.reduce((acc, cat) => acc + cat.productCount, 0)} produits au total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution des Produits par Catégorie</CardTitle>
          <CardDescription>Répartition des produits actifs par catégorie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categories
                  .filter(c => c.isActive)
                  .map(category => ({
                    name: category.name,
                    products: category.productCount,
                    color: COLORS[categories.indexOf(category) % COLORS.length]
                  }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="products">
                  {categories
                    .filter(c => c.isActive)
                    .map((category, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs Récents</CardTitle>
            <CardDescription>Les 30 derniers utilisateurs inscrits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Inscription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 30)
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.username || "User"} />
                              <AvatarFallback>{user.username?.substring(0, 2) || "U"}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produits Récents</CardTitle>
            <CardDescription>Les 30 derniers produits ajoutés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Ajouté le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 30)
                    .map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell>
                          {categories.find(c => c.id === product.categoryId)?.name || "Non catégorisé"}
                        </TableCell>
                        <TableCell>
                          {new Date(product.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Update the sidebar navigation to remove unnecessary items
  const renderSidebar = () => (
    <nav className="flex-1 p-4">
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center w-full p-2 rounded-md ${
              activeTab === "dashboard" ? "bg-rose-50 text-rose-600" : "hover:bg-gray-100"
            } ${!sidebarOpen && "justify-center"}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3">Tableau de bord</span>}
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center w-full p-2 rounded-md ${
              activeTab === "products" ? "bg-rose-50 text-rose-600" : "hover:bg-gray-100"
            } ${!sidebarOpen && "justify-center"}`}
          >
            <Package className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3">Produits</span>}
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center w-full p-2 rounded-md ${
              activeTab === "categories" ? "bg-rose-50 text-rose-600" : "hover:bg-gray-100"
            } ${!sidebarOpen && "justify-center"}`}
          >
            <ShoppingBag className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3">Catégories</span>}
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center w-full p-2 rounded-md ${
              activeTab === "users" ? "bg-rose-50 text-rose-600" : "hover:bg-gray-100"
            } ${!sidebarOpen && "justify-center"}`}
          >
            <Users className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3">Utilisateurs</span>}
          </button>
        </li>
      </ul>
    </nav>
  )

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Delete Product Confirmation Dialog */}
      <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Product: <span className="font-medium">{productToDelete?.title}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => productToDelete && handleDeleteProduct(productToDelete.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Category: <span className="font-medium">{categoryToDelete?.name}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {renderDeleteUserDialog()}
      {renderCreateUserDialog()}
      {renderEditUserDialog()}

      {/* Sidebar */}
      <div className={`bg-white border-r ${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className={`flex items-center ${!sidebarOpen && "justify-center w-full"}`}>
            <ShoppingBag className="h-6 w-6 text-rose-500" />
            {sidebarOpen && <span className="ml-2 font-bold text-lg">Fasfar Admin</span>}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1 rounded-md hover:bg-gray-100 ${!sidebarOpen && "hidden"}`}
          >
            <ChevronDown className={`h-5 w-5 transform ${sidebarOpen ? "rotate-0" : "rotate-180"}`} />
          </button>
        </div>

        {renderSidebar()}

        <div className="p-4 border-t">
          <button
            className={`flex items-center w-full p-2 rounded-md hover:bg-gray-100 ${!sidebarOpen && "justify-center"}`}
          >
            <LogOut className="h-5 w-5 text-gray-500" />
            {sidebarOpen && <span className="ml-3">Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 mr-4 rounded-md hover:bg-gray-100 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">
                {activeTab === "dashboard" && "Tableau de bord"}
                {activeTab === "products" && "Gestion des produits"}
                {activeTab === "categories" && "Gestion des catégories"}
                {activeTab === "users" && "Gestion des utilisateurs"}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuItem className="flex flex-col items-start">
                  <span className="font-medium">Nouveau produit ajouté</span>
                  <span className="text-sm text-gray-500">iPhone 13 Pro - 256GB</span>
                  <span className="text-xs text-gray-400">Il y a 5 minutes</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start">
                  <span className="font-medium">Nouvel utilisateur</span>
                  <span className="text-sm text-gray-500">Marie Dubois</span>
                  <span className="text-xs text-gray-400">Il y a 15 minutes</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start">
                  <span className="font-medium">Produit vendu</span>
                  <span className="text-sm text-gray-500">MacBook Air M1</span>
                  <span className="text-xs text-gray-400">Il y a 1 heure</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/")}>
                  <Home className="h-4 w-4 mr-2" />
                  Accueil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            renderDashboard()
          )}

          {/* Categories */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search categories..."
                    className="pl-10 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                  <DialogTrigger asChild>
                    <Button className="bg-rose-500 hover:bg-rose-600">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                      <DialogDescription>Create a new category for your products.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="slug" className="text-right">
                          Slug
                        </Label>
                        <Input
                          id="slug"
                          value={newCategory.slug}
                          onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="icon" className="text-right">
                          Icon
                        </Label>
                        <Select
                          value={newCategory.icon}
                          onValueChange={(value) => setNewCategory({ ...newCategory, icon: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select an icon" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableIcons.map((icon) => (
                              <SelectItem key={icon} value={icon}>
                                <div className="flex items-center">
                                  <DynamicIcon name={icon} />
                                  <span className="ml-2">{icon}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddCategory}
                        className="bg-rose-500 hover:bg-rose-600"
                        disabled={!newCategory.name || !newCategory.slug}
                      >
                        Add
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>Manage your product categories.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Icon</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCategories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell>
                              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-50 text-rose-500">
                                <DynamicIcon name={category.icon} />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{category.slug}</TableCell>
                            <TableCell>{category.productCount}</TableCell>
                            <TableCell>
                              <Badge
                                variant={category.isActive ? "default" : "secondary"}
                              >
                                {category.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Dialog
                                  open={editingCategory?.id === category.id}
                                  onOpenChange={(open) => !open && setEditingCategory(null)}
                                >
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={() => setEditingCategory(category)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Category</DialogTitle>
                                      <DialogDescription>Modify category details.</DialogDescription>
                                    </DialogHeader>
                                    {editingCategory && (
                                      <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-name" className="text-right">
                                            Name
                                          </Label>
                                          <Input
                                            id="edit-name"
                                            value={editingCategory.name}
                                            onChange={(e) =>
                                              setEditingCategory({ ...editingCategory, name: e.target.value })
                                            }
                                            className="col-span-3"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-slug" className="text-right">
                                            Slug
                                          </Label>
                                          <Input
                                            id="edit-slug"
                                            value={editingCategory.slug}
                                            onChange={(e) =>
                                              setEditingCategory({ ...editingCategory, slug: e.target.value })
                                            }
                                            className="col-span-3"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-icon" className="text-right">
                                            Icon
                                          </Label>
                                          <Select
                                            value={editingCategory.icon}
                                            onValueChange={(value) =>
                                              setEditingCategory({ ...editingCategory, icon: value })
                                            }
                                          >
                                            <SelectTrigger className="col-span-3">
                                              <SelectValue placeholder="Select an icon" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {availableIcons.map((icon) => (
                                                <SelectItem key={icon} value={icon}>
                                                  <div className="flex items-center">
                                                    <DynamicIcon name={icon} />
                                                    <span className="ml-2">{icon}</span>
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-status" className="text-right">
                                            Status
                                          </Label>
                                          <Select
                                            value={editingCategory.isActive ? "active" : "inactive"}
                                            onValueChange={(value) =>
                                              setEditingCategory({ ...editingCategory, isActive: value === "active" })
                                            }
                                          >
                                            <SelectTrigger className="col-span-3">
                                              <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="active">Active</SelectItem>
                                              <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    )}
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setEditingCategory(null)}>
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={handleUpdateCategory}
                                        className="bg-rose-500 hover:bg-rose-600"
                                        disabled={!editingCategory?.name || !editingCategory?.slug}
                                      >
                                        Save
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-rose-500 hover:text-rose-600"
                                  onClick={() => setCategoryToDelete(category)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {renderUsersTable()}
            </div>
          )}

          {/* Products */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-10 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date_desc">Newest First</SelectItem>
                      <SelectItem value="date_asc">Oldest First</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                    <DialogTrigger asChild>
                      <Button className="bg-rose-500 hover:bg-rose-600">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>Create a new product listing.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-4">
                        {currentStep === 1 && (
                          <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label htmlFor="title">Title</Label>
                                  <Input
                                    id="title"
                                    value={newProduct.title}
                                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                                    placeholder="Enter product title"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="price">Price (€)</Label>
                                  <Input
                                    id="price"
                                    type="number"
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                                    placeholder="Enter price"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label htmlFor="categoryId">Category</Label>
                                  <Select
                                    value={newProduct.categoryId}
                                    onValueChange={(value) => setNewProduct({ ...newProduct, categoryId: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="condition">Condition</Label>
                                  <Select
                                    value={newProduct.condition}
                                    onValueChange={(value) => setNewProduct({ ...newProduct, condition: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select condition" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="NEW">New</SelectItem>
                                      <SelectItem value="LIKE_NEW">Like New</SelectItem>
                                      <SelectItem value="GOOD">Good</SelectItem>
                                      <SelectItem value="FAIR">Fair</SelectItem>
                                      <SelectItem value="POOR">Poor</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                  id="description"
                                  value={newProduct.description}
                                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                  placeholder="Enter product description"
                                  rows={4}
                                />
                              </div>

                              <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="isActive"
                                    checked={newProduct.isActive}
                                    onCheckedChange={(checked) =>
                                      setNewProduct({ ...newProduct, isActive: checked as boolean })
                                    }
                                  />
                                  <Label htmlFor="isActive">Active</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="isSold"
                                    checked={newProduct.isSold}
                                    onCheckedChange={(checked) =>
                                      setNewProduct({ ...newProduct, isSold: checked as boolean })
                                    }
                                  />
                                  <Label htmlFor="isSold">Sold</Label>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentStep === 2 && (
                          <div className="space-y-6">
                            <div>
                              <Label>Product Images</Label>
                              <ImageUploadWithPreview
                                images={images}
                                onChange={setImages}
                                maxImages={5}
                              />
                            </div>

                            <div>
                              <Label>Location</Label>
                              <div className="space-y-2">
                                <AddressAutocompleteFree
                                  value={newProduct.location || ""}
                                  onChange={handleAddressChange}
                                  label="Product Location"
                                  placeholder="Enter the product's location"
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
                            </div>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <div className="flex justify-between w-full">
                          <Button 
                            variant="outline" 
                            onClick={() => setCurrentStep(1)}
                            disabled={currentStep === 1}
                          >
                            Previous
                          </Button>
                          {currentStep === 1 ? (
                            <Button 
                              onClick={() => setCurrentStep(2)}
                              className="bg-rose-500 hover:bg-rose-600"
                            >
                              Next
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={() => setIsAddingProduct(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={handleAddProduct}
                                className="bg-rose-500 hover:bg-rose-600"
                                disabled={
                                  isUploading ||
                                  !newProduct.title ||
                                  !newProduct.price ||
                                  !newProduct.categoryId ||
                                  images.length === 0 ||
                                  !addressIsValid ||
                                  !newProduct.latitude ||
                                  !newProduct.longitude
                                }
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  "Add Product"
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {loadingProducts ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>Manage your product listings.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Seller</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Sold</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.filter(Boolean).map((product) => {
                          if (!product) return null;
                          
                          return (
                            <TableRow key={product.id}>
                              <TableCell>
                                {product.primaryImage ? (
                                  <img
                                    src={product.primaryImage}
                                    alt={product.title || "Product image"}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                    <Image className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{product.title || "Untitled"}</TableCell>
                              <TableCell>
                                {(() => {
                                  const category = categories.find(cat => cat.id === product.categoryId);
                                  return category?.name || "Uncategorized";
                                })()}
                              </TableCell>
                              <TableCell>{product.price ? `${product.price} €` : "N/A"}</TableCell>
                              <TableCell>{product.seller?.username || "Unknown"}</TableCell>
                              <TableCell>
                                <Badge variant={product.isActive ? "default" : "secondary"}>
                                  {product.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={product.isSold ? "destructive" : "outline"}>
                                  {product.isSold ? "Sold" : "Available"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {product.createdAt ? formatDistanceToNow(new Date(product.createdAt), { addSuffix: true }) : "N/A"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Dialog
                                    open={editingProduct?.id === product.id}
                                    onOpenChange={(open) => !open && setEditingProduct(null)}
                                  >
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="icon" onClick={() => handleEditProduct(product)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Edit Product</DialogTitle>
                                        <DialogDescription>Modify product details.</DialogDescription>
                                      </DialogHeader>
                                      {editingProduct && (
                                        <div className="grid gap-4 py-4">
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-title" className="text-right">
                                              Title
                                            </Label>
                                            <Input
                                              id="edit-title"
                                              value={editingProduct.title || ""}
                                              onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                                              className="col-span-3"
                                            />
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-description" className="text-right">
                                              Description
                                            </Label>
                                            <Textarea
                                              id="edit-description"
                                              value={editingProduct.description || ""}
                                              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                              className="col-span-3"
                                            />
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-price" className="text-right">
                                              Price
                                            </Label>
                                            <Input
                                              id="edit-price"
                                              type="number"
                                              value={editingProduct.price || 0}
                                              onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                                              className="col-span-3"
                                            />
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-categoryId" className="text-right">
                                              Category
                                            </Label>
                                            <Select
                                              value={editingProduct.categoryId || ""}
                                              onValueChange={(value) => setEditingProduct({ ...editingProduct, categoryId: value })}
                                            >
                                              <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select a category" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {categories.map((category) => (
                                                  <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-condition" className="text-right">
                                              Condition
                                            </Label>
                                            <Select
                                              value={editingProduct.condition || "NEW"}
                                              onValueChange={(value) => setEditingProduct({ ...editingProduct, condition: value })}
                                            >
                                              <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select condition" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="NEW">New</SelectItem>
                                                <SelectItem value="LIKE_NEW">Like New</SelectItem>
                                                <SelectItem value="GOOD">Good</SelectItem>
                                                <SelectItem value="FAIR">Fair</SelectItem>
                                                <SelectItem value="POOR">Poor</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-location" className="text-right">
                                              Location
                                            </Label>
                                            <Input
                                              id="edit-location"
                                              value={editingProduct.location || ""}
                                              onChange={(e) => setEditingProduct({ ...editingProduct, location: e.target.value })}
                                              className="col-span-3"
                                            />
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-status" className="text-right">
                                              Status
                                            </Label>
                                            <div className="col-span-3 flex gap-4">
                                              <div className="flex items-center space-x-2">
                                                <Checkbox
                                                  id="edit-active"
                                                  checked={editingProduct.isActive || false}
                                                  onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isActive: checked as boolean })}
                                                />
                                                <Label htmlFor="edit-active">Active</Label>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <Checkbox
                                                  id="edit-sold"
                                                  checked={editingProduct.isSold || false}
                                                  onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isSold: checked as boolean })}
                                                />
                                                <Label htmlFor="edit-sold">Sold</Label>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setEditingProduct(null)}>
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={handleUpdateProduct}
                                          className="bg-rose-500 hover:bg-rose-600"
                                          disabled={
                                            isUploading ||
                                            !editingProduct?.title ||
                                            !editingProduct?.price ||
                                            !editingProduct?.categoryId ||
                                            !addressIsValid ||
                                            !editingProduct?.latitude ||
                                            !editingProduct?.longitude
                                          }
                                        >
                                          {isUploading ? (
                                            <>
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              Uploading...
                                            </>
                                          ) : (
                                            "Update Product"
                                          )}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>

                                  <Dialog
                                    open={editingProductImages?.id === product.id}
                                    onOpenChange={(open) => !open && setEditingProductImages(null)}
                                  >
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="icon" onClick={() => {
                                        setEditingProductImages(product);
                                        setImages(product.images?.map(img => ({
                                          imageUrl: img.imageUrl,
                                          isPrimary: img.isPrimary,
                                          file: undefined,
                                          preview: img.imageUrl
                                        })) || []);
                                      }}>
                                        <Image className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Update Product Images</DialogTitle>
                                        <DialogDescription>Add or remove product images.</DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-6">
                                        <div>
                                          <Label>Product Images</Label>
                                          <ImageUploadWithPreview
                                            images={images}
                                            onChange={setImages}
                                            maxImages={5}
                                          />
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setEditingProductImages(null)}>
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={handleUpdateProductImages}
                                          className="bg-rose-500 hover:bg-rose-600"
                                          disabled={isUploading || images.length === 0}
                                        >
                                          {isUploading ? (
                                            <>
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              Uploading...
                                            </>
                                          ) : (
                                            "Update Images"
                                          )}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>

                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-rose-500 hover:text-rose-600"
                                    onClick={() => setProductToDelete(product)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          )}

          {/* Placeholder for other tabs */}
          {(activeTab === "messages" || activeTab === "settings") && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  {activeTab === "messages" ? "Messagerie" : "Paramètres"}
                </h2>
                <p className="text-gray-500">Cette section est en cours de développement.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}