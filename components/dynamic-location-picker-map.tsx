"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Dynamically import the LocationPickerMap component with no SSR
const LocationPickerMap = dynamic(() => import("./location-picker-map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
    </div>
  ),
})

export default LocationPickerMap 