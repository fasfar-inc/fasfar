"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useState } from "react"
import {
  ArrowLeft,
  Search,
  HelpCircle,
  User,
  ShoppingBag,
  CreditCard,
  Shield,
  Settings,
  MessageCircle,
  ArrowRight,
  Plus,
  Minus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const faqCategories = [
  {
    id: "account",
    name: "Account & Profile",
    icon: User,
    color: "bg-blue-500",
    count: 8,
  },
  {
    id: "selling",
    name: "Selling Items",
    icon: ShoppingBag,
    color: "bg-green-500",
    count: 12,
  },
  {
    id: "buying",
    name: "Buying & Orders",
    icon: CreditCard,
    color: "bg-purple-500",
    count: 10,
  },
  {
    id: "safety",
    name: "Safety & Trust",
    icon: Shield,
    color: "bg-rose-500",
    count: 6,
  },
  {
    id: "technical",
    name: "Technical Support",
    icon: Settings,
    color: "bg-orange-500",
    count: 7,
  },
]

const faqData = [
  {
    category: "account",
    question: "How do I create an account?",
    answer:
      "Creating an account is simple! Click the 'Sign Up' button in the top right corner of our homepage. You can register using your email address or sign up with Google or Facebook. After providing your basic information, you'll receive a verification email to activate your account.",
  },
  {
    category: "account",
    question: "How do I verify my account?",
    answer:
      "Account verification helps build trust in our community. You can verify your account by providing a valid phone number, uploading a government-issued ID, or connecting your social media accounts. Verified users get a special badge and higher visibility in search results.",
  },
  {
    category: "account",
    question: "Can I change my username?",
    answer:
      "Yes, you can change your username once every 30 days. Go to your profile settings, click on 'Edit Profile', and update your username. Keep in mind that your previous username will become available for other users after the change.",
  },
  {
    category: "selling",
    question: "How do I list an item for sale?",
    answer:
      "To list an item, click the 'Sell' button and follow our easy step-by-step process. Add clear photos, write a detailed description, set your price, and choose your location. Make sure to include all relevant details about the item's condition and any defects.",
  },
  {
    category: "selling",
    question: "What makes a good product listing?",
    answer:
      "Great listings have high-quality photos from multiple angles, detailed descriptions, honest condition assessments, competitive pricing, and accurate location information. Items with complete information sell 3x faster than incomplete listings.",
  },
  {
    category: "selling",
    question: "How do I price my items competitively?",
    answer:
      "Research similar items on our platform to understand market prices. Consider the item's condition, age, brand, and demand. Our pricing suggestions tool can help you set competitive prices based on recent sales data.",
  },
  {
    category: "buying",
    question: "How do I make a purchase?",
    answer:
      "Browse items, click on what interests you, and use the 'Contact Seller' button to inquire. Discuss details, arrange payment, and coordinate pickup or delivery. Always meet in safe, public locations for in-person transactions.",
  },
  {
    category: "buying",
    question: "What payment methods are accepted?",
    answer:
      "We support various payment methods including cash for local meetups, bank transfers, PayPal, and popular digital wallets. Always agree on payment terms with the seller before completing the transaction.",
  },
  {
    category: "buying",
    question: "Can I return an item if I'm not satisfied?",
    answer:
      "Return policies vary by seller. Some offer returns within a specified period, while others sell items as-is. Always clarify the return policy with the seller before purchasing, and document the item's condition upon receipt.",
  },
  {
    category: "safety",
    question: "How do I stay safe when meeting sellers?",
    answer:
      "Always meet in well-lit, public places like shopping centers or police station parking lots. Bring a friend if possible, inspect items thoroughly before paying, and trust your instincts. Never share personal financial information.",
  },
  {
    category: "safety",
    question: "How do I report suspicious activity?",
    answer:
      "If you encounter suspicious listings, users, or behavior, use the 'Report' button on the listing or user profile. You can also contact our support team directly. We take all reports seriously and investigate promptly.",
  },
  {
    category: "technical",
    question: "Why can't I upload photos?",
    answer:
      "Photo upload issues are usually due to file size or format restrictions. Ensure your photos are under 10MB each and in JPG, PNG, or WebP format. Clear your browser cache or try using a different browser if problems persist.",
  },
  {
    category: "technical",
    question: "How do I delete my account?",
    answer:
      "To delete your account, go to Settings > Privacy & Security > Delete Account. This action is permanent and will remove all your listings, messages, and profile data. Consider deactivating your account temporarily if you're unsure.",
  },
]

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [openItems, setOpenItems] = useState<string[]>([])

  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleItem = (index: string) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="container">
          <Link
            href="/"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/placeholder.svg?height=800&width=1920" alt="FAQ" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-green-800/60 to-green-600/40" />
        </div>

        <motion.div
          className="relative z-10 text-center text-white px-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-6"
          >
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2 text-sm">
              <HelpCircle className="w-4 h-4 mr-2" />
              Get Instant Answers
            </Badge>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            FAQ
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Find answers to frequently asked questions about using Fasfar
          </motion.p>
        </motion.div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-gray-50">
        <div className="container">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base bg-white shadow-lg border-0"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Browse by Category</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers organized by topic to quickly locate what you're looking for
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.button
              variants={fadeInUp}
              onClick={() => setSelectedCategory("all")}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                selectedCategory === "all"
                  ? "border-rose-500 bg-rose-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <div className="bg-gray-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">All Questions</h3>
              <p className="text-sm text-gray-600">{faqData.length} articles</p>
            </motion.button>

            {faqCategories.map((category) => (
              <motion.button
                key={category.id}
                variants={fadeInUp}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "border-rose-500 bg-rose-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className={`${category.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.count} articles</p>
              </motion.button>
            ))}
          </motion.div>

          {/* FAQ Items */}
          <motion.div
            className="max-w-4xl mx-auto space-y-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {filteredFAQs.map((faq, index) => {
              const itemKey = `${faq.category}-${index}`
              const isOpen = openItems.includes(itemKey)

              return (
                <motion.div
                  key={itemKey}
                  variants={fadeInUp}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <Collapsible open={isOpen} onOpenChange={() => toggleItem(itemKey)}>
                    <CollapsibleTrigger className="w-full p-6 text-left hover:bg-gray-50 rounded-2xl transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                        <div className="flex-shrink-0">
                          {isOpen ? (
                            <Minus className="w-5 h-5 text-gray-500" />
                          ) : (
                            <Plus className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-6 pb-6">
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              )
            })}
          </motion.div>

          {filteredFAQs.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try adjusting your search or browse different categories</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Still Have Questions?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you get the answers you need.
            </p>

            <Link href="/contact">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium group"
              >
                <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Contact Support
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
