import {
    Building2,
    Car,
    Home,
    Smartphone,
    Tv,
    Shirt,
    Dumbbell,
    Flower,
    ShoppingBag,
    Laptop,
    Book,
    Music,
    Gift,
    Baby,
    Briefcase,
    Palette,
    Utensils,
    Sofa,
    Headphones,
    Camera,
    Watch,
    Gamepad,
    Bike,
    Plane,
    Leaf,
    Scissors,
    Heart,
    PawPrint,
    type LucideIcon,
  } from "lucide-react"
  
  // Mapping des noms d'icônes aux composants Lucide
  const iconMap: Record<string, LucideIcon> = {
    building: Building2,
    car: Car,
    home: Home,
    smartphone: Smartphone,
    tv: Tv,
    shirt: Shirt,
    dumbbell: Dumbbell,
    flower: Flower,
    shopping: ShoppingBag,
    laptop: Laptop,
    book: Book,
    music: Music,
    gift: Gift,
    baby: Baby,
    briefcase: Briefcase,
    palette: Palette,
    utensils: Utensils,
    sofa: Sofa,
    headphones: Headphones,
    camera: Camera,
    watch: Watch,
    gamepad: Gamepad,
    bike: Bike,
    plane: Plane,
    leaf: Leaf,
    scissors: Scissors,
    heart: Heart,
    paw: PawPrint,
  }
  
  // Fonction pour obtenir un composant d'icône à partir de son nom
  export function getDynamicIcon(iconName: string): LucideIcon {
    return iconMap[iconName.toLowerCase()] || ShoppingBag
  }
  
  // Exporter la liste des icônes disponibles pour l'interface d'administration
  export function getAvailableIcons(): { name: string; component: LucideIcon }[] {
    return Object.entries(iconMap).map(([name, component]) => ({
      name,
      component,
    }))
  }
  