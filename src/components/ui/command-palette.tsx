
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Settings, 
  Workflow, 
  Sparkles,
  LayoutDashboard
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
    action: '/workflows/new',
    shortcut: 'N',
  },
  {
    id: 'ai-generate',
    title: 'Generate with AI',
    description: 'Describe your workflow in plain English',
    icon: Sparkles,
    action: '/workflows/generate',
    shortcut: 'G',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'View your workflow overview',
    icon: LayoutDashboard,
    action: '/dashboard',
    shortcut: 'D',
  },
  {
    id: 'workflows',
    title: 'All Workflows',
    description: 'Browse your existing workflows',
    icon: Workflow,
    action: '/workflows',
    shortcut: 'W',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Manage your account and preferences',
    icon: Settings,
    action: '/settings',
    shortcut: 'S',
  },
]

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()

  const handleSelect = (action: string) => {
    navigate(action)
    onClose()
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder="Search commands..." />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>
        <CommandGroup heading="Actions">
          {commands.map((command) => {
            const Icon = command.icon
            return (
              <CommandItem
                key={command.id}
                onSelect={() => handleSelect(command.action)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="p-1 rounded bg-blue-100">
                  <Icon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{command.title}</div>
                  <div className="text-sm text-muted-foreground">{command.description}</div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {command.shortcut}
                </Badge>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
