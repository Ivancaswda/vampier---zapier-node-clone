'use client'
import React, {memo} from 'react'
import {Position} from '@xyflow/react'
import {BaseNode, BaseNodeContent} from "@/components/base-node";
import {BaseHandle} from "@/components/base-handle";
import Image from "next/image";
import {WorkflowNode} from './WorkflowNode'

export const BaseTriggerNode = memo(({
    id,
    icon:Icon,
    name, description, children, onSettings, onDoubleClick
}:any) => {
    
    const handleDelete = () => {
        
    }
    return (
        <WorkflowNode
            name={name}
            description={description}
            onDelete={handleDelete}
            onSettings={onSettings}
        >
            <BaseNode className='rounded-l-2xl relative group' onDoubleClick={onDoubleClick}>
                <BaseNodeContent>
                    {typeof  Icon === 'string' ? (
                        <Image src={Icon} alt={name} width={16} height={16} />
                    ) : (
                        <Icon className='size-4 text-muted-foreground'/>
                    )}

                    {children}

                    <BaseHandle id='source-1' type='source' position={Position.Right}/>
                </BaseNodeContent>
            </BaseNode>

        </WorkflowNode>
    )
})
BaseTriggerNode.displayName = 'BaseTriggerNode'
