"use client"

import { useState, useEffect, useCallback } from "react"

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

// Ajouter une option pour forcer le rafraîchissement de la position
export function useGeolocation(options?: { forceRefresh?: boolean }) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  const getPosition = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }))

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords

          // Sauvegarder dans localStorage avec un timestamp
          localStorage.setItem("user-latitude", latitude.toString())
          localStorage.setItem("user-longitude", longitude.toString())
          localStorage.setItem("geolocation-timestamp", Date.now().toString())

          // Mettre à jour les cookies pour le serveur
          document.cookie = `user-latitude=${latitude}; path=/; max-age=86400`
          document.cookie = `user-longitude=${longitude}; path=/; max-age=86400`

          setState({
            latitude,
            longitude,
            error: null,
            loading: false,
          })
        },
        (error) => {
          let errorMessage = "Erreur de géolocalisation."

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Vous avez refusé l'accès à votre position."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Les informations de localisation ne sont pas disponibles."
              break
            case error.TIMEOUT:
              errorMessage = "La demande de localisation a expiré."
              break
          }

          setState({
            latitude: null,
            longitude: null,
            error: errorMessage,
            loading: false,
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      )
    } else {
      setState({
        latitude: null,
        longitude: null,
        error: "La géolocalisation n'est pas supportée par ce navigateur.",
        loading: false,
      })
    }
  }, [])

  useEffect(() => {
    // Vérifier si on doit forcer le rafraîchissement
    const forceRefresh = options?.forceRefresh || false

    // Essayer d'abord de récupérer depuis localStorage
    const storedLat = localStorage.getItem("user-latitude")
    const storedLng = localStorage.getItem("user-longitude")
    const timestamp = localStorage.getItem("geolocation-timestamp")

    // Vérifier si les données sont récentes (moins de 30 minutes)
    const isRecent = timestamp && Date.now() - Number(timestamp) < 30 * 60 * 1000

    if (storedLat && storedLng && isRecent && !forceRefresh) {
      setState({
        latitude: Number.parseFloat(storedLat),
        longitude: Number.parseFloat(storedLng),
        error: null,
        loading: false,
      })

      // Mettre à jour les cookies pour le serveur
      document.cookie = `user-latitude=${storedLat}; path=/; max-age=86400`
      document.cookie = `user-longitude=${storedLng}; path=/; max-age=86400`
    } else {
      // Si pas dans localStorage ou données trop anciennes, essayer de récupérer via l'API Geolocation
      getPosition()
    }
  }, [getPosition, options?.forceRefresh])

  return { ...state, getPosition }
}
