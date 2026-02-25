'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { ChatApp } from '@/components/ChatApp'
import { MessageCircle } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export default function Home() {
  const { isDark, toggleDarkMode } = useTheme()
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}> 
      <SignedOut>
        <div className="flex items-center justify-center min-h-screen">
          <div className={`p-8 rounded-lg shadow-md text-center max-w-md ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h1 className="text-3xl font-bold mb-4">Welcome to Tars Chat</h1>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Connect and chat with your friends in real-time</p>
            <SignInButton>
              <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="h-screen">
          <header className={`border-b p-4 flex justify-between items-center shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2">
              <button className="sm:hidden p-2 rounded-md mr-2 bg-white/90 dark:bg-gray-800/90" onClick={() => window.dispatchEvent(new Event('openSidebar'))} aria-label="Open menu">☰</button>
              <MessageCircle className="w-6 h-6 text-blue-500" />
              <h1 className="text-xl font-semibold">Tars Chat</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleDarkMode} className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`} title="Toggle theme">
                {isDark ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>
              <UserButton />
            </div>
          </header>
          <ChatApp />
        </div>
      </SignedIn>
    </div>
  )
}
