"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface LocationPickerMapProps {
  latitude: number
  longitude: number
  address?: string
  onLocationChange: (lat: number, lng: number, address?: string) => void
  refreshMap?: boolean
}

export function LocationPickerMap({ latitude, longitude, address, onLocationChange, refreshMap }: LocationPickerMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
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
          [latitude, longitude],
          13 // Zoom plus proche pour une meilleure précision
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
  }, [latitude, longitude])

  // Effect to invalidate map size when refreshMap prop changes (i.e., step changes)
  useEffect(() => {
    if (mapReady && isMapValid() && refreshMap) {
      try {
        mapRef.current?.invalidateSize()
      } catch (error) {
        console.error("Error invalidating map size on refresh:", error)
      }
    }
  }, [refreshMap, mapReady])

  // Ajouter le marqueur de localisation
  useEffect(() => {
    if (!mapReady || !isMapValid()) return

    try {
      // Supprimer le marqueur précédent
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }

      // Ajouter le marqueur si la carte est prête
      if (mapRef.current) {
        // Créer une icône personnalisée pour le marqueur
        const icon = L.divIcon({
          className: "location-marker",
          html: `
            <div style="
              background-color: #f43f5e;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              border: 2px solid white;
              cursor: pointer;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        })

        // Ajouter le marqueur à la carte
        markerRef.current = L.marker([latitude, longitude], { icon })
          .addTo(mapRef.current)
          .bindPopup(address || "Selected location")

        // Centrer la carte sur la position
        mapRef.current.setView([latitude, longitude], 13)
      }
    } catch (error) {
      console.error("Error updating the location marker:", error)
    }
  }, [latitude, longitude, address, mapReady])

  // Gérer les clics sur la carte
  useEffect(() => {
    if (!mapReady || !isMapValid() || !mapRef.current) return

    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng

      // Mettre à jour le marqueur
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      }

      // Essayer d'obtenir l'adresse via reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        )
        const data = await response.json()
        const address = data.display_name

        // Mettre à jour le popup
        if (markerRef.current) {
          markerRef.current.bindPopup(address).openPopup()
        }

        // Notifier le parent du changement
        onLocationChange(lat, lng, address)
      } catch (error) {
        console.error("Error getting address:", error)
        // Si l'adresse ne peut pas être obtenue, utiliser les coordonnées
        onLocationChange(lat, lng)
      }
    }

    mapRef.current.on("click", handleMapClick)

    return () => {
      if (mapRef.current) {
        mapRef.current.off("click", handleMapClick)
      }
    }
  }, [mapReady, onLocationChange])

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

  return <div ref={mapContainerRef} className="h-[400px] w-full rounded-lg overflow-hidden" />
}
