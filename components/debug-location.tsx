"use client"

import { useEffect, useState } from "react"

export function DebugLocation() {
  const [debug, setDebug] = useState<any>({})

  useEffect(() => {
    // Récupérer les données de localStorage
    const storedLat = localStorage.getItem("user-latitude")
    const storedLng = localStorage.getItem("user-longitude")

    // Récupérer les cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift()
      return null
    }

    const cookieLat = getCookie("user-latitude")
    const cookieLng = getCookie("user-longitude")

    setDebug({
      localStorage: {
        lat: storedLat,
        lng: storedLng,
      },
      cookies: {
        lat: cookieLat,
        lng: cookieLng,
      },
    })
  }, [])

  return (
    <div className="hidden">
      <pre>{JSON.stringify(debug, null, 2)}</pre>
    </div>
  )
}
