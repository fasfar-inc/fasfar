"use client"

import { useEffect } from "react"
import { useGeolocation } from "@/hooks/use-geolocation"

export function GeolocationProvider() {
  const { latitude, longitude } = useGeolocation()

  useEffect(() => {
    if (latitude && longitude) {
      // Mettre à jour les cookies pour le serveur
      document.cookie = `user-latitude=${latitude}; path=/; max-age=86400`
      document.cookie = `user-longitude=${longitude}; path=/; max-age=86400`
    }
  }, [latitude, longitude])

  return null // Ce composant ne rend rien, il met juste à jour les cookies
}
