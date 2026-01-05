'use client'
import React, {useState, useCallback, useEffect} from "react";
import { BaseExecutionNode } from "@/components/base-execution-node";
import {GlobeIcon, SparkleIcon, SunIcon} from "lucide-react";
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
import {anthropicChannel} from '@/inngest/channels/anthropic'
import axios from "axios";
import {toast} from "sonner";
import {fetchAnthropicRealtimeToken} from "@/app/(dashboard)/(rest)/nodes/components/anthropic/actions";

export const anthropicNode = (props: any) => {
    const nodeData = props.data || {};
    const { setNodes } = useReactFlow();
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: anthropicChannel().name,
        topic: 'status',
        refreshToken: fetchAnthropicRealtimeToken
    })
    console.log(nodeStatus)
    const description = nodeData.systemPrompt
        ? `${nodeData.model || 'GET'} : ${nodeData.systemPrompt.slice(0,10)}...`
        : 'Не настроено';

    const [open, setOpen] = useState(false);
    const [model, setModel] = useState('claude-sonnet-4-5');
    const [systemPrompt, setSystemPrompt] = useState(nodeData.systemPrompt ||  '');
    const [userPrompt, setUserPrompt] = useState( nodeData.userPrompt ||'');
    const [body, setBody] = useState(nodeData.body || '');
    const [variableName, setVariableName] = useState(nodeData.variableName || "anthropicCall")
    const handleSave = useCallback(() => {
        setNodes((nodes: any[]) =>
            nodes.map((node) => {
                if (node.id === props.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            model,
                            systemPrompt,
                            userPrompt,
                            body,
                            variableName,
                            credentialValue: credentials && credentials.length > 0 ? selectedCredential?.value : credentials?.value

                        },
                    };
                }
                return node;
            })
        );
        setOpen(false);
    }, [setNodes, props.id, model, systemPrompt, userPrompt, body, variableName]);

    const handleDelete = useCallback(() => {
        setNodes((nodes: any[]) => nodes.filter(node => node.id !== props.id))
    }, [setNodes, props.id]);
    const [selectedCredential, setSelectedCredential] = useState<string | null>(null);

    const [credentials, setCredentials] = useState()
    useEffect(() => {
        getAnthropicCredentials()
    }, []);


    const getAnthropicCredentials = async () => {
        try {
            const {data} = await axios.get(`/api/credentials/getByType?type=anthropic`);
            // Всегда массив
            setCredentials(data.credential || []);
            if (data.credential?.length > 0) {
                setSelectedCredential(data.credential[0].credentialId); // default
            }
        } catch (error) {
            toast.error('Failed to get gemini credentials');
        }
    }
    return (
        <>
            <BaseExecutionNode
                {...props}
                status={nodeStatus}
                icon={SunIcon}
                name="Anthropic"
                description={description || "Не настроено"}
                onSettings={() => setOpen(true)}
                onDoubleClick={() => setOpen(true)}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Настройка запроса Anthropic</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Имя переменной</label>

                        <Input
                            value={variableName}
                            onChange={e => setVariableName(e.target.value)}
                            placeholder="anthropicResult"
                        />

                        <p className="text-gray-600">
                            Используйте имя для доступа к результату в других нодах:{" "}
                            <code>{variableName || "anthropicResult"}.data</code>
                        </p></div>
                    <div className="grid gap-4 ">
                        <div className="grid gap-1">
                            <label className="text-sm font-medium">Модель</label>


                            <Select onValueChange={setModel} defaultValue={"claude-opus-4-1"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите модель Anthropic" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="claude-opus-4-1">claude-opus-4-1</SelectItem>

                                    <SelectItem value="claude-opus-4-5">claude-opus-4-5</SelectItem>



                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1">
                            <label className="text-sm font-medium">Учетные данные</label>


                            <Select
                                onValueChange={(val) => setSelectedCredential(val)}
                                value={selectedCredential || undefined}
                                placeholder="Select credential"
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите учетные данные" />

                                </SelectTrigger>
                                <SelectContent>
                                    { credentials && credentials.length > 1 && credentials?.map((c) => (
                                        <SelectItem value={c.credentialId} key={c.credentialId}>
                                            <div className='flex items-center gap-2'>
                                                <SparkleIcon width={16} height={16}/>
                                                {c.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                    {credentials && !credentials.length &&       <SelectItem value={credentials.credentialId} key={credentials.credentialId}>
                                        <div className='flex items-center gap-2'>
                                            <SparkleIcon width={16} height={16}/>
                                            {credentials.name}
                                        </div>
                                    </SelectItem>}

                                </SelectContent>
                            </Select>
                        </div>


                        <div className="grid gap-1">
                            <label className="text-sm font-medium">System Prompt (Необязательно)</label>
                            <Textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} placeholder="" />
                        </div>


                        <div className="grid gap-1">
                            <label className="text-sm font-medium">User Prompt </label>
                            <Textarea value={userPrompt} onChange={e => setUserPrompt(e.target.value)} placeholder="" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button className="w-full py-3" onClick={handleSave}>
                            Сохранить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
