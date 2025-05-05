"use client"

import { useState, useEffect } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

// Ajouter l'import du hook useGeolocation
import { useGeolocation } from "@/hooks/use-geolocation"

interface GeolocationRequestProps {
  onAccept: (position: [number, number]) => void
  onDecline: () => void
}

// Dans la fonction GeolocationRequest, ajouter l'utilisation du hook
export function GeolocationRequest({ onAccept, onDecline }: GeolocationRequestProps) {
  const [isOpen, setIsOpen] = useState(true)
  const { latitude, longitude, error, loading, getPosition } = useGeolocation({ forceRefresh: true })

  // Effet pour appeler onAccept quand la position est disponible
  useEffect(() => {
    if (latitude !== null && longitude !== null && !error) {
      onAccept([latitude, longitude])
    }
  }, [latitude, longitude, error, onAccept])

  // Gérer le refus
  const handleDecline = () => {
    setIsOpen(false)
    onDecline()
  }

  // Si la position est en cours de chargement ou déjà obtenue, ne pas afficher la popup
  if (loading || (latitude !== null && longitude !== null)) {
    return null
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Enable geolocation</h2>
        <p className="mb-4">
          To show you products nearby and calculate distances, we need your location.
        </p>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleDecline}>
            No thanks
          </Button>
          <Button onClick={getPosition}>
            <MapPin className="h-4 w-4 mr-2" />
            Allow
          </Button>
        </div>
      </div>
    </div>
  )
}
