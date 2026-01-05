'use client'
import React, {useCallback, useState} from "react";
import { BaseExecutionNode } from "@/components/base-execution-node";
import {CopyIcon, GlobeIcon, MousePointerIcon, StarIcon} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import {useNodeStatus} from "@/hooks/use-node-status";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {googleFormTriggerChannel} from "@/inngest/channels/google-form-trigger";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {useParams} from "next/navigation";
import {toast} from "sonner";
import {Label} from "@/components/ui/label";

import {stripeTriggerChannel} from "@/inngest/channels/stripe-trigger";
import {fetchStripeRealtimeToken} from "@/app/(dashboard)/(rest)/nodes/components/stripe-trigger/actions";
import {FaStripe} from "react-icons/fa";

const StripeTrigger = (props: any) => {
    const { setNodes } = useReactFlow();
    const {workflowId} = useParams()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: stripeTriggerChannel().name,
        topic: 'status',
        refreshToken:   fetchStripeRealtimeToken
    })
    console.log('googleNodeStatus===')
    console.log(nodeStatus)
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            toast.success("Webhook URL скопирован в буфер обмена")
        } catch (error) {
            toast.error('failed to copy url')
        }
    }
    const [open, setOpen] = useState(false);

    const handleDelete = useCallback(() => {
        setNodes((nodes: any[]) => nodes.filter(node => node.id !== props.id))
    }, [setNodes, props.id]);

    return (
        <>
            <BaseExecutionNode
                {...props}
                status={nodeStatus}
                icon={FaStripe}
                name="Триггер Stripe"
                description="Запускается при событии Stripe"
                onSettings={() => setOpen(true)}
                onDoubleClick={() => {}}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Настройка триггера Stripe</DialogTitle>
                        <DialogDescription>
                            Webhook используется для получения событий от Stripe
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="webhook-url">
                                Webhook Url
                            </Label>
                            <div className="flex gap-2">
                                <Input id="webhook-url" value={webhookUrl} readOnly={true} className="font-mono text-sm"/>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    onClick={copyToClipboard}
                                >

                                </Button>
                            </div>
                        </div>
                        <div className="rounded-lg bg-muted p-4 space-y-2">
                            <h4 className='font-medium text-sm'>Инструкция по настройке</h4>
                            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                <li>Откройте панель Stripe</li>
                                <li>Перейдите в Developers → Webhooks</li>
                                <li>Нажмите «Add endpoint»</li>
                                <li>Вставьте Webhook URL</li>
                                <li>Выберите нужные события</li>
                                <li>Сохраните настройки</li>
                            </ol>
                        </div>


                        <div className='rounded-lg bg-muted p-4 space-y-2'>
                            <h4 className="font-medium text-xs">Разрешенные переменные</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li><code className='bg-backhround px-1 py-0.5'>
                                    {"{{stripe.amount}}"}
                                </code> - Стоимость покупки</li>
                                <li><code className='bg-backhround px-1 py-0.5'>
                                    {"{{stripe.currency}}"}
                                </code> - код валюты</li>
                                <li><code className='bg-backhround px-1 py-0.5'>
                                    {"{{stripe.customerId}}"}
                                </code> - STRIPE CUSTOMER ID</li>
                                <li><code className='bg-backhround px-1 py-0.5'>
                                    {"{{stripe.eventType}}"}
                                </code> - stripe eventType</li>
                            </ul>
                        </div>

                    </div>



                </DialogContent>
            </Dialog>
        </>
    );
};

export default StripeTrigger;
