import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import { prisma } from "@/lib/prisma"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"

declare module "next-auth" {
    interface Session {
      user: {
        id: string
        role: string
        name?: string | null
        email?: string | null
        image?: string | null
      }
    }
    interface User {
      id: string
      role: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.isActive) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.passwordHash)

        if (!isPasswordValid) {
          return null
        }

        // Update the last login date
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.username,
          role: user.role,
          image: user.profileImage || null,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Si l'utilisateur se connecte avec Google ou Facebook
      if (account && account.provider && ["google", "facebook"].includes(account.provider)) {
        const email = user.email

        if (!email) {
          return false
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
          where: { email },
        })

        if (existingUser) {
          // Mettre à jour les informations de l'utilisateur si nécessaire
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              lastLogin: new Date(),
              profileImage: user.image || existingUser.profileImage,
            },
          })
        } else {
          // Créer un nouvel utilisateur
          const username = user.name
            ? user.name.replace(/\s+/g, "").toLowerCase() + Math.floor(Math.random() * 1000)
            : `user${Math.floor(Math.random() * 10000)}`

          await prisma.user.create({
            data: {
              email,
              username,
              passwordHash: "", // Pas de mot de passe pour les connexions sociales
              firstName: user.name ? user.name.split(" ")[0] : "",
              lastName: user.name ? user.name.split(" ").slice(1).join(" ") : "",
              profileImage: user.image || null,
              role: "USER",
              isActive: true,
              createdAt: new Date(),
              lastLogin: new Date(),
            },
          })
        }
      }

      return true
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
