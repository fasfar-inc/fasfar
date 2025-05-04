import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { CookieConsent } from "@/components/cookie-consent"
import { NextAuthProvider } from "@/providers/session-provider"
import { GeolocationProvider } from "@/components/geolocation-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Fasfar - Achetez et vendez entre particuliers",
  description: "Plateforme d'achat et de vente entre particuliers. Trouvez ce que vous cherchez près de chez vous.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head></head>
      <body className={inter.className}>
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
