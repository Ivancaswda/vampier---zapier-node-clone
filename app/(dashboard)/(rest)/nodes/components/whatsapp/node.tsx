'use client'
import React, { useState, useCallback } from "react";
import { BaseExecutionNode } from "@/components/base-execution-node";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useReactFlow } from "@xyflow/react";
import { useNodeStatus } from "@/hooks/use-node-status";
import { telegramChannel } from "@/inngest/channels/telegram";
import { fetchTelegramRealtimeToken } from "@/app/(dashboard)/(rest)/nodes/components/telegram/actions";
import {SendIcon} from "lucide-react";
import {fetchWhatsappRealtimeToken} from "@/app/(dashboard)/(rest)/nodes/components/whatsapp/actions";
import {whatsappChannel} from "@/inngest/channels/whatsapp";

export const whatsappNode = (props: any) => {
    const nodeData = props.data || {};
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: whatsappChannel().name,
        topic: 'status',
        refreshToken: fetchWhatsappRealtimeToken,
    });

    const description = nodeData.variableName
        ? `${nodeData.variableName}: ${nodeData.content?.slice(0, 12)}...`
        : 'Не настроено';

    const [open, setOpen] = useState(false);

    const [accessToken, setAccessToken] = useState(nodeData.accessToken || '');
    const [phoneNumberId, setPhoneNumberId] = useState(nodeData.phoneNumberId || '');
    const [to, setTo] = useState(nodeData.to || '');
    const [templateName, setTemplateName] = useState(nodeData.templateName || '');
    const [variableName, setVariableName] = useState(
        nodeData.variableName || 'whatsappResult'
    );

    const handleSave = useCallback(() => {
        setNodes((nodes: any[]) =>
            nodes.map((node) =>
                node.id === props.id
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            accessToken,
                            phoneNumberId,
                            to,
                            templateName,
                            variableName,
                        },
                    }
                    : node
            )
        );
        setOpen(false);
    }, [setNodes, props.id, accessToken, phoneNumberId, templateName,to, variableName]);

    return (
        <>
            <BaseExecutionNode
                {...props}
                status={nodeStatus}
                icon={'/whatsapp.png'}
                name="WhatsApp"
                description={description}
                onSettings={() => setOpen(true)}
                onDoubleClick={() => setOpen(true)}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg space-y-2">
                    <DialogHeader>
                        <DialogTitle>Отправка сообщения в WhatsApp</DialogTitle>
                    </DialogHeader>

                    <Input
                        placeholder="Имя переменной (whatsappResult)"
                        value={variableName}
                        onChange={(e) => setVariableName(e.target.value)}
                    />

                    <Input
                        placeholder="Access Token (Meta)"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                    />

                    <Input
                        placeholder="Phone Number ID"
                        value={phoneNumberId}
                        onChange={(e) => setPhoneNumberId(e.target.value)}
                    />

                    <Input
                        placeholder="Номер получателя (+49123456789)"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                    />

                    <Input
                        placeholder="Имя шаблона (hello_world)"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                    />

                    <div className="rounded-md bg-muted p-3 text-xs space-y-1">
                        <p className="font-medium">Как получить данные:</p>
                        <p>1. Перейди на developers.facebook.com</p>
                        <p>2. Создай App → Business → WhatsApp</p>
                        <p>3. Скопируй <b>Access Token</b></p>
                        <p>4. Скопируй <b>Phone Number ID</b></p>
                        <p>5. Создай Template message (обязательно)</p>
                    </div>

                    <DialogFooter>
                        <Button className="w-full" onClick={handleSave}>
                            Сохранить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
