
import React, { useState, useEffect } from 'react'
import { 
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { WorkflowNode } from '@/types/workflow'
import { 
  Zap, 
  Play, 
  Brain, 
  GitBranch,
  AlertCircle,
  X
} from 'lucide-react'

interface NodeEditorProps {
  node: WorkflowNode | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedNode: WorkflowNode) => void
  onDelete?: (nodeId: string) => void
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

export function NodeEditor({ node, isOpen, onClose, onSave, onDelete }: NodeEditorProps) {
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [config, setConfig] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (node) {
      setLabel(node.data.label)
      setDescription(node.data.description || '')
      setConfig(node.data.config || {})
      setErrors({})
    }
  }, [node])

  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Basic validation based on node type
    if (node?.data.type === 'trigger' && node.data.category === 'webhook') {
      if (!config.url) newErrors.url = 'URL is required'
      if (!config.method) newErrors.method = 'HTTP method is required'
    }
    
    if (node?.data.type === 'action' && node.data.category === 'email') {
      if (!config.to) newErrors.to = 'Recipient email is required'
      if (!config.subject) newErrors.subject = 'Subject is required'
    }
    
    if (node?.data.type === 'ai') {
      if (!config.prompt) newErrors.prompt = 'Prompt is required'
      if (!config.model) newErrors.model = 'Model is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!node || !validateConfig()) return

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
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  const handleDelete = () => {
    if (node && onDelete) {
      onDelete(node.id)
      onClose()
    }
  }

  const renderConfigField = (key: string, value: any) => {
    const hasError = !!errors[key]
    
    // Special handling for different field types
    if (key === 'method' && node?.data.category === 'webhook') {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={key} className="text-sm font-medium">
            HTTP Method {hasError && <span className="text-red-500">*</span>}
          </Label>
          <Select value={String(value)} onValueChange={(newValue) => handleConfigChange(key, newValue)}>
            <SelectTrigger className={hasError ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
          {hasError && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors[key]}
            </p>
          )}
        </div>
      )
    }

    if (key === 'model' && node?.data.type === 'ai') {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={key} className="text-sm font-medium">
            AI Model {hasError && <span className="text-red-500">*</span>}
          </Label>
          <Select value={String(value)} onValueChange={(newValue) => handleConfigChange(key, newValue)}>
            <SelectTrigger className={hasError ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="claude-3">Claude 3</SelectItem>
            </SelectContent>
          </Select>
          {hasError && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors[key]}
            </p>
          )}
        </div>
      )
    }

    if (typeof value === 'boolean') {
      return (
        <div key={key} className="flex items-center justify-between">
          <Label htmlFor={key} className="text-sm font-medium">
            {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
          </Label>
          <Switch
            checked={value}
            onCheckedChange={(checked) => handleConfigChange(key, checked)}
          />
        </div>
      )
    }

    if (key === 'prompt' || key === 'body' || key === 'message') {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={key} className="text-sm font-medium">
            {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
            {hasError && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            value={String(value)}
            onChange={(e) => handleConfigChange(key, e.target.value)}
            placeholder={`Enter ${key}`}
            rows={4}
            className={hasError ? 'border-red-500' : ''}
          />
          {hasError && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors[key]}
            </p>
          )}
        </div>
      )
    }

    return (
      <div key={key} className="space-y-2">
        <Label htmlFor={key} className="text-sm font-medium">
          {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
          {hasError && <span className="text-red-500">*</span>}
        </Label>
        <Input
          value={String(value)}
          onChange={(e) => handleConfigChange(key, e.target.value)}
          placeholder={`Enter ${key}`}
          className={hasError ? 'border-red-500' : ''}
        />
        {hasError && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors[key]}
          </p>
        )}
      </div>
    )
  }

  if (!node) return null

  const Icon = nodeIcons[node.data.type]
  const colorClass = nodeColors[node.data.type]

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <DrawerTitle className="text-lg">Configure Node</DrawerTitle>
                <Badge className={colorClass}>
                  {node.data.type} • {node.data.category}
                </Badge>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
          <DrawerDescription>
            Configure the properties and behavior for this workflow node.
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Basic Properties */}
          <div className="space-y-4">
            <h3 className="font-medium text-base">Basic Properties</h3>
            
            <div className="space-y-2">
              <Label htmlFor="label" className="text-sm font-medium">Node Name</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Enter node name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter node description"
                rows={2}
              />
            </div>
          </div>

          {/* Configuration */}
          {Object.keys(config).length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-base">Configuration</h3>
              <div className="space-y-4">
                {Object.entries(config).map(([key, value]) => renderConfigField(key, value))}
              </div>
            </div>
          )}
        </div>

        <DrawerFooter className="border-t">
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
