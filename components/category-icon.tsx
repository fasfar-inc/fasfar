import {
    Home,
    Car,
    Smartphone,
    Laptop,
    Utensils,
    Shirt,
    Dumbbell,
    Flower,
    BookOpen,
    Gamepad,
    Package,
  } from "lucide-react"
  
  interface CategoryIconProps {
    category: string
    className?: string
  }
  
  export function CategoryIcon({ category, className = "h-5 w-5" }: CategoryIconProps) {
    switch (category) {
      case "real-estate":
      case "REAL_ESTATE":
        return <Home className={className} />
      case "vehicles":
      case "VEHICLES":
        return <Car className={className} />
      case "phones":
      case "PHONES":
        return <Smartphone className={className} />
      case "digital-devices":
      case "ELECTRONICS":
        return <Laptop className={className} />
      case "home-kitchen":
      case "HOME_KITCHEN":
        return <Utensils className={className} />
      case "fashion":
      case "FASHION":
        return <Shirt className={className} />
      case "sports":
      case "SPORTS":
        return <Dumbbell className={className} />
      case "garden":
      case "GARDEN":
        return <Flower className={className} />
      case "books":
      case "BOOKS":
        return <BookOpen className={className} />
      case "toys":
      case "TOYS":
        return <Gamepad className={className} />
      default:
        return <Package className={className} />
    }
  }
  