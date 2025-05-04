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
    Music,
    Camera,
    Tv,
    Gift,
    Baby,
    Briefcase,
    Palette,
    type LucideIcon,
  } from "lucide-react"
  
  export interface IconDefinition {
    icon: LucideIcon
    name: string
    label: string
    color: string
    category: string
  }
  
  export const ICON_MAP: Record<string, IconDefinition> = {
    home: {
      icon: Home,
      name: "home",
      label: "Maison",
      color: "bg-blue-100 text-blue-700",
      category: "Real Estate"
    },
    car: {
      icon: Car,
      name: "car",
      label: "Voiture",
      color: "bg-red-100 text-red-700",
      category: "Vehicles"
    },
    smartphone: {
      icon: Smartphone,
      name: "smartphone",
      label: "Téléphone",
      color: "bg-green-100 text-green-700",
      category: "Electronics"
    },
    laptop: {
      icon: Laptop,
      name: "laptop",
      label: "Ordinateur",
      color: "bg-purple-100 text-purple-700",
      category: "Electronics"
    },
    utensils: {
      icon: Utensils,
      name: "utensils",
      label: "Cuisine",
      color: "bg-yellow-100 text-yellow-700",
      category: "Home & Kitchen"
    },
    shirt: {
      icon: Shirt,
      name: "shirt",
      label: "Mode",
      color: "bg-pink-100 text-pink-700",
      category: "Fashion"
    },
    dumbbell: {
      icon: Dumbbell,
      name: "dumbbell",
      label: "Sport",
      color: "bg-orange-100 text-orange-700",
      category: "Sports"
    },
    flower: {
      icon: Flower,
      name: "flower",
      label: "Jardin",
      color: "bg-emerald-100 text-emerald-700",
      category: "Garden"
    },
    book: {
      icon: BookOpen,
      name: "book",
      label: "Livres",
      color: "bg-indigo-100 text-indigo-700",
      category: "Books"
    },
    gamepad: {
      icon: Gamepad,
      name: "gamepad",
      label: "Jeux",
      color: "bg-cyan-100 text-cyan-700",
      category: "Games"
    },
    music: {
      icon: Music,
      name: "music",
      label: "Musique",
      color: "bg-violet-100 text-violet-700",
      category: "Music"
    },
    camera: {
      icon: Camera,
      name: "camera",
      label: "Photo",
      color: "bg-amber-100 text-amber-700",
      category: "Electronics"
    },
    tv: {
      icon: Tv,
      name: "tv",
      label: "TV & Vidéo",
      color: "bg-slate-100 text-slate-700",
      category: "Electronics"
    },
    gift: {
      icon: Gift,
      name: "gift",
      label: "Cadeaux",
      color: "bg-rose-100 text-rose-700",
      category: "Gifts"
    },
    baby: {
      icon: Baby,
      name: "baby",
      label: "Bébé",
      color: "bg-sky-100 text-sky-700",
      category: "Baby"
    },
    briefcase: {
      icon: Briefcase,
      name: "briefcase",
      label: "Pro",
      color: "bg-gray-100 text-gray-700",
      category: "Professional"
    },
    palette: {
      icon: Palette,
      name: "palette",
      label: "Art",
      color: "bg-fuchsia-100 text-fuchsia-700",
      category: "Art"
    },
    package: {
      icon: Package,
      name: "package",
      label: "Divers",
      color: "bg-neutral-100 text-neutral-700",
      category: "Other"
    }
  }
  
  // Fonction pour obtenir un composant d'icône à partir de son nom
  export function getDynamicIcon(iconName: string): LucideIcon | null {
    const normalizedName = iconName.toLowerCase()
    return ICON_MAP[normalizedName]?.icon || null
  }
  
  export function getIconColor(iconName: string): string {
    const normalizedName = iconName.toLowerCase()
    return ICON_MAP[normalizedName]?.color || "bg-gray-100 text-gray-700"
  }
  
  export function getIconLabel(iconName: string): string {
    const normalizedName = iconName.toLowerCase()
    return ICON_MAP[normalizedName]?.label || iconName
  }
  
  // Exporter la liste des icônes disponibles pour l'interface d'administration
  export const availableIcons = Object.values(ICON_MAP).map(def => ({
    name: def.name,
    label: def.label,
    color: def.color,
    category: def.category
  }))
  