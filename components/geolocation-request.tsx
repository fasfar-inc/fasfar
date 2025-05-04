"use client"

import { useState } from "react"
import { MapPin, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface GeolocationRequestProps {
  onAccept: (position: [number, number]) => void
  onDecline: () => void
}

export function GeolocationRequest({ onAccept, onDecline }: GeolocationRequestProps) {
  const [open, setOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAccept = () => {
    setLoading(true)
    setError(null)

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false)
          setOpen(false)
          onAccept([position.coords.latitude, position.coords.longitude])
        },
        (err) => {
          setLoading(false)
          let errorMessage = "La géolocalisation n'est pas disponible."

          // Messages d'erreur plus spécifiques
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage =
                "Vous avez refusé l'accès à votre position. Veuillez l'activer dans les paramètres de votre navigateur."
              break
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Les informations de localisation ne sont pas disponibles."
              break
            case err.TIMEOUT:
              errorMessage = "La demande de localisation a expiré."
              break
          }

          setError(errorMessage)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    } else {
      setLoading(false)
      setError("La géolocalisation n'est pas supportée par votre navigateur.")
    }
  }

  const handleDecline = () => {
    setOpen(false)
    onDecline()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md geolocation-dialog">
        <DialogHeader>
          <DialogTitle>Autoriser la géolocalisation</DialogTitle>
          <DialogDescription>
            Fasfar utilise votre position pour vous montrer les produits à proximité et améliorer votre expérience.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="rounded-full bg-rose-100 p-3 mb-4">
            <MapPin className="h-8 w-8 text-rose-500" />
          </div>
          <p className="text-center text-sm text-gray-500">
            En autorisant la géolocalisation, vous pourrez voir les produits près de chez vous et filtrer les résultats
            par distance.
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={handleDecline}>
            Continuer sans localisation
          </Button>
          <Button className="bg-rose-500 hover:bg-rose-600" onClick={handleAccept} disabled={loading}>
            {loading ? "Localisation en cours..." : "Autoriser la localisation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
