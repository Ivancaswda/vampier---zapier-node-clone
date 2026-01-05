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
import {FaTelegram} from "react-icons/fa";

export const telegramNode = (props: any) => {
    const nodeData = props.data || {};
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: telegramChannel().name,
        topic: 'status',
        refreshToken: fetchTelegramRealtimeToken,
    });

    const description = nodeData.variableName
        ? `${nodeData.variableName}: ${nodeData.content?.slice(0, 12)}...`
        : 'Не настроено';

    const [open, setOpen] = useState(false);

    const [botToken, setBotToken] = useState(nodeData.botToken || '');
    const [chatId, setChatId] = useState(nodeData.chatId || '');
    const [content, setContent] = useState(nodeData.content || '');
    const [variableName, setVariableName] = useState(
        nodeData.variableName || 'telegramResult'
    );

    const handleSave = useCallback(() => {
        setNodes((nodes: any[]) =>
            nodes.map((node) =>
                node.id === props.id
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            botToken,
                            chatId,
                            content,
                            variableName,
                        },
                    }
                    : node
            )
        );
        setOpen(false);
    }, [setNodes, props.id, botToken, chatId, content, variableName]);

    return (
        <>
            <BaseExecutionNode
                {...props}
                status={nodeStatus}
                icon={FaTelegram}
                name="Telegram"
                description={description}
                onSettings={() => setOpen(true)}
                onDoubleClick={() => setOpen(true)}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg space-y-1">
                    <DialogHeader>
                        <DialogTitle>Отправка сообщения в Telegram</DialogTitle>
                    </DialogHeader>


                    <div className="grid gap-1">
                        <label className="text-sm font-medium">
                            Имя переменной
                        </label>
                        <Input
                            value={variableName}
                            onChange={(e) => setVariableName(e.target.value)}
                            placeholder="telegramResult"
                        />
                        <p className="text-xs text-muted-foreground">
                            Под этим именем результат будет доступен в следующих шагах
                        </p>
                    </div>


                    <div className="grid gap-1">
                        <label className="text-sm font-medium">
                            Bot Token
                        </label>
                        <Input
                            value={botToken}
                            onChange={(e) => setBotToken(e.target.value)}
                            placeholder="1234567890:AA..."
                        />
                    </div>


                    <div className="grid gap-1">
                        <label className="text-sm font-medium">
                            Chat ID
                        </label>
                        <Input
                            value={chatId}
                            onChange={(e) => setChatId(e.target.value)}
                            placeholder="123456789"
                        />
                    </div>


                    <div className="grid gap-1">
                        <label className="text-sm font-medium">
                            Текст сообщения
                        </label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Привет! {{user.name}}"
                        />
                        <p className="text-xs text-muted-foreground">
                            Можно использовать переменные из предыдущих шагов
                        </p>
                    </div>


                    <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">
                            Как получить Bot Token и Chat ID:
                        </p>
                        <p>1. В Telegram открой бота <b>@BotFather</b></p>
                        <p>2. Напиши команду <code>/newbot</code> и создай бота</p>
                        <p>3. Скопируй выданный <b>Bot Token</b></p>
                        <p>4. Напиши любое сообщение своему боту</p>
                        <p>
                            5. Открой в браузере:<br />
                            <code>
                                https://api.telegram.org/botTOKEN/getUpdates
                            </code>
                        </p>
                        <p>
                            6. Скопируй значение <b>chat.id</b>
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
