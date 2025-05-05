import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { CookieConsent } from "@/components/cookie-consent"
import { NextAuthProvider } from "@/providers/session-provider"
import { GeolocationProvider } from "@/components/geolocation-provider"
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Fasfar - Buy and sell directly between individuals",
  description: "Platform for buying and selling between individuals. Find what you're looking for near you.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body className={inter.className}>
        <Toaster />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <NextAuthProvider>
            <GeolocationProvider />
            {children}
            <CookieConsent />
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
