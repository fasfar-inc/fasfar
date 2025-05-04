import type {
    User,
    Product,
    ProductImage,
    UserReview,
    Message,
    Transaction,
    Notification,
    SavedSearch,
    UserRole,
    ProductCategory,
    ProductCondition,
    PaymentMethod,
  } from "@prisma/client"
  
  // Types pour les réponses API
  export type UserResponse = Omit<User, "passwordHash"> & {
    rating?: number
    reviewsCount?: number
    productsCount?: number
    successfulSales?: number
  }
  
  export type ProductWithImages = Product & {
    images: ProductImage[]
    primaryImage?: string
  }
  
  export type ProductResponse = ProductWithImages & {
    seller: UserResponse
    favoritesCount?: number
    isFavorited?: boolean
    distance?: number // Distance en km par rapport à l'utilisateur
  }
  
  export type UserReviewResponse = UserReview & {
    reviewer: UserResponse
    user: UserResponse
  }
  
  export type MessageResponse = Message & {
    sender: UserResponse
    receiver: UserResponse
    product?: ProductResponse
  }
  
  export type TransactionResponse = Transaction & {
    product: ProductResponse
    buyer: UserResponse
    seller: UserResponse
    reviews: UserReviewResponse[]
  }
  
  export type NotificationResponse = Notification & {
    relatedProduct?: ProductResponse
    relatedTransaction?: TransactionResponse
  }
  
  export type SavedSearchResponse = SavedSearch & {
    users: UserResponse[]
  }
  
  // Types pour les requêtes API
  export type UserCreateInput = {
    username: string
    email: string
    password: string
    firstName?: string
    lastName?: string
    phone?: string
    address?: string
    city?: string
    postalCode?: string
    bio?: string
    role?: UserRole
  }
  
  export type UserUpdateInput = Partial<Omit<UserCreateInput, "password">> & {
    profileImage?: string
    isActive?: boolean
  }
  
  export type ProductCreateInput = {
    title: string
    description?: string
    price: number
    category: ProductCategory
    condition: ProductCondition
    location?: string
    latitude?: number
    longitude?: number
    images: { imageUrl: string; isPrimary?: boolean }[]
  }
  
  export type ProductUpdateInput = Partial<Omit<ProductCreateInput, "images">> & {
    isActive?: boolean
    isSold?: boolean
  }
  
  export type UserReviewCreateInput = {
    userId: number
    rating: number
    comment?: string
    transactionId?: number
  }
  
  export type MessageCreateInput = {
    receiverId: number
    content: string
    productId?: number
  }
  
  export type TransactionCreateInput = {
    productId: number
    buyerId: number
    sellerId: number
    price: number
    paymentMethod: PaymentMethod
    meetingLocation?: string
    meetingTime?: Date
  }
  
  export type SavedSearchCreateInput = {
    name: string
    category?: ProductCategory
    minPrice?: number
    maxPrice?: number
    location?: string
    radius?: number
    keywords?: string
  }
  
  // Types pour les filtres de recherche
  export type ProductFilterInput = {
    category?: ProductCategory
    minPrice?: number
    maxPrice?: number
    condition?: ProductCondition
    location?: string
    distance?: number
    latitude?: number
    longitude?: number
    sellerId?: number
    search?: string
    sortBy?: "price_asc" | "price_desc" | "date_desc" | "date_asc" | "distance"
    page?: number
    limit?: number
  }
  