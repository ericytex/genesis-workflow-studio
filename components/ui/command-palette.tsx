
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Plus, 
  Settings, 
  Workflow, 
  Sparkles,
  Command,
  X
} from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

const commands = [
  {
    id: 'new-workflow',
    title: 'Create New Workflow',
    description: 'Start building a new automation',
    icon: Plus,
    action: '/builder',
    shortcut: 'N',
  },
  {
    id: 'ai-generate',
    title: 'Generate with AI',
    description: 'Describe your workflow in plain English',
    icon: Sparkles,
    action: '/builder?ai=true',
    shortcut: 'G',
  },
  {
    id: 'workflows',
    title: 'View All Workflows',
    description: 'Browse your existing workflows',
    icon: Workflow,
    action: '/dashboard/workflows',
    shortcut: 'W',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Manage your account and preferences',
    icon: Settings,
    action: '/dashboard/settings',
    shortcut: 'S',
  },
]

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const filteredCommands = commands.filter(
    (command) =>
      command.title.toLowerCase().includes(query.toLowerCase()) ||
      command.description.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        )
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          router.push(filteredCommands[selectedIndex].action)
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredCommands, router, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-[10vh] z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 p-4 border-b">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands..."
              className="border-0 focus-visible:ring-0 text-lg"
              autoFocus
            />
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No commands found for "{query}"
              </div>
            ) : (
              filteredCommands.map((command, index) => {
                const Icon = command.icon
                return (
                  <div
                    key={command.id}
                    className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 ${
                      index === selectedIndex ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => {
                      router.push(command.action)
                      onClose()
                    }}
                  >
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{command.title}</div>
                      <div className="text-sm text-gray-500">{command.description}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <Command className="h-3 w-3 mr-1" />
                      {command.shortcut}
                    </Badge>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
