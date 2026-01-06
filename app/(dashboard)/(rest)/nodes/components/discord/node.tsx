'use client'
import React, {useState, useCallback, useEffect} from "react";
import { BaseExecutionNode } from "@/components/base-execution-node";
import {GlobeIcon, SparkleIcon} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useReactFlow } from "@xyflow/react";
import {useNodeStatus} from "@/hooks/use-node-status";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {fetchGeminiRealtimeToken} from "@/app/(dashboard)/(rest)/executions/components/gemini/actions";
import {geminiChannel} from "@/inngest/channels/gemini";
import axios from "axios";
import {toast} from "sonner";
import Image from "next/image";

import {discordChannel} from "@/inngest/channels/discord";
import {fetchDiscordRealtimeToken} from "@/app/(dashboard)/(rest)/nodes/components/discord/actions";
import {FaDiscord} from "react-icons/fa";

export const discordNode = (props: any) => {
    const nodeData = props.data || {};
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: discordChannel().name,
        topic: 'status',
        refreshToken: fetchDiscordRealtimeToken
    })
    console.log('discordStatus')
    console.log(nodeStatus)
    const description = nodeData.variableName
        ? `${nodeData.variableName || 'GET'} : ${nodeData.content.slice(0,10)}...`
        : 'Не настроено';

    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState(nodeData.username ||'');
    const [content, setContent] = useState(nodeData.content ||  '');
    const [webhookUrl, setWebhookUrl] = useState( nodeData.webhookUrl ||'');
    const [body, setBody] = useState(nodeData.body || '');
    const [variableName, setVariableName] = useState(nodeData.variableName || "discordCall")
    const handleSave = useCallback(() => {
        setNodes((nodes: any[]) =>
            nodes.map((node) => {
                if (node.id === props.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            username,
                            webhookUrl,
                            content,
                            body,
                            variableName,
                              },
                    };
                }
                return node;
            })
        );
        setOpen(false);
    }, [setNodes, props.id, webhookUrl, content, username, body, variableName]);

    const handleDelete = useCallback(() => {
        setNodes((nodes: any[]) => nodes.filter(node => node.id !== props.id))
    }, [setNodes, props.id]);





    return (
        <>
            <BaseExecutionNode
                {...props}
                status={nodeStatus}
                icon={FaDiscord}
                name="Discord"
                description={description || "Не настроено"}
                onSettings={() => setOpen(true)}
                onDoubleClick={() => setOpen(true)}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Настройка Discord webhook</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Имя переменной</label>

                        <Input
                            value={variableName}
                            onChange={e => setVariableName(e.target.value)}
                            placeholder="discordResult"
                        />

                        <p className="text-gray-600">
                            Имя должно начинаться с буквы или _, и содержать только буквы, цифры и _
                        </p>
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Имя пользователя</label>

                        <Input
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Bot"
                        />

                        <p className="text-gray-600">
                            Имя, от которого будет отправлено сообщение
                        </p>   </div>
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Сообщение</label>

                        <Textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Введите текст сообщения..."
                        />

                        <p className="text-gray-600">
                            Сообщение Discord не может превышать 2000 символов
                        </p> </div>
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Webhook URL</label>

                        <Input
                            value={webhookUrl}
                            onChange={e => setWebhookUrl(e.target.value)}
                            placeholder="https://discord.com/api/webhooks/..."
                        />

                        <p className="text-gray-600">
                            Чтобы получить перейдите в настройки вашего сервера - Интеграции - создайте ваш вебхук URL - скопируйте и вставьте в Vampier
                        </p>  </div>


                    <DialogFooter>
                        <Button className="w-full py-3" onClick={handleSave}>Сохранить</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
