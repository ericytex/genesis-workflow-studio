
'use client'

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { CommandPalette } from '@/components/ui/command-palette'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <DashboardSidebar 
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} 
      />
      
      <main className="flex-1 lg:ml-0 p-4 lg:p-8">
        <div className="lg:hidden h-12" /> {/* Spacer for mobile menu button */}
        {children}
      </main>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  )
}
