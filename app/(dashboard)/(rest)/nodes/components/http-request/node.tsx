'use client'
import React, { useState, useCallback } from "react";
import { BaseExecutionNode } from "@/components/base-execution-node";
import { GlobeIcon } from "lucide-react";
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
import {fetchHttpRequestRealtimeToken} from "@/app/(dashboard)/(rest)/nodes/components/http-request/actions";

export const HttpRequestNode = (props: any) => {
    const nodeData = props.data || {};
    const { setNodes } = useReactFlow();
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: httpRequestChannel().name,
        topic: 'status',
        refreshToken: fetchHttpRequestRealtimeToken
    })
    const description = nodeData.endpoint
        ? `${nodeData.method || 'GET'} : ${nodeData.endpoint}`
        : 'Не настроено';

    const [open, setOpen] = useState(false);
    const [method, setMethod] = useState(nodeData.method || 'GET');
    const [endpoint, setEndpoint] = useState(nodeData.endpoint || '');
    const [body, setBody] = useState(nodeData.body || '');
    const [variableName, setVariableName] = useState(nodeData.variableName || "myApiCall")
    const handleSave = useCallback(() => {
        setNodes((nodes: any[]) =>
            nodes.map((node) => {
                if (node.id === props.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            method,
                            endpoint,
                            body,
                            variableName
                        },
                    };
                }
                return node;
            })
        );
        setOpen(false);
    }, [setNodes, props.id, method, endpoint, body, variableName]);

    const handleDelete = useCallback(() => {
        setNodes((nodes: any[]) => nodes.filter(node => node.id !== props.id))
    }, [setNodes, props.id]);

    return (
        <>
            <BaseExecutionNode
                {...props}
                status={nodeStatus}
                icon={GlobeIcon}
                name="HTTP Запрос"
                description={description}
                onSettings={() => setOpen(true)}
                onDoubleClick={() => setOpen(true)}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Настройка HTTP-запроса</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Имя переменной</label>
                        <Input value={variableName} onChange={e => setVariableName(e.target.value)} placeholder="myApiCall" />
                        <p className="text-gray-600">Используй чтобы достичь и получить данные в след HTTP запросе : {variableName|| 'myApiCall'}.httpsResponse.data</p>
                    </div>
                    <div className="grid gap-4 ">
                        <div className="grid gap-1">
                            <label className="text-sm font-medium">Метод</label>
                            <Select onValueChange={setMethod} defaultValue={method}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите метод" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PATCH">PATCH</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                        <div className="grid gap-1">
                            <label className="text-sm font-medium">Endpoint URL</label>
                            <Input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="/api/example" />
                        </div>
                        {method !== "GET" && (
                            <div className="grid gap-1">
                                <label className="text-sm font-medium">Request Body</label>
                                <Textarea
                                    value={body}
                                    onChange={e => setBody(e.target.value)}
                                    placeholder='{"key":"value"}'
                                />
                            </div>
                        )}

                    </div>

                    <DialogFooter>
                        <Button className="w-full py-3" onClick={handleSave}>Сохранить</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
