"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string, lat?: number, lng?: number) => void
  label?: string
  placeholder?: string
  required?: boolean
  onValidationChange?: (isValid: boolean) => void
}

interface NominatimResult {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  boundingbox: string[]
  lat: string
  lon: string
  display_name: string
  class: string
  type: string
  importance: number
}

export default function AddressAutocompleteFree({
  value,
  onChange,
  label = "Adresse",
  placeholder = "Entrez votre adresse",
  required = false,
  onValidationChange,
}: AddressAutocompleteProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [addressValidated, setAddressValidated] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [manuallyEdited, setManuallyEdited] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Fermer les suggestions si on clique en dehors
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)

        // Si l'adresse a été modifiée manuellement et n'a pas été validée
        if (manuallyEdited && !addressValidated && value.trim().length > 0) {
          setShowWarning(true)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [manuallyEdited, addressValidated, value])

  // Notifier le parent du changement de validation
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(addressValidated)
    }
  }, [addressValidated, onValidationChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onChange(value)
    setManuallyEdited(true)
    setAddressValidated(false)
    setShowWarning(false)

    // Annuler la recherche précédente
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Attendre que l'utilisateur ait fini de taper
    if (value.length > 2) {
      const timeout = setTimeout(async () => {
        setIsLoading(true)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              value,
            )}&countrycodes=fr&limit=5`,
            {
              headers: {
                "Accept-Language": "fr",
              },
            },
          )
          const data: NominatimResult[] = await response.json()
          setSuggestions(data)
          setShowSuggestions(data.length > 0)

          // Si aucune suggestion n'est trouvée et que l'utilisateur a saisi quelque chose
          if (data.length === 0 && value.trim().length > 0) {
            setShowWarning(true)
          } else {
            setShowWarning(false)
          }
        } catch (error) {
          console.error("Erreur lors de la recherche d'adresses:", error)
          setShowWarning(true)
        } finally {
          setIsLoading(false)
        }
      }, 500) // Délai de 500ms pour éviter trop de requêtes

      setSearchTimeout(timeout)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (result: NominatimResult) => {
    onChange(result.display_name, Number.parseFloat(result.lat), Number.parseFloat(result.lon))
    setShowSuggestions(false)
    setAddressValidated(true)
    setShowWarning(false)
    setManuallyEdited(false)
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          // Faire une géocodage inverse pour obtenir l'adresse
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  "Accept-Language": "fr",
                },
              },
            )
            const data = await response.json()
            setIsLoading(false)
            if (data && data.display_name) {
              onChange(data.display_name, latitude, longitude)
              setAddressValidated(true)
              setShowWarning(false)
              setManuallyEdited(false)
            } else {
              setShowWarning(true)
              alert("Impossible de déterminer votre adresse. Veuillez l'entrer manuellement.")
            }
          } catch (error) {
            setIsLoading(false)
            console.error("Erreur lors du géocodage inverse:", error)
            setShowWarning(true)
            alert("Impossible de déterminer votre adresse. Veuillez l'entrer manuellement.")
          }
        },
        (error) => {
          setIsLoading(false)
          console.error("Erreur de géolocalisation:", error)
          setShowWarning(true)
          alert("Impossible d'obtenir votre position. Veuillez entrer votre adresse manuellement.")
        },
      )
    } else {
      setShowWarning(true)
      alert("La géolocalisation n'est pas prise en charge par votre navigateur.")
    }
  }

  return (
    <div className="relative space-y-2">
      <Label htmlFor="address">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex mt-1.5">
        <Input
          ref={inputRef}
          id="address"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="rounded-r-none"
          onFocus={() => value.length > 2 && setShowSuggestions(suggestions.length > 0)}
          required={required}
        />
        <Button
          type="button"
          variant="default"
          className="rounded-l-none border-l-0 bg-rose-500 hover:bg-rose-600"
          onClick={handleUseCurrentLocation}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" /> Ma position
            </>
          )}
        </Button>
      </div>

      {showWarning && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Cette adresse ne semble pas valide. Veuillez sélectionner une adresse dans la liste des suggestions ou
            utiliser votre position actuelle pour une meilleure précision.
          </AlertDescription>
        </Alert>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border"
        >
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              className="cursor-pointer select-none relative py-2 px-4 hover:bg-gray-100"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span className="block truncate">{suggestion.display_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
