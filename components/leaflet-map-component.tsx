"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Mettre à jour l'interface Product pour correspondre à celle de la page map
interface Product {
  id: number
  title: string
  price: number
  location: string
  category: string
  primaryImage: string | null
  latitude: number | null
  longitude: number | null
  coordinates: [number, number] // [latitude, longitude]
  distance: number | null
  seller?: {
    id: number
    username: string
    profileImage: string | null
  }
  createdAt?: string
}

interface LeafletMapComponentProps {
  userLocation: [number, number] | null
  products: Product[]
  selectedProduct: number | null
  setSelectedProduct: (id: number | null) => void
}

// Couleurs par catégorie pour les marqueurs
const categoryColors: Record<string, string> = {
  "real-estate": "#3b82f6", // blue
  vehicles: "#10b981", // green
  phones: "#f43f5e", // rose
  "digital-devices": "#8b5cf6", // purple
  "home-kitchen": "#f59e0b", // amber
  fashion: "#ec4899", // pink
  sports: "#06b6d4", // cyan
  garden: "#84cc16", // lime
}

export function LeafletMapComponent({
  userLocation,
  products,
  selectedProduct,
  setSelectedProduct,
}: LeafletMapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<number, L.Marker>>({})
  const userMarkerRef = useRef<L.Marker | null>(null)
  const userCircleRef = useRef<L.Circle | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapInitialized, setMapInitialized] = useState(false)

  // Fonction pour vérifier si la carte est valide
  const isMapValid = () => {
    return (
      mapRef.current &&
      mapRef.current.getContainer() &&
      document.body.contains(mapRef.current.getContainer()) &&
      mapInitialized
    )
  }

  // Initialiser la carte une fois que le composant est monté côté client
  useEffect(() => {
    if (typeof window !== "undefined" && !mapRef.current && mapContainerRef.current) {
      try {
        // Créer la carte avec un zoom plus faible par défaut
        const map = L.map(mapContainerRef.current).setView(
          userLocation || [35.1264, 33.4299], //  Turkey by default
          userLocation ? 6 : 5, // Zoom more for more products
        )

        // Ajouter la couche de tuiles OpenStreetMap
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map)

        mapRef.current = map

        // Attendre que la carte soit complètement chargée
        map.whenReady(() => {
          setMapReady(true)
          setMapInitialized(true)
        })
      } catch (error) {
        console.error("Error initializing the map:", error)
      }
    }

    // Nettoyer la carte lors du démontage du composant
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove()
        } catch (error) {
          console.error("Error cleaning up the map:", error)
        }
        mapRef.current = null
        setMapInitialized(false)
      }
    }
  }, [userLocation])

  // Ajouter le marqueur de l'utilisateur lorsque sa position est disponible
  useEffect(() => {
    if (!mapReady || !isMapValid()) return

    try {
      // Supprimer les marqueurs précédents
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
        userMarkerRef.current = null
      }
      if (userCircleRef.current) {
        userCircleRef.current.remove()
        userCircleRef.current = null
      }

      // Ajouter le marqueur de l'utilisateur si sa position est disponible
      if (userLocation && mapRef.current) {
        // Créer une icône personnalisée pour la position de l'utilisateur
        const userIcon = L.divIcon({
          className: "user-location-marker",
          html: `
            <div style="
              background-color: #3b82f6;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 0 0 2px #3b82f6;
            "></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        // Ajouter le marqueur
        userMarkerRef.current = L.marker(userLocation, { icon: userIcon })
          .addTo(mapRef.current)
          .bindPopup("<div class='text-center'><strong>Votre position</strong></div>")

        // Ajouter un cercle autour de la position de l'utilisateur
        userCircleRef.current = L.circle(userLocation, {
          radius: 5000, // 5km
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.1,
          weight: 1,
        }).addTo(mapRef.current)

        // Centrer la carte sur la position de l'utilisateur
        mapRef.current.setView(userLocation, 10)
      }
    } catch (error) {
      console.error("Error updating the user marker:", error)
    }
  }, [userLocation, mapReady])

  // Ajouter les marqueurs des produits
  useEffect(() => {
    if (!mapReady || !isMapValid()) return

    try {
      // Supprimer tous les marqueurs existants
      Object.values(markersRef.current).forEach((marker) => {
        try {
          marker.remove()
        } catch (error) {
          console.error("Error deleting a marker:", error)
        }
      })
      markersRef.current = {}

      // Ajouter les nouveaux marqueurs
      if (mapRef.current) {
        products.forEach((product) => {
          // Vérifier que les coordonnées sont valides
          if (!product.latitude || !product.longitude) return

          const isSelected = product.id === selectedProduct
          const color = categoryColors[product.category] || "#f43f5e" // Rose par défaut

          // Créer une icône personnalisée pour le marqueur
          const icon = L.divIcon({
            className: "custom-marker",
            html: `
              <div style="
                background-color: ${color};
                width: ${isSelected ? "36px" : "30px"};
                height: ${isSelected ? "36px" : "30px"};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                border: 2px solid white;
                transform: ${isSelected ? "scale(1.2)" : "scale(1)"};
                transition: transform 0.3s ease;
                cursor: pointer;
              ">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            `,
            iconSize: [isSelected ? 36 : 30, isSelected ? 36 : 30],
            iconAnchor: [isSelected ? 18 : 15, isSelected ? 36 : 30],
            popupAnchor: [0, -30],
          })

          // Modifier la partie qui crée le contenu du popup
          // Chercher la variable popupContent et remplacer par:
          const popupContent = `
            <div class="text-center p-1">
              <h3 class="font-medium text-sm">${product.title}</h3>
              <p class="text-rose-500 font-bold">${product.price.toLocaleString()}€</p>
              <div class="flex items-center justify-center text-xs text-gray-500 mt-1">
                <span class="mr-1">📍</span>
                <span>${product.location}</span>
                ${product.distance !== null ? `<span class="ml-1">(${product.distance < 1 ? `${Math.round(product.distance * 1000)} m` : `${product.distance.toFixed(1)} km`})</span>` : ""}
              </div>
              <a href="/product/${product.id}" class="text-xs text-rose-500 hover:underline block mt-2">
                Voir le produit
              </a>
            </div>
          `

          // Ajouter le marqueur à la carte
          try {
            const marker = L.marker([product.latitude, product.longitude], { icon })
              .addTo(mapRef.current)
              .bindPopup(popupContent)

            // Ajouter un gestionnaire d'événements pour le clic sur le marqueur
            marker.on("click", () => {
              setSelectedProduct(product.id)
            })

            // Stocker le marqueur dans la référence
            markersRef.current[product.id] = marker
          } catch (error) {
            console.error(`Error adding the marker for the product ${product.id}:`, error)
          }
        })

        // Ajuster la vue pour montrer tous les produits
        if (products.length > 0) {
          try {
            // Créer un groupe de tous les marqueurs
            const markers = Object.values(markersRef.current)
            if (markers.length > 0) {
              const group = L.featureGroup(markers)
              mapRef.current.fitBounds(group.getBounds().pad(0.2))

              // Si l'utilisateur a une position, s'assurer qu'elle est visible aussi
              if (userLocation) {
                const allPoints = [...products.map((p) => p.coordinates), userLocation]
                const allMarkers = [...markers]
                if (userMarkerRef.current) {
                  allMarkers.push(userMarkerRef.current)
                }
                const allGroup = L.featureGroup(allMarkers)
                mapRef.current.fitBounds(allGroup.getBounds().pad(0.2))
              }
            }
          } catch (error) {
            console.error("Error adjusting the view:", error)
          }
        }
      }
    } catch (error) {
      console.error("Error updating the markers:", error)
    }
  }, [products, selectedProduct, mapReady, setSelectedProduct, userLocation])

  // Centrer la carte sur le produit sélectionné
  useEffect(() => {
    if (!mapReady || !isMapValid()) return

    try {
      if (selectedProduct !== null && mapRef.current) {
        const product = products.find((p) => p.id === selectedProduct)
        if (product) {
          mapRef.current.flyTo(product.coordinates, 13, {
            animate: true,
            duration: 1,
          })

          // Ouvrir le popup du marqueur sélectionné
          const marker = markersRef.current[selectedProduct]
          if (marker) {
            marker.openPopup()
          }
        }
      } else if (products.length > 0 && mapRef.current) {
        // Si aucun produit n'est sélectionné, ajuster la vue pour montrer tous les produits
        const markers = Object.values(markersRef.current)
        if (markers.length > 0) {
          const group = L.featureGroup(markers)
          mapRef.current.fitBounds(group.getBounds().pad(0.2))
        }
      }
    } catch (error) {
      console.error("Error centering on the selected product:", error)
    }
  }, [selectedProduct, products, mapReady])

  // Fonction pour gérer le redimensionnement de la carte
  useEffect(() => {
    const handleResize = () => {
      if (isMapValid()) {
        try {
          mapRef.current?.invalidateSize()
        } catch (error) {
          console.error("Error resizing the map:", error)
        }
      }
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <div ref={mapContainerRef} className="h-full w-full" />
}
