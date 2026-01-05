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
import { emailChannel } from "@/inngest/channels/email";
import { fetchEmailRealtimeToken } from "./actions";
import { MailIcon } from "lucide-react";

export const EmailNode = (props: any) => {
    const { setNodes } = useReactFlow();
    const data = props.data || {};

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: emailChannel().name,
        topic: "status",
        refreshToken: fetchEmailRealtimeToken,
    });

    const [open, setOpen] = useState(false);
    const [from, setFrom] = useState(data.from || "");
    const [to, setTo] = useState(data.to || "");
    const [subject, setSubject] = useState(data.subject || "");
    const [content, setContent] = useState(data.content || "");
    const [variableName, setVariableName] = useState(
        data.variableName || "emailResult"
    );

    const handleSave = useCallback(() => {
        setNodes((nodes: any[]) =>
            nodes.map((n) =>
                n.id === props.id
                    ? {
                        ...n,
                        data: { ...n.data, to, subject, content, variableName, from },
                    }
                    : n
            )
        );
        setOpen(false);
    }, [to, subject, content, variableName, from]);

    return (
        <>
            <BaseExecutionNode
                {...props}
                status={nodeStatus}
                icon={MailIcon}
                name="Email"
                description={subject || "Отправка email"}
                onSettings={() => setOpen(true)}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg space-y-2">
                    <DialogHeader>
                        <DialogTitle>Отправка Email</DialogTitle>
                    </DialogHeader>

                    <Input
                        placeholder="Кому (email)"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                    />

                    <Input
                        placeholder="Тема письма"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />

                    <Textarea
                        placeholder="Тело письма (можно {{variables}})"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    <Input
                        placeholder="Имя переменной (emailResult)"
                        value={variableName}
                        onChange={(e) => setVariableName(e.target.value)}
                    />
                    <Input
                        placeholder="От кого (noreply@yourdomain.com)"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                    />

                    <div className="rounded-md bg-muted p-3 text-xs space-y-1">
                        <p className="font-medium">Важно про отправителя</p>

                        <p>
                            Для отправки email нужен <b>ваш собственный домен</b>.
                        </p>

                        <p>
                            1. Купите домен (Namecheap, Cloudflare, Reg.ru и т.д.)
                        </p>

                        <p>
                            2. Подключите домен в <b>Resend</b> (DNS-записи)
                        </p>

                        <p>
                            3. Используйте email вида:
                            <br />
                            <code>noreply@yourdomain.com</code>
                        </p>

                        <p className="opacity-80">
                            ⚠️ Без подключённого домена Resend разрешает отправку
                            <br />
                            только <b>на ваш собственный email</b>.
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
