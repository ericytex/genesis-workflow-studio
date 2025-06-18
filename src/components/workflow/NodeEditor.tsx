import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { WorkflowNode } from '@/types/workflow'
import { 
  Zap, 
  Play, 
  Brain, 
  GitBranch
} from 'lucide-react'

interface NodeEditorProps {
  node: WorkflowNode | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedNode: WorkflowNode) => void
}

const nodeIcons = {
  trigger: Zap,
  action: Play,
  ai: Brain,
  condition: GitBranch,
}

const nodeColors = {
  trigger: 'bg-green-100 text-green-800',
  action: 'bg-blue-100 text-blue-800',
  ai: 'bg-purple-100 text-purple-800',
  condition: 'bg-orange-100 text-orange-800',
}

export function NodeEditor({ node, isOpen, onClose, onSave }: NodeEditorProps) {
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [config, setConfig] = useState<Record<string, any>>({})

  useEffect(() => {
    if (node) {
      setLabel(node.data.label)
      setDescription(node.data.description || '')
      setConfig(node.data.config || {})
    }
  }, [node])

  const handleSave = () => {
    if (!node) return

    const updatedNode: WorkflowNode = {
      ...node,
      data: {
        ...node.data,
        label,
        description,
        config,
      },
    }

    onSave(updatedNode)
    onClose()
  }

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  if (!node) return null

  const Icon = nodeIcons[node.data.type]
  const colorClass = nodeColors[node.data.type]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Edit Node</DialogTitle>
              <Badge className={colorClass}>
                {node.data.type}
              </Badge>
            </div>
          </div>
          <DialogDescription>
            Configure the properties for this workflow node.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="label">Node Name</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter node name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter node description"
              rows={2}
            />
          </div>

          <div className="grid gap-4">
            <Label>Configuration</Label>
            {Object.entries(config).map(([key, value]) => (
              <div key={key} className="grid gap-2">
                <Label htmlFor={key} className="text-sm text-gray-600">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                </Label>
                {typeof value === 'boolean' ? (
                  <select
                    value={value.toString()}
                    onChange={(e) => handleConfigChange(key, e.target.value === 'true')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : typeof value === 'object' ? (
                  <Textarea
                    value={JSON.stringify(value, null, 2)}
                    onChange={(e) => {
                      try {
                        handleConfigChange(key, JSON.parse(e.target.value))
                      } catch {
                        // Invalid JSON, keep as string for now
                      }
                    }}
                    rows={3}
                  />
                ) : (
                  <Input
                    value={String(value)}
                    onChange={(e) => handleConfigChange(key, e.target.value)}
                    placeholder={`Enter ${key}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
