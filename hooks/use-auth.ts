"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

type SignUpData = {
  firstName: string
  lastName: string
  email: string
  password: string
  username: string
}

type SignInData = {
  email: string
  password: string
  rememberMe?: boolean
}

export function useAuth() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signUp = async (data: SignUpData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Appel à l'API pour créer un utilisateur
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue lors de l'inscription")
      }

      // Connexion automatique après l'inscription
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        throw new Error("Impossible de vous connecter automatiquement")
      }

      // Redirection vers la page d'accueil
      router.push("/")
      router.refresh()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (data: SignInData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error("Email ou mot de passe incorrect")
      }

      // Redirection vers la page d'accueil
      router.push("/")
      router.refresh()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    signUp,
    login,
    isLoading,
    error,
  }
}
