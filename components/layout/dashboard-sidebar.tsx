
'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Workflow, 
  LayoutDashboard, 
  Settings, 
  Plus,
  Command,
  Menu,
  X
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Workflows',
    href: '/dashboard/workflows',
    icon: Workflow,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

interface DashboardSidebarProps {
  onOpenCommandPalette: () => void
}

export function DashboardSidebar({ onOpenCommandPalette }: DashboardSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-2 p-6 border-b">
            <Workflow className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">Workflow AI</span>
          </div>

          {/* Command Palette Trigger */}
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-gray-500"
              onClick={onOpenCommandPalette}
            >
              <Command className="h-4 w-4" />
              Search commands...
              <Badge variant="outline" className="ml-auto text-xs">
                ⌘K
              </Badge>
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="px-4 pb-4">
            <Link href="/builder">
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                New Workflow
              </Button>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">Profile</div>
                <div className="text-xs text-gray-500">Manage account</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
