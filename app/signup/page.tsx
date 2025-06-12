"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, ShoppingBag } from 'lucide-react'
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Footer } from "@/components/footer"
import { useAuth } from "@/hooks/use-auth"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agreeTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { signUp, isLoading, error: authError } = useAuth()
  const [socialLoading, setSocialLoading] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Effacer l'erreur lorsque l'utilisateur commence à corriger
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "The first name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "The last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "The email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "The email is not valid"
    }

    if (!formData.password) {
      newErrors.password = "The password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "The password must contain at least 8 characters"
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must accept the terms of use"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      await signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        username: `${formData.firstName.toLowerCase()}_${Math.floor(Math.random() * 1000)}`, // Génère un nom d'utilisateur par défaut
      })
    }
  }

  // const handleSocialLogin = async (provider: string) => {
  //   try {
  //     setSocialLoading(provider)
  //     await signIn(provider, { callbackUrl: "/" })
  //   } catch (error) {
  //     console.error(`Error connecting with ${provider}:`, error)
  //   } finally {
  //     setSocialLoading(null)
  //   }
  // }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="fasfar" width={100} height={100} />
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Already registered ? Login
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-lg mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold">Create an account</h1>
              <p className="text-gray-500 mt-1">Join the Fasfar community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-red-500 text-xs">{errors.password}</p>
                ) : (
                  <p className="text-xs text-gray-500">The password must contain at least 8 characters</p>
                )}
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                />
                <Label
                  htmlFor="agreeTerms"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the{" "}
                  <Link href="/terms" className="text-rose-500 hover:underline">
                    terms of use
                  </Link>{" "}
                  and the{" "}
                  <Link href="/privacy" className="text-rose-500 hover:underline">
                    privacy policy
                  </Link>
                </Label>
              </div>
              {errors.agreeTerms && <p className="text-red-500 text-xs -mt-2">{errors.agreeTerms}</p>}

              <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 mt-6" disabled={isLoading}>
                {isLoading ? "Creation in progress..." : "Create an account"}
              </Button>
            </form>
            {authError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{authError}</p>
              </div>
            )}

            {/* <Separator className="my-6" />

            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSocialLogin("google")}
                disabled={socialLoading !== null}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                {socialLoading === "google" ? "Connection in progress..." : "Continue with Google"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSocialLogin("facebook")}
                disabled={socialLoading !== null}
              >
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
                {socialLoading === "facebook" ? "Connection in progress..." : "Continue with Facebook"}
              </Button>
            </div> */}

            <p className="text-center text-sm text-gray-500 mt-6">
              Already registered ?{" "}
              <Link href="/login" className="text-rose-500 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
