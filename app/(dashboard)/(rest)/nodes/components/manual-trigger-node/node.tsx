'use client'
import React, {useCallback, useState} from "react";
import { BaseExecutionNode } from "@/components/base-execution-node";
import { MousePointerIcon } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import {useNodeStatus} from "@/hooks/use-node-status";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {manualTriggerChannel} from "@/inngest/channels/manual-trigger";

import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {fetchManualTriggerRealtimeToken} from "@/app/(dashboard)/(rest)/nodes/components/manual-trigger-node/actions";

const ManualTriggerNode = (props: any) => {
    const { setNodes } = useReactFlow();
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: manualTriggerChannel().name,
        topic: 'status',
        refreshToken: fetchManualTriggerRealtimeToken
    })
    console.log('manualTriggerNode===')
    console.log(nodeStatus)
    const handleDelete = useCallback(() => {
        setNodes((nodes: any[]) => nodes.filter(node => node.id !== props.id))
    }, [setNodes, props.id]);
    const [open, setOpen] = useState<boolean>(false)

    return (
        <>

        <BaseExecutionNode
            status={nodeStatus}
            {...props}
            icon={MousePointerIcon}
            name="Ручной запуск"
            description="Запускает workflow вручную"
            onSettings={() => setOpen(true)}
            onDoubleClick={() => {}}
        />
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Настройка ручного запуска</DialogTitle>
                <DialogDescription>
                    Workflow запускается по нажатию кнопки
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">

                <div className="rounded-lg bg-muted p-4 space-y-2">
                    <h4 className='font-medium text-sm'>Как использовать</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Перейдите в редактор workflow</li>
                        <li>Нажмите кнопку «Выполнить workflow»</li>
                        <li>Дождитесь результата</li>
                    </ol>
                </div>




            </div>



        </DialogContent>
    </Dialog>
        </>
    );
};

export default ManualTriggerNode;
