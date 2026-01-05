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
import {fetchVkRealtimeToken} from "@/app/(dashboard)/(rest)/nodes/components/vk/actions";
import {FaVk} from "react-icons/fa";
import {vkChannel} from "@/inngest/channels/vk";

export const vkNode = (props: any) => {
    const nodeData = props.data || {};
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: vkChannel().name,
        topic: 'status',
        refreshToken: fetchVkRealtimeToken,
    });
    console.log('vkStatus===')
    console.log(nodeStatus)
    const description = nodeData.variableName
        ? `${nodeData.variableName}: ${nodeData.content?.slice(0, 12)}...`
        : 'Не настроено';

    const [open, setOpen] = useState(false);

    const [accessToken, setAccessToken] = useState(nodeData.accessToken || '');
    const [peerId, setPeerId] = useState(nodeData.peerId || '');
    const [content, setContent] = useState(nodeData.content || '');
    const [variableName, setVariableName] = useState(
        nodeData.variableName || 'vkResult'
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
                            peerId,
                            content,
                            variableName,
                        },
                    }
                    : node
            )
        );
        setOpen(false);
    }, [setNodes, props.id, accessToken, peerId, content, variableName]);

    return (
        <>
            <BaseExecutionNode
                {...props}
                status={nodeStatus}
                icon={FaVk}
                name="VK"
                description={description}
                onSettings={() => setOpen(true)}
                onDoubleClick={() => setOpen(true)}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg space-y-2">
                    <DialogHeader>
                        <DialogTitle>Отправка сообщения ВКонтакте</DialogTitle>
                    </DialogHeader>

                    <Input
                        placeholder="Имя переменной (vkResult)"
                        value={variableName}
                        onChange={(e) => setVariableName(e.target.value)}
                    />

                    <Input
                        placeholder="Access Token сообщества"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                    />

                    <Input
                        placeholder="ID пользователя или peer_id"
                        value={peerId}
                        onChange={(e) => setPeerId(e.target.value)}
                    />



                    <Textarea
                        placeholder="Текст сообщения"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    <div className="rounded-md bg-muted p-3 text-xs space-y-2">
                        <p className="font-medium">Как получить данные для отправки сообщений:</p>

                        <p>
                            <b>1. Access Token сообщества</b>
                        </p>
                        <p>
                            Зайди в своё сообщество ВКонтакте →
                            <br />
                            <b>Управление → Дополнительно → Работа с API → Ключи доступа</b>
                            <br />
                            Создай ключ с правом <b>«Сообщения»</b> и скопируй токен.
                        </p>

                        <p>
                            <b>2. peer_id (кому будет отправлено сообщение)</b>
                        </p>
                        <p>
                            Сначала напиши <b>любое сообщение</b> этому сообществу.
                            <br />
                            Затем открой:
                            <br />
                            <code>https://dev.vk.com/method/messages.getConversations</code>
                            <br />
                            Вставь access_token сообщества и нажми «Выполнить».
                        </p>

                        <p>
                            В ответе найди:
                            <br />
                            <code>"peer": {"{ id: 123456789 }"}</code>
                            <br />
                            Это число и есть <b>peer_id</b>.
                        </p>

                        <p className="opacity-80">
                            ⚠️ Без сообщения сообществу peer_id не появится.
                        </p>
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
