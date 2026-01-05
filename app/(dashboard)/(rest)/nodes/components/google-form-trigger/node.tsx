'use client'
import React, {useCallback, useState} from "react";
import { BaseExecutionNode } from "@/components/base-execution-node";
import {CopyIcon, GlobeIcon, MousePointerIcon} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import {useNodeStatus} from "@/hooks/use-node-status";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {fetchHttpRequestRealtimeToken} from "@/app/(dashboard)/(rest)/executions/components/http-request/actions";
import {manualTriggerChannel} from "@/inngest/channels/manual-trigger";
import {
    fetchManualTriggerRealtimeToken
} from "@/app/(dashboard)/(rest)/executions/components/manual-trigger-node/actions";
import {FaGoogle} from "react-icons/fa";
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
import {generateGoogleFormScript} from "@/lib/utils";
import {fetchGoogleTriggerRealtimeToken} from "@/app/(dashboard)/(rest)/nodes/components/google-form-trigger/actions";


const GoogleFormTrigger = (props: any) => {
    const { setNodes } = useReactFlow();
    const {workflowId} = useParams()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: googleFormTriggerChannel().name,
        topic: 'status',
        refreshToken:   fetchGoogleTriggerRealtimeToken
    })
    console.log('googleNodeStatus===')
    console.log(nodeStatus)
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            toast.success("Webhook URL copied to clipboard")
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
                icon={FaGoogle}
                name="Триггер Google Формы"
                description="Запускает workflow при отправке формы"
                onSettings={() => setOpen(true)}
                onDoubleClick={() => {}}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Настройка триггера Google Формы</DialogTitle>
                        <DialogDescription>
                            Workflow запускается при каждом новом ответе в Google Форме
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
                                <li>Откройте Google Форму</li>
                                <li>Нажмите на меню из трёх точек</li>
                                <li>Выберите «Редактор скриптов» (Apps Script)</li>
                                <li>Вставьте скрипт ниже</li>
                                <li>Замените <b>WEBHOOK_URL</b> на URL выше</li>
                                <li>Сохраните проект</li>
                                <li>Перейдите в «Триггеры» и добавьте триггер</li>
                                <li>Тип: <b>При отправке формы</b></li>
                            </ol>
                        </div>
                        <div className="rounded-lg bg-muted p-4 space-y-3">
                            <h4 className="font-medium text-sm">Google Apps script:</h4>
                            <Button onClick={ async () => {
                                const script = generateGoogleFormScript(webhookUrl);
                                try {
                                    await navigator.clipboard.writeText(script)
                                    toast.success("Script copied to clipboard")
                                } catch (error) {
                                    toast.error('failed to copy script to clipboard')
                                }
                            }} type='button' variant="outline">
                                <CopyIcon className="size-4 mr-2"/>
                                Копировать Google Apps Script

                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Смотрите куда вставить Goggle Apps Script в инструкции выше
                               </p>
                        </div>

                        <div className='rounded-lg bg-muted p-4 space-y-2'>
                            <h4 className="font-medium text-xs">Доступные переменные</h4>

                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>
                                    <code>{"{{googleForm.respondentEmail}}"}</code> — email пользователя
                                </li>
                                <li>
                                    <code>{"{{googleForm.responses['Название вопроса']}}"}</code> — ответ на вопрос
                                </li>
                            </ul>
                        </div>

                    </div>



                </DialogContent>
            </Dialog>
        </>
    );
};

export default GoogleFormTrigger;
