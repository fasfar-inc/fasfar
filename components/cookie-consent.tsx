"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté les cookies
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setShowConsent(true)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "all")
    setShowConsent(false)
  }

  const acceptEssential = () => {
    localStorage.setItem("cookie-consent", "essential")
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t shadow-lg p-4 md:p-6 animate-slide-up">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">We respect your privacy</h3>
            <p className="text-sm text-gray-600 mb-2">
              We use cookies to improve your experience, analyze traffic and personalize the
              content. By using our site, you consent to our use of cookies in accordance with our{" "}
              <Link href="/privacy" className="text-rose-500 hover:underline">
                privacy policy
              </Link>
              .
            </p>
            <p className="text-sm text-gray-600">
              <strong>Important note:</strong> Fasfar uses geolocation to show you products nearby. You will be invited to activate it when using the map.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={acceptEssential}>
              Essential cookies only
            </Button>
            <Button className="bg-rose-500 hover:bg-rose-600" onClick={acceptAll}>
              Accept all cookies
            </Button>
          </div>
          <button
            onClick={acceptEssential}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
