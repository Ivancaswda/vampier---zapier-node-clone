'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SettingsIcon, Trash2 } from 'lucide-react'

interface WorkflowNodeProps {
    name: string
    description?: string
    children: React.ReactNode
    onDelete?: () => void
    onSettings?: () => void
    className?: string
    status?: 'idle' | 'loading' | 'success' | 'error'
}
const statusClasses: Record<string, string> = {
    idle: 'border-gray-200',
    loading: 'border-yellow-400 animate-pulse',
    success: 'border-green-500',
    error: 'border-red-500'
}

export const WorkflowNode: React.FC<WorkflowNodeProps> = ({
                                                              name,
                                                              description,
                                                              children,
                                                              onDelete,
                                                              onSettings,
                                                              className,
    status="idle"
                                                          }) => {


    return (
        <div
            className={cn(
                'bg-white rounded-lg shadow p-3 w-48 border transition-all duration-300',
                statusClasses[status ],
                className
            )}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{name}</p>
                    {description && (
                        <p className="text-xs text-muted-foreground break-words">
                            {description}
                        </p>
                    )}
                </div>
                <div className="flex gap-1 ml-2 shrink-0">
                    {onSettings && (
                        <Button size="icon" variant="ghost" onClick={onSettings}>
                            <SettingsIcon className="w-4 h-4" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button size="icon" variant="ghost" onClick={onDelete}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-1">
                {children}
            </div>
        </div>
    )
}

WorkflowNode.displayName = 'WorkflowNode'
export default WorkflowNode