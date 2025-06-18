
import React, { useState } from 'react'
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  X,
  ChevronRight,
  FileText,
  AlertTriangle
} from 'lucide-react'
import { WorkflowExecution, ExecutionResult } from '@/types/workflow'

interface ExecutionPanelProps {
  isOpen: boolean
  onClose: () => void
  executions: WorkflowExecution[]
  currentExecution?: WorkflowExecution | null
}

export function ExecutionPanel({ 
  isOpen, 
  onClose, 
  executions, 
  currentExecution 
}: ExecutionPanelProps) {
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderExecutionResult = (result: ExecutionResult) => (
    <div key={result.nodeId} className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="font-medium">Node {result.nodeId}</span>
          {result.duration && (
            <Badge variant="outline" className="text-xs">
              {result.duration}ms
            </Badge>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {new Date(result.timestamp).toLocaleTimeString()}
        </span>
      </div>
      
      {result.output && (
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs font-medium text-gray-600 mb-1">Output:</p>
          <pre className="text-xs text-gray-800 whitespace-pre-wrap">
            {typeof result.output === 'string' 
              ? result.output 
              : JSON.stringify(result.output, null, 2)
            }
          </pre>
        </div>
      )}
      
      {result.error && (
        <div className="bg-red-50 rounded p-2">
          <p className="text-xs font-medium text-red-600 mb-1">Error:</p>
          <p className="text-xs text-red-800">{result.error}</p>
        </div>
      )}
    </div>
  )

  const displayExecution = selectedExecution || currentExecution

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-blue-100 text-blue-800">
                <Play className="h-5 w-5" />
              </div>
              <div>
                <DrawerTitle className="text-lg">Execution Logs</DrawerTitle>
                <p className="text-sm text-gray-600">
                  View workflow execution results and debugging information
                </p>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Execution History Sidebar */}
          <div className="w-80 border-r bg-gray-50">
            <div className="p-4 border-b">
              <h3 className="font-medium text-sm">Recent Executions</h3>
            </div>
            <ScrollArea className="h-full">
              <div className="p-2 space-y-2">
                {executions.map((execution) => (
                  <button
                    key={execution.id}
                    onClick={() => setSelectedExecution(execution)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      (selectedExecution?.id || currentExecution?.id) === execution.id
                        ? 'bg-white border-blue-200 shadow-sm'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-600">
                      Started: {new Date(execution.startTime).toLocaleString()}
                    </p>
                    {execution.totalDuration && (
                      <p className="text-xs text-gray-500">
                        Duration: {execution.totalDuration}ms
                      </p>
                    )}
                  </button>
                ))}
                
                {executions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No executions yet</p>
                    <p className="text-xs">Run your workflow to see results here</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Execution Details */}
          <div className="flex-1">
            {displayExecution ? (
              <Tabs defaultValue="output" className="h-full flex flex-col">
                <div className="border-b px-4 py-2">
                  <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="output">Output</TabsTrigger>
                    <TabsTrigger value="errors">Errors</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="output" className="h-full m-0">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Execution Results</h3>
                          <Badge className={getStatusColor(displayExecution.status)}>
                            {displayExecution.status}
                          </Badge>
                        </div>
                        
                        {displayExecution.results.map(renderExecutionResult)}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="errors" className="h-full m-0">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-4">
                        <h3 className="font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          Errors & Warnings
                        </h3>
                        
                        {displayExecution.results
                          .filter(result => !result.success)
                          .map(renderExecutionResult)
                        }
                        
                        {displayExecution.results.every(result => result.success) && (
                          <div className="text-center py-8 text-gray-500">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <p className="text-sm">No errors found</p>
                            <p className="text-xs">All nodes executed successfully</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="details" className="h-full m-0">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium mb-2">Execution Summary</h3>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Execution ID:</span>
                              <span className="text-sm font-mono">{displayExecution.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Start Time:</span>
                              <span className="text-sm">{new Date(displayExecution.startTime).toLocaleString()}</span>
                            </div>
                            {displayExecution.endTime && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">End Time:</span>
                                <span className="text-sm">{new Date(displayExecution.endTime).toLocaleString()}</span>
                              </div>
                            )}
                            {displayExecution.totalDuration && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Duration:</span>
                                <span className="text-sm">{displayExecution.totalDuration}ms</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Nodes Executed:</span>
                              <span className="text-sm">{displayExecution.results.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Success Rate:</span>
                              <span className="text-sm">
                                {Math.round((displayExecution.results.filter(r => r.success).length / displayExecution.results.length) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Execution Selected</p>
                  <p className="text-sm">Select an execution from the sidebar to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
