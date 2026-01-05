'use client'
import React, { useCallback, useState } from "react";
import { BaseExecutionNode } from "@/components/base-execution-node";
import { CopyIcon } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useNodeStatus } from "@/hooks/use-node-status";
import { FaYandex } from "react-icons/fa";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { fetchYandexTriggerRealtimeToken } from "@/app/(dashboard)/(rest)/nodes/components/yandex-form-trigger/actions";
import { yandexFormTriggerChannel } from "@/inngest/channels/yandex";

const YandexFormTrigger = (props: any) => {
    const { setNodes } = useReactFlow();
    const { workflowId } = useParams();

    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const webhookUrl = `${baseUrl}/api/webhooks/yandex-form?workflowId=${workflowId}`;

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: yandexFormTriggerChannel().name,
        topic: "status",
        refreshToken: fetchYandexTriggerRealtimeToken
    });

    const [open, setOpen] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            toast.success("Webhook URL copied");
        } catch {
            toast.error("Failed to copy");
        }
    };

    const handleDelete = useCallback(() => {
        setNodes((nodes: any[]) => nodes.filter(n => n.id !== props.id));
    }, [setNodes, props.id]);

    return (
        <>
            <BaseExecutionNode
                {...props}
                status={nodeStatus}
                icon={FaYandex}
                name="Запуск яндекса"
                description="Запускает яндекс на вашем сценарии"
                onSettings={() => setOpen(true)}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Конфигурация Запуска Яндекса</DialogTitle>
                        <DialogDescription>
                            Запускает яндекс на вашем сценарии
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Webhook URL</Label>
                            <div className="flex gap-2">
                                <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                                    <CopyIcon className="size-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-lg bg-muted p-4 space-y-2">
                            <h4 className="font-medium text-sm">Инструкция по настройке</h4>

                            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                                <li>Откройте нужную Яндекс Форму</li>
                                <li>Перейдите в <b>Настройки → Интеграции</b></li>
                                <li>Пролистайте вниз,  <b>Найдите API кнопку</b></li>
                                <li>Выберите <b>Запрос заданным методом</b></li>
                                <li>В поле <b>URL</b> вставьте Webhook URL выше</li>
                                <li>Установите метод запроса: <b>POST</b></li>
                                <li>В тело запроса вставьте: Ответ на Вопрос</li>
                                <li>Сохраните настройки</li>
                                <li>Отправьте форму один раз для проверки</li>
                            </ol>
                        </div>

                        <div className="rounded-lg bg-muted p-4 space-y-2">
                            <h4 className="font-medium text-xs">Доступные переменные</h4>

                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>
                                    <code>{"{{yandexForm.raw}}"}</code> — необработанный текст ответа
                                </li>
                                <li>
                                    <code>{"{{yandexForm.body}}"}</code> — данные формы (если JSON)
                                </li>
                                <li>
                                    <code>{"{{yandexForm.body.raw}}"}</code> — текст ответа (fallback)
                                </li>
                            </ul>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default YandexFormTrigger;
