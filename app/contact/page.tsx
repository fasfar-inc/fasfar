"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, MapPin, Phone, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Footer } from "@/components/footer"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "question",
    message: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Effacer l'erreur lorsque l'utilisateur commence à corriger
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleRadioChange = (value: string) => {
    setFormData({
      ...formData,
      subject: value,
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis"
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Le message est requis"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Le message doit contenir au moins 10 caractères"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      // Simuler une requête API
      setTimeout(() => {
        setIsSubmitting(false)
        setIsSubmitted(true)
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container py-6 flex-1">
        <Link href="/" className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden p-6 md:p-8">
            <h1 className="text-2xl font-bold mb-2">Contactez-nous</h1>
            <p className="text-gray-500 mb-6">
              Nous sommes là pour répondre à toutes vos questions. Remplissez le formulaire ci-dessous et nous vous
              répondrons dans les plus brefs délais.
            </p>

            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-12 w-12 text-green-500 mx-auto mb-4"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h2 className="text-xl font-bold text-green-800 mb-2">Message envoyé avec succès !</h2>
                <p className="text-green-700 mb-4">
                  Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSubmitted(false)
                    setFormData({
                      name: "",
                      email: "",
                      subject: "question",
                      message: "",
                    })
                  }}
                >
                  Envoyer un autre message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Jean Dupont"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jean.dupont@exemple.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Sujet</Label>
                  <RadioGroup value={formData.subject} onValueChange={handleRadioChange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="question" id="question" />
                      <Label htmlFor="question" className="font-normal">
                        Question générale
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="support" id="support" />
                      <Label htmlFor="support" className="font-normal">
                        Support technique
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="partnership" id="partnership" />
                      <Label htmlFor="partnership" className="font-normal">
                        Partenariat
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="font-normal">
                        Autre
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Écrivez votre message ici..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className={errors.message ? "border-red-500" : ""}
                  />
                  {errors.message && <p className="text-red-500 text-xs">{errors.message}</p>}
                </div>

                <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6">Informations de contact</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-rose-100 p-3 shrink-0">
                  <Mail className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-gray-500">contact@Fasfar.com</p>
                  <p className="text-gray-500">support@Fasfar.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-full bg-rose-100 p-3 shrink-0">
                  <Phone className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-medium">Téléphone</h3>
                  <p className="text-gray-500">+33 1 23 45 67 89</p>
                  <p className="text-gray-500">Du lundi au vendredi, 9h-18h</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-full bg-rose-100 p-3 shrink-0">
                  <MapPin className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-medium">Adresse</h3>
                  <p className="text-gray-500">123 Avenue de la République</p>
                  <p className="text-gray-500">75011 Paris, France</p>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <div>
              <h2 className="text-xl font-bold mb-4">Foire aux questions</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Comment créer un compte ?</h3>
                  <p className="text-sm text-gray-500">
                    Cliquez sur "Inscription" en haut à droite de la page d'accueil et suivez les instructions.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Comment publier une annonce ?</h3>
                  <p className="text-sm text-gray-500">
                    Après vous être connecté, cliquez sur le bouton "Vendre" et remplissez le formulaire de création
                    d'annonce.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Comment contacter un vendeur ?</h3>
                  <p className="text-sm text-gray-500">
                    Sur la page du produit, cliquez sur le bouton "Contacter" pour envoyer un message au vendeur.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Comment fonctionne le système de paiement ?</h3>
                  <p className="text-sm text-gray-500">
                    Fasfar ne gère pas les paiements. Les transactions se font directement entre l'acheteur et le
                    vendeur.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/faq">
                  <Button variant="outline" className="w-full">
                    Voir toutes les questions fréquentes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
