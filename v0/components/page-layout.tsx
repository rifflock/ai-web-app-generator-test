"use client"

import type { ReactNode } from "react"
import { LogoLink } from "./logo"
import { Button } from "@/components/ui/button"
import { MessagingWidget } from "./messaging/messaging-widget"
import Link from "next/link"
import { Bell, Calendar, Heart, LogOut, MessageSquare } from "lucide-react"

interface PageLayoutProps {
  children: ReactNode
  showNav?: boolean
  showFooter?: boolean
  showHeader?: boolean
  user?: any
  onSignOut?: () => void
}

export function PageLayout({
  children,
  showNav = true,
  showFooter = true,
  showHeader = true,
  user,
  onSignOut,
}: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-sand-light">
      {showHeader && (
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <LogoLink />
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/sessions">
                    <Button variant="ghost" size="sm" className="hidden md:flex">
                      <Calendar className="h-4 w-4 mr-2" />
                      Sessions
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button variant="ghost" size="sm" className="hidden md:flex">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                    </Button>
                  </Link>
                  <Link href="/donate">
                    <Button variant="ghost" size="sm" className="hidden md:flex">
                      <Heart className="h-4 w-4 mr-2" />
                      Donate
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                  </Button>
                  {onSignOut && (
                    <Button variant="ghost" size="icon" onClick={onSignOut}>
                      <LogOut className="h-5 w-5" />
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="default">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">{children}</main>

      {showFooter && (
        <footer className="bg-navy text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <LogoLink className="text-white" />
                <p className="mt-2 text-sm text-gray-300">Bringing rowers together since 2023</p>
              </div>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                <div>
                  <h3 className="text-sm font-semibold mb-2">About</h3>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <Link href="#" className="hover:text-secondary">
                        Our Story
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:text-secondary">
                        Team
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:text-secondary">
                        Careers
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">Resources</h3>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <Link href="/sessions" className="hover:text-secondary">
                        Sessions
                      </Link>
                    </li>
                    <li>
                      <Link href="/messages" className="hover:text-secondary">
                        Messages
                      </Link>
                    </li>
                    <li>
                      <Link href="/donate" className="hover:text-secondary">
                        Donate
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">Legal</h3>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <Link href="#" className="hover:text-secondary">
                        Privacy
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:text-secondary">
                        Terms
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
              <p>© {new Date().getFullYear()} WaveRowers. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}

      {/* Add the messaging widget for logged-in users */}
      {user && <MessagingWidget />}
    </div>
  )
}

