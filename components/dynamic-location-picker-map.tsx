"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Dynamically import the LocationPickerMap component with no SSR
const LocationPickerMap = dynamic(() => import("./location-picker-map"), {
  ssr: false,
  loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-2 text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
  ),
})

export default LocationPickerMap 