"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useState } from "react"
import {
  ArrowLeft,
  Search,
  Calendar,
  Clock,
  User,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Star,
  Filter,
  Tag,
  Eye,
  Heart,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

const categories = [
  { id: "all", name: "All Posts", count: 12 },
  { id: "tips", name: "Selling Tips", count: 5 },
  { id: "guides", name: "Guides", count: 4 },
  { id: "news", name: "Company News", count: 3 },
]

const blogPosts = [
  {
    id: 1,
    title: "Welcome to Fasfar: Your Local Marketplace Revolution",
    excerpt:
      "Discover how Fasfar is transforming local commerce by connecting neighbors and building stronger communities through peer-to-peer trading.",
    content: "Learn about our mission to connect local buyers and sellers in your community.",
    image: "/placeholder.svg?height=400&width=600",
    author: "Sarah Johnson",
    date: "January 15, 2024",
    readTime: "5 min read",
    category: "news",
    tags: ["marketplace", "community", "local"],
    views: 1250,
    likes: 89,
    featured: true,
  },
  {
    id: 2,
    title: "Top 10 Tips for Selling Successfully on Fasfar",
    excerpt:
      "Master the art of online selling with our comprehensive guide. From photography tips to pricing strategies, we've got you covered.",
    content: "Maximize your sales with our expert advice on listing and selling items locally.",
    image: "/placeholder.svg?height=400&width=600",
    author: "Mike Chen",
    date: "January 12, 2024",
    readTime: "8 min read",
    category: "tips",
    tags: ["selling", "tips", "photography"],
    views: 2100,
    likes: 156,
    featured: true,
  },
  {
    id: 3,
    title: "Building Trust in Online Marketplaces: A Complete Guide",
    excerpt:
      "Learn how to build and maintain trust with buyers and sellers. Discover the importance of reviews, verification, and communication.",
    content: "Essential strategies for creating trustworthy relationships in digital commerce.",
    image: "/placeholder.svg?height=400&width=600",
    author: "Emma Davis",
    date: "January 10, 2024",
    readTime: "6 min read",
    category: "guides",
    tags: ["trust", "safety", "reviews"],
    views: 1800,
    likes: 134,
    featured: false,
  },
  {
    id: 4,
    title: "The Psychology of Pricing: How to Price Your Items Right",
    excerpt:
      "Understand the psychology behind pricing decisions and learn strategies to price your items competitively while maximizing profit.",
    content: "Deep dive into pricing psychology and market dynamics.",
    image: "/placeholder.svg?height=400&width=600",
    author: "David Wilson",
    date: "January 8, 2024",
    readTime: "7 min read",
    category: "tips",
    tags: ["pricing", "psychology", "strategy"],
    views: 1650,
    likes: 98,
    featured: false,
  },
  {
    id: 5,
    title: "Sustainable Commerce: The Future of Local Trading",
    excerpt:
      "Explore how local marketplaces contribute to sustainable consumption and environmental protection through circular economy principles.",
    content: "The environmental impact of local trading and sustainable practices.",
    image: "/placeholder.svg?height=400&width=600",
    author: "Lisa Green",
    date: "January 5, 2024",
    readTime: "9 min read",
    category: "guides",
    tags: ["sustainability", "environment", "circular economy"],
    views: 1420,
    likes: 112,
    featured: false,
  },
  {
    id: 6,
    title: "Photography Masterclass: Showcase Your Products Like a Pro",
    excerpt:
      "Transform your product listings with professional photography techniques. Learn lighting, composition, and editing tips that sell.",
    content: "Professional photography techniques for better product listings.",
    image: "/placeholder.svg?height=400&width=600",
    author: "Alex Rodriguez",
    date: "January 3, 2024",
    readTime: "10 min read",
    category: "tips",
    tags: ["photography", "products", "visual"],
    views: 2300,
    likes: 187,
    featured: false,
  },
]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredPosts = blogPosts.filter((post) => post.featured)
  const regularPosts = filteredPosts.filter((post) => !post.featured)

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
          <Image
            src="/placeholder.svg?height=800&width=1920"
            alt="Fasfar Blog"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-rose-900/80 via-rose-800/60 to-rose-600/40" />
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
              <BookOpen className="w-4 h-4 mr-2" />
              Insights & Stories
            </Badge>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Fasfar Blog
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Discover tips, guides, and stories from the world of local commerce
          </motion.p>
        </motion.div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-gray-50">
        <div className="container">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 h-12">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? "bg-rose-500 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-rose-100 text-rose-700 border-rose-200 px-4 py-2 text-sm mb-4">
                <Star className="w-4 h-4 mr-2" />
                Featured Articles
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Must-Read Stories</h2>
            </motion.div>

            <motion.div
              className="grid lg:grid-cols-2 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {featuredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  variants={fadeInUp}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-rose-500 text-white border-0">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 mb-6 leading-relaxed">{post.excerpt}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.likes}
                        </div>
                      </div>

                      <Link href={`/blog/${post.id}`}>
                        <Button className="bg-rose-500 hover:bg-rose-600 group/btn">
                          Read More
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Regular Posts */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Latest Articles</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay updated with the latest insights, tips, and stories from the Fasfar community
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {regularPosts.map((post) => (
              <motion.article
                key={post.id}
                variants={fadeInUp}
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-gray-700 border-0 capitalize">{post.category}</Badge>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="w-2 h-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.likes}
                      </div>
                    </div>

                    <Link href={`/blog/${post.id}`}>
                      <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                        Read More
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {regularPosts.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-rose-600 to-rose-700 text-white">
        <div className="container">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Stay in the Loop</h2>
            <p className="text-xl text-rose-100 mb-8">
              Get the latest articles, tips, and insights delivered straight to your inbox
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 h-12"
              />
              <Button className="bg-white text-rose-600 hover:bg-gray-100 h-12 px-8">Subscribe</Button>
            </div>

            <p className="text-sm text-rose-200 mt-4">No spam, unsubscribe at any time. We respect your privacy.</p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
