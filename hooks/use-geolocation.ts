"use client"

import { useState, useEffect } from "react"

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  const getPosition = () => {
    setState((prev) => ({ ...prev, loading: true }))

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords

          // Sauvegarder dans localStorage
          localStorage.setItem("user-latitude", latitude.toString())
          localStorage.setItem("user-longitude", longitude.toString())

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
          setState({
            latitude: null,
            longitude: null,
            error: error.message,
            loading: false,
          })
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
  }

  useEffect(() => {
    // Essayer d'abord de récupérer depuis localStorage
    const storedLat = localStorage.getItem("user-latitude")
    const storedLng = localStorage.getItem("user-longitude")

    if (storedLat && storedLng) {
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
      // Si pas dans localStorage, essayer de récupérer via l'API Geolocation
      getPosition()
    }
  }, [])

  return { ...state, getPosition }
}
