"use client"

import { useState } from "react"
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
} from "lucide-react"

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

// Types
interface Category {
  id: string
  name: string
  icon: string
  productCount: number
}

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  joinDate: string
  avatar?: string
}

interface Product {
  id: number
  title: string
  price: number
  category: string
  seller: string
  status: string
  date: string
}

// Données fictives
const categories: Category[] = [
  { id: "real-estate", name: "Immobilier", icon: "Home", productCount: 245 },
  { id: "vehicles", name: "Véhicules", icon: "Car", productCount: 189 },
  { id: "phones", name: "Téléphones", icon: "Smartphone", productCount: 312 },
  { id: "digital-devices", name: "Appareils numériques", icon: "Laptop", productCount: 178 },
  { id: "home-kitchen", name: "Maison et Cuisine", icon: "Utensils", productCount: 203 },
  { id: "fashion", name: "Mode", icon: "Shirt", productCount: 267 },
  { id: "sports", name: "Sports & Loisirs", icon: "Dumbbell", productCount: 156 },
  { id: "garden", name: "Jardin", icon: "Flower", productCount: 98 },
]

const users: User[] = [
  {
    id: "u1",
    name: "Sophie Martin",
    email: "sophie.martin@example.com",
    role: "Admin",
    status: "Active",
    joinDate: "12/04/2023",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "u2",
    name: "Thomas Dubois",
    email: "thomas.dubois@example.com",
    role: "Moderator",
    status: "Active",
    joinDate: "23/05/2023",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "u3",
    name: "Julie Leroy",
    email: "julie.leroy@example.com",
    role: "User",
    status: "Suspended",
    joinDate: "05/01/2023",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "u4",
    name: "Nicolas Bernard",
    email: "nicolas.bernard@example.com",
    role: "User",
    status: "Active",
    joinDate: "17/08/2023",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "u5",
    name: "Emma Petit",
    email: "emma.petit@example.com",
    role: "Moderator",
    status: "Active",
    joinDate: "30/09/2023",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const products: Product[] = [
  {
    id: 1,
    title: "iPhone 16 Pro - 256GB",
    price: 999,
    category: "phones",
    seller: "Marie D.",
    status: "Active",
    date: "Il y a 2 jours",
  },
  {
    id: 2,
    title: "Appartement 2 pièces - 45m²",
    price: 295000,
    category: "real-estate",
    seller: "Thomas L.",
    status: "Pending",
    date: "Il y a 5 jours",
  },
  {
    id: 3,
    title: "Renault Clio 2022 - 15000km",
    price: 14500,
    category: "vehicles",
    seller: "Sophie M.",
    status: "Active",
    date: "Aujourd'hui",
  },
  {
    id: 4,
    title: "MacBook Air M3 - 512GB",
    price: 1299,
    category: "digital-devices",
    seller: "Pierre D.",
    status: "Active",
    date: "Il y a 1 jour",
  },
  {
    id: 5,
    title: "Robot Cuisine Multifonction",
    price: 349,
    category: "home-kitchen",
    seller: "Julie R.",
    status: "Sold",
    date: "Il y a 3 jours",
  },
]

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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState<Partial<Category>>({ name: "", icon: "Home" })
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filtrer les catégories en fonction de la recherche
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Gérer l'édition d'une catégorie
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
  }

  // Gérer la sauvegarde d'une catégorie éditée
  const handleSaveCategory = () => {
    // Dans une vraie application, vous enverriez ces données à votre API
    console.log("Catégorie sauvegardée:", editingCategory)
    setEditingCategory(null)
  }

  // Gérer l'ajout d'une nouvelle catégorie
  const handleAddCategory = () => {
    // Dans une vraie application, vous enverriez ces données à votre API
    console.log("Nouvelle catégorie:", {
      ...newCategory,
      id: `cat-${Date.now()}`,
      productCount: 0,
    })
    setIsAddingCategory(false)
    setNewCategory({ name: "", icon: "Home" })
  }

  return (
    <div className="flex h-screen bg-gray-100">
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

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center w-full p-2 rounded-md ${activeTab === "dashboard" ? "bg-rose-50 text-rose-600" : "hover:bg-gray-100"} ${!sidebarOpen && "justify-center"}`}
              >
                <LayoutDashboard className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Tableau de bord</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("products")}
                className={`flex items-center w-full p-2 rounded-md ${activeTab === "products" ? "bg-rose-50 text-rose-600" : "hover:bg-gray-100"} ${!sidebarOpen && "justify-center"}`}
              >
                <Package className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Produits</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("categories")}
                className={`flex items-center w-full p-2 rounded-md ${activeTab === "categories" ? "bg-rose-50 text-rose-600" : "hover:bg-gray-100"} ${!sidebarOpen && "justify-center"}`}
              >
                <ShoppingBag className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Catégories</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("users")}
                className={`flex items-center w-full p-2 rounded-md ${activeTab === "users" ? "bg-rose-50 text-rose-600" : "hover:bg-gray-100"} ${!sidebarOpen && "justify-center"}`}
              >
                <Users className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Utilisateurs</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("messages")}
                className={`flex items-center w-full p-2 rounded-md ${activeTab === "messages" ? "bg-rose-50 text-rose-600" : "hover:bg-gray-100"} ${!sidebarOpen && "justify-center"}`}
              >
                <MessageSquare className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Messages</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center w-full p-2 rounded-md ${activeTab === "settings" ? "bg-rose-50 text-rose-600" : "hover:bg-gray-100"} ${!sidebarOpen && "justify-center"}`}
              >
                <Settings className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Paramètres</span>}
              </button>
            </li>
          </ul>
        </nav>

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
            <h1 className="text-xl font-semibold">
              {activeTab === "dashboard" && "Tableau de bord"}
              {activeTab === "products" && "Gestion des produits"}
              {activeTab === "categories" && "Gestion des catégories"}
              {activeTab === "users" && "Gestion des utilisateurs"}
              {activeTab === "messages" && "Messages"}
              {activeTab === "settings" && "Paramètres"}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input type="search" placeholder="Rechercher..." className="pl-10 pr-4 w-64" />
            </div>

            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block font-medium">Admin</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profil</DropdownMenuItem>
                <DropdownMenuItem>Paramètres</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Déconnexion</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Produits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,248</div>
                    <p className="text-xs text-green-500 flex items-center mt-1">+12% depuis le mois dernier</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Utilisateurs Actifs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3,427</div>
                    <p className="text-xs text-green-500 flex items-center mt-1">+8% depuis le mois dernier</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Ventes Réalisées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">842</div>
                    <p className="text-xs text-green-500 flex items-center mt-1">+23% depuis le mois dernier</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Messages Non Lus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-rose-500 flex items-center mt-1">+5 nouveaux aujourd'hui</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Produits Récents</CardTitle>
                    <CardDescription>Les 5 derniers produits ajoutés</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead>Prix</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.title}</TableCell>
                            <TableCell>{product.price.toLocaleString()}€</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  product.status === "Active"
                                    ? "bg-green-50 text-green-600 border-green-200"
                                    : product.status === "Pending"
                                      ? "bg-amber-50 text-amber-600 border-amber-200"
                                      : "bg-blue-50 text-blue-600 border-blue-200"
                                }
                              >
                                {product.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Voir tous les produits
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Utilisateurs Récents</CardTitle>
                    <CardDescription>Les 5 derniers utilisateurs inscrits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Utilisateur</TableHead>
                          <TableHead>Rôle</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                  <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                {user.name}
                              </div>
                            </TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  user.status === "Active"
                                    ? "bg-green-50 text-green-600 border-green-200"
                                    : "bg-rose-50 text-rose-600 border-rose-200"
                                }
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Voir tous les utilisateurs
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}

          {/* Categories */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Rechercher une catégorie..."
                    className="pl-10 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                  <DialogTrigger asChild>
                    <Button className="bg-rose-500 hover:bg-rose-600">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Ajouter une catégorie
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
                      <DialogDescription>Créez une nouvelle catégorie pour organiser les produits.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Nom
                        </Label>
                        <Input
                          id="name"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="icon" className="text-right">
                          Icône
                        </Label>
                        <Select
                          value={newCategory.icon}
                          onValueChange={(value) => setNewCategory({ ...newCategory, icon: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Sélectionner une icône" />
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
                        Annuler
                      </Button>
                      <Button
                        onClick={handleAddCategory}
                        className="bg-rose-500 hover:bg-rose-600"
                        disabled={!newCategory.name}
                      >
                        Ajouter
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Catégories</CardTitle>
                  <CardDescription>Gérez les catégories de produits disponibles sur votre plateforme.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Icône</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Produits</TableHead>
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
                          <TableCell className="text-gray-500">{category.id}</TableCell>
                          <TableCell>{category.productCount}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog
                                open={editingCategory?.id === category.id}
                                onOpenChange={(open) => !open && setEditingCategory(null)}
                              >
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="icon" onClick={() => handleEditCategory(category)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Modifier la catégorie</DialogTitle>
                                    <DialogDescription>Modifiez les détails de la catégorie.</DialogDescription>
                                  </DialogHeader>
                                  {editingCategory && (
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-name" className="text-right">
                                          Nom
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
                                        <Label htmlFor="edit-icon" className="text-right">
                                          Icône
                                        </Label>
                                        <Select
                                          value={editingCategory.icon}
                                          onValueChange={(value) =>
                                            setEditingCategory({ ...editingCategory, icon: value })
                                          }
                                        >
                                          <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Sélectionner une icône" />
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
                                  )}
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setEditingCategory(null)}>
                                      Annuler
                                    </Button>
                                    <Button
                                      onClick={handleSaveCategory}
                                      className="bg-rose-500 hover:bg-rose-600"
                                      disabled={!editingCategory?.name}
                                    >
                                      Sauvegarder
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Button variant="outline" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>

                              <Button variant="outline" size="icon" className="text-rose-500 hover:text-rose-600">
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
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input type="search" placeholder="Rechercher un utilisateur..." className="pl-10 pr-4" />
                </div>

                <Button className="bg-rose-500 hover:bg-rose-600">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter un utilisateur
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Utilisateurs</CardTitle>
                  <CardDescription>Gérez les utilisateurs de votre plateforme.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date d'inscription</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                user.role === "Admin"
                                  ? "bg-purple-50 text-purple-600 border-purple-200"
                                  : user.role === "Moderator"
                                    ? "bg-blue-50 text-blue-600 border-blue-200"
                                    : "bg-gray-50 text-gray-600 border-gray-200"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                user.status === "Active"
                                  ? "bg-green-50 text-green-600 border-green-200"
                                  : "bg-rose-50 text-rose-600 border-rose-200"
                              }
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.joinDate}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                                <DropdownMenuItem>Modifier</DropdownMenuItem>
                                <DropdownMenuItem>Changer le rôle</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-rose-500">Suspendre</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input type="search" placeholder="Rechercher un produit..." className="pl-10 pr-4" />
                </div>

                <Button className="bg-rose-500 hover:bg-rose-600">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Produits</CardTitle>
                  <CardDescription>Gérez les produits disponibles sur votre plateforme.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <div className="flex items-center">
                            Titre
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center">
                            Prix
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Vendeur</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.title}</TableCell>
                          <TableCell>{product.price.toLocaleString()}€</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.seller}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                product.status === "Active"
                                  ? "bg-green-50 text-green-600 border-green-200"
                                  : product.status === "Pending"
                                    ? "bg-amber-50 text-amber-600 border-amber-200"
                                    : "bg-blue-50 text-blue-600 border-blue-200"
                              }
                            >
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{product.date}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Voir le produit</DropdownMenuItem>
                                <DropdownMenuItem>Modifier</DropdownMenuItem>
                                <DropdownMenuItem>Changer le statut</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-rose-500">Supprimer</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
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