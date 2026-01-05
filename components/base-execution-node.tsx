'use client'
import React, { memo, useCallback } from 'react'
import { Position, useReactFlow } from '@xyflow/react'
import {CheckIcon, CrossIcon, XIcon} from 'lucide-react'
import { BaseNode, BaseNodeContent } from "@/components/base-node"
import { BaseHandle } from "@/components/base-handle"
import Image from "next/image"
import { WorkflowNode } from "@/components/WorkflowNode"

export const BaseExecutionNode = memo(({
                                           id,
                                           icon: Icon,
                                           name,
                                           description,
                                           children,
                                           onSettings,
                                           onDoubleClick,
    status
                                       }: any) => {
    const { setNodes } = useReactFlow()

    const handleDelete = useCallback(() => {
        setNodes((nodes: any[]) => nodes.filter(node => node.id !== id))
    }, [setNodes, id])

    return (
        <WorkflowNode
            status={status}
            name={name}
            description={description}
            onDelete={handleDelete}
            onSettings={onSettings}
        >
            <BaseNode onDoubleClick={onDoubleClick}>
                <BaseNodeContent>
                    {status === 'success' ? (
                        <CheckIcon className="size-4 text-white rounded-sm bg-green-600" />
                    ) : status === 'error' ? (
                        <XIcon className="size-4 text-white rounded-sm bg-red-600" />
                    ) : typeof Icon === 'string' ? (
                        <Image src={Icon} alt={name} width={16} height={16} />
                    ) : (
                        <Icon className="size-4 text-muted-foreground" />
                    )}



                    {children}

                    <BaseHandle id='target-1' type='target' position={Position.Left}/>
                    <BaseHandle id='source-1' type='source' position={Position.Right}/>
                </BaseNodeContent>
            </BaseNode>
        </WorkflowNode>
    )
})

BaseExecutionNode.displayName = 'BaseExecutionNode'
