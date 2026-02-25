'use client'

import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect, useRef } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { ChatArea } from './ChatArea'
import { useTheme } from './ThemeProvider'


export function ChatApp() {
  const { user } = useUser()
  const syncUser = useMutation(api.users.syncUser)
  const setOnline = useMutation(api.users.setOnline)
  const markAsRead = useMutation(api.conversations.markAsRead)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const { isDark } = useTheme()

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id)
  }

  const resetInactivityTimer = (userClerkId: string) => {
    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current)
    
    // Mark user as online immediately on activity
    setOnline({ clerkId: userClerkId, online: true })
    
    // Set user to inactive after 5 minutes of no activity
    inactivityTimeoutRef.current = setTimeout(() => {
      setOnline({ clerkId: userClerkId, online: false })
    }, 5 * 60 * 1000)
  }

  useEffect(() => {
    if (user) {
      syncUser({
        clerkId: user.id,
        name: user.fullName || user.username || 'Anonymous',
        imageUrl: user.imageUrl || '',
        email: user.primaryEmailAddress?.emailAddress || '',
      }).then((id) => {
        setCurrentUserId(id)
      })
    }
  }, [user, syncUser, setOnline])

  useEffect(() => {
    if (!user) return

    const handleActivity = () => {
      resetInactivityTimer(user.id)
    }

    // Track user activity
    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)
    window.addEventListener('scroll', handleActivity)

    // Handle page visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the page
        setOnline({ clerkId: user.id, online: false })
        if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current)
      } else {
        // User came back
        resetInactivityTimer(user.id)
      }
    }

    // Listen for openSidebar custom events from the page header
    const openSidebarListener = () => setShowSidebar(true)
    window.addEventListener('openSidebar', openSidebarListener as EventListener)

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Initial activity
    resetInactivityTimer(user.id)

    // Clean up on unmount
    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      window.removeEventListener('openSidebar', openSidebarListener as EventListener)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current)
    }
  }, [user, setOnline])

  if (!currentUserId) return <div>Loading...</div>

  return (
      <div className={`flex h-screen ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`flex h-screen w-full ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
          {/* Mobile sidebar overlay */}
          <div className={`sm:hidden ${showSidebar ? 'block' : 'hidden'}`}>
            <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowSidebar(false)} />
            <div className="fixed left-0 top-0 z-50 h-full w-72">
              <Sidebar currentUserId={currentUserId} onSelectConversation={(id) => { handleSelectConversation(id); setShowSidebar(false); }} onClose={() => setShowSidebar(false)} />
            </div>
          </div>

          {/* Desktop sidebar (hidden on small screens) */}
          <div className="hidden sm:block">
            <Sidebar
              currentUserId={currentUserId}
              onSelectConversation={handleSelectConversation}
            />
          </div>

          {selectedConversation ? (
            <ChatArea conversationId={selectedConversation} currentUserId={currentUserId} />
          ) : (
            <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Welcome to Tars Chat</h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Select a user or conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
  )
}
