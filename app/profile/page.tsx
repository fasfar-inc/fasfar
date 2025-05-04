"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Star, Package, MapPin, Calendar, Edit, Save, X, Plus, Pencil, Trash2, Eye } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { UserResponse, ProductResponse } from "@/lib/types"
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
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { data: session, status } = useSession()
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

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Charger les données de l'utilisateur
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
      console.error("Erreur lors du chargement des données utilisateur:", error)
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
      console.error("Erreur lors du chargement des produits:", error)
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
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setIsEditing(false)
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Erreur",
          description: error.error || "Une erreur est survenue lors de la mise à jour du profil",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Supprimer un produit
  const handleDeleteProduct = async () => {
    if (!deleteProductId) return

    try {
      const response = await fetch(`/api/products/${deleteProductId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Mettre à jour la liste des produits
        setUserProducts(userProducts.filter((product) => product.id !== deleteProductId))
        toast({
          title: "Produit supprimé",
          description: "Votre produit a été supprimé avec succès.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Erreur",
          description: error.error || "Une erreur est survenue lors de la suppression du produit",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du produit",
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
        <Card>
          <CardHeader>
            <CardTitle>Profil non trouvé</CardTitle>
            <CardDescription>
              Impossible de charger les informations du profil. Veuillez vous connecter.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/login")}>Se connecter</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Mon profil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte de profil */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Informations personnelles</CardTitle>
              {!isEditing ? (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.profileImage || "/placeholder.svg?height=96&width=96"} alt={user.username} />
                    <AvatarFallback>{user.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold">{user.username}</h2>
                    <p className="text-muted-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                    {user.isVerified && (
                      <Badge variant="outline" className="mt-2 bg-green-50 text-green-600 border-green-200">
                        Vérifié
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="font-medium">
                      {(user.rating ?? 0).toFixed(1)} ({user.reviewsCount ?? 0} avis)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    <span>
                      {user.productsCount} produit{user.productsCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {user.city && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{user.city}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      Membre depuis{" "}
                      {format(new Date(user.createdAt), "MMMM yyyy", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                </div>

                {user.bio && (
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">À propos</h3>
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Contact</h3>
                  <div className="space-y-1 text-sm">
                    <p>Email: {user.email}</p>
                    {user.phone && <p>Téléphone: {user.phone}</p>}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={formData.profileImage || "/placeholder.svg?height=96&width=96"}
                      alt={user.username}
                    />
                    <AvatarFallback>{user.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="w-full">
                    <Label htmlFor="profileImage">URL de l'image de profil</Label>
                    <Input
                      id="profileImage"
                      name="profileImage"
                      value={formData.profileImage}
                      onChange={handleInputChange}
                      placeholder="URL de l'image"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={4} />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="products">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products">Mes produits</TabsTrigger>
              <TabsTrigger value="reviews">Avis reçus</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Mes annonces</h2>
                <Button onClick={() => router.push("/product/new")} className="bg-rose-500 hover:bg-rose-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une annonce
                </Button>
              </div>

              {userProducts.length > 0 ? (
                <div className="space-y-4">
                  {userProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/4 h-40 md:h-auto">
                          <img
                            src={product.primaryImage || "/placeholder.svg?height=200&width=200"}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">{product.title}</h3>
                                <p className="text-xl font-bold text-rose-500 mt-1">
                                  {product.price.toLocaleString()} €
                                </p>
                              </div>
                              <Badge
                                variant={product.isSold ? "destructive" : product.isActive ? "default" : "outline"}
                              >
                                {product.isSold ? "Vendu" : product.isActive ? "Actif" : "Inactif"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description}</p>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="line-clamp-1">{product.location || "Emplacement non spécifié"}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => router.push(`/product/${product.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/product/edit/${product.id}`)}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Modifier
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => setDeleteProductId(product.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Aucun produit</CardTitle>
                    <CardDescription>Vous n'avez pas encore mis de produits en vente.</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button onClick={() => router.push("/product/new")} className="bg-rose-500 hover:bg-rose-600">
                      Vendre un article
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Avis reçus</CardTitle>
                  <CardDescription>Les avis laissés par d'autres utilisateurs sur vos transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Fonctionnalité en cours de développement.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Boîte de dialogue de confirmation de suppression */}
      <AlertDialog open={deleteProductId !== null} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le produit sera définitivement supprimé de la plateforme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
