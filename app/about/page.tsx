"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CheckCircle,
  ShoppingBag,
  Users,
  Shield,
  Heart,
  Globe,
  Sparkles,
  Target,
  Award,
  Mail,
  Briefcase,
  ArrowRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

export default function AboutPage() {
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
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="About Fasfar"
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
              <Sparkles className="w-4 h-4 mr-2" />
              Connecting Communities Since 2023
            </Badge>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            About Fasfar
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Revolutionizing local commerce by connecting buyers and sellers in their communities
          </motion.p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <Badge className="bg-rose-100 text-rose-700 border-rose-200 px-4 py-2 text-sm mb-4">
                <Target className="w-4 h-4 mr-2" />
                Our Mission
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Connecting Communities Through Commerce
              </h2>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-xl text-gray-600 leading-relaxed mb-12">
              Fasfar was born from a simple idea: create a platform that directly connects local buyers and sellers,
              without intermediaries. Our mission is to facilitate exchanges between individuals by offering an
              intuitive, secure, and proximity-focused user experience.
            </motion.p>

            <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="bg-rose-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Heart className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Community First</h3>
                <p className="text-gray-600">
                  Building stronger local communities through meaningful connections and exchanges.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sustainable Future</h3>
                <p className="text-gray-600">
                  Promoting circular economy and responsible consumption for a better tomorrow.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Trust & Safety</h3>
                <p className="text-gray-600">
                  Ensuring secure transactions with verified users and transparent processes.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-4 py-2 text-sm mb-4">
                <Award className="w-4 h-4 mr-2" />
                Our Story
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Who We Are</h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Founded in 2023, Fasfar is a French startup revolutionizing commerce between individuals. Our team
                  consists of technology enthusiasts and collaborative economy advocates who believe in a more
                  responsible and human consumption model.
                </p>
                <p>
                  We envision a world where objects circulate easily from person to person, where geographical proximity
                  fosters meetings and exchanges, and where technology serves humanity and the environment.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  alt="Our team"
                  width={800}
                  height={600}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-3xl font-bold text-rose-600 mb-1">10K+</div>
                <div className="text-sm text-gray-600">Happy Users</div>
              </div>

              <div className="absolute -top-8 -right-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-3xl font-bold text-blue-600 mb-1">50K+</div>
                <div className="text-sm text-gray-600">Products Sold</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-rose-50 via-white to-blue-50">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-rose-100 text-rose-700 border-rose-200 px-4 py-2 text-sm mb-4">
              <Heart className="w-4 h-4 mr-2" />
              Our Values
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">What Drives Us Forward</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our core values shape every decision we make and every feature we build
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: CheckCircle,
                title: "Simplicity & Transparency",
                description: "Clear, honest communication in everything we do",
              },
              {
                icon: Users,
                title: "Proximity & Social Connection",
                description: "Building bridges between neighbors and communities",
              },
              {
                icon: Globe,
                title: "Circular Economy",
                description: "Promoting sustainable consumption and reuse",
              },
              {
                icon: Sparkles,
                title: "Innovation & Growth",
                description: "Continuously improving and evolving our platform",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="bg-gradient-to-br from-rose-100 to-rose-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2 text-sm mb-4">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Why Choose Fasfar
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Built for Modern Commerce</h2>
          </motion.div>

          <motion.div
            className="grid lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div
              variants={fadeInUp}
              className="group bg-gradient-to-br from-rose-50 to-rose-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300"
            >
              <div className="bg-rose-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Simplicity</h3>
              <p className="text-gray-700 leading-relaxed">
                An intuitive interface that makes buying and selling between individuals simple and enjoyable.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="group bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300"
            >
              <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Proximity</h3>
              <p className="text-gray-700 leading-relaxed">
                Find sellers and buyers near you to facilitate exchanges and build local connections.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="group bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300"
            >
              <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Trust</h3>
              <p className="text-gray-700 leading-relaxed">
                A rating and verification system for secure transactions you can rely on.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-4 py-2 text-sm mb-4">
              <Users className="w-4 h-4 mr-2" />
              Our Team
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Meet the People Behind Fasfar</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Behind Fasfar, there's a passionate team determined to create the best possible experience for our users.
              We are experts in web development, interface design, digital marketing, and customer service.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose-600 to-rose-700 text-white">
        <div className="container">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Join the Fasfar Adventure</h2>
            <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
              Want to be part of our team or learn more about our career opportunities?
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-white text-rose-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium group"
                >
                  <Mail className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Contact Us
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/careers">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-rose-600 px-8 py-4 text-lg font-medium group bg-transparent"
                >
                  <Briefcase className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  View Careers
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
