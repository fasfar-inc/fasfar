import Link from "next/link"
import { Facebook, Instagram, Linkedin, ShoppingBag, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t pt-12 pb-6">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="container flex h-16 items-center">
              <img src="/logo.png" alt="fasfar" width={100} height={100} />
            </div>
            <p className="text-sm text-gray-500 mb-4">
              A platform for buying and selling between individuals. Find what you're looking for near you.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-rose-500 transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-rose-500 transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-rose-500 transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-rose-500 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4">About</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Our story
                </Link>
              </li>
              <li>
                <Link href="/about#team" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Our team
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Help and support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-500 hover:text-rose-500 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Help center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Terms of use
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Cookies policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2025 Fasfar. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/terms" className="text-gray-500 hover:text-rose-500 transition-colors">
                Terms of use
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-rose-500 transition-colors">
                Privacy policy
              </Link>
              <Link href="/cookies" className="text-gray-500 hover:text-rose-500 transition-colors">
                Cookies
              </Link>
              <Link href="/sitemap" className="text-gray-500 hover:text-rose-500 transition-colors">
                Site map
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
