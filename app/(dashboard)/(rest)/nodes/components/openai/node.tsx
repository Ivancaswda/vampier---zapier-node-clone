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

import {openaiChannel} from "@/inngest/channels/openai";
import axios from "axios";
import {toast} from "sonner";
import {fetchOpenaiRealtimeToken} from "@/app/(dashboard)/(rest)/nodes/components/openai/actions";

export const openaiNode = (props: any) => {
    const nodeData = props.data || {};
    const { setNodes } = useReactFlow();
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: openaiChannel().name,
        topic: 'status',
        refreshToken: fetchOpenaiRealtimeToken
    })
    console.log(nodeStatus)
    const description = nodeData.systemPrompt
        ? `${nodeData.model || 'GET'} : ${nodeData.systemPrompt.slice(0,10)}...`
        : 'Не настроено';

    const [open, setOpen] = useState(false);
    const [model, setModel] = useState('gpt-4o-mini');
    const [systemPrompt, setSystemPrompt] = useState(nodeData.systemPrompt ||  '');
    const [userPrompt, setUserPrompt] = useState( nodeData.userPrompt ||'');
    const [body, setBody] = useState(nodeData.body || '');
    const [variableName, setVariableName] = useState(nodeData.variableName || "openaiCall")
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
        getOpenaiCredentials()
    }, []);


    const getOpenaiCredentials = async () => {
        try {
            const {data} = await axios.get(`/api/credentials/getByType?type=openai`);
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
                icon={GlobeIcon}
                name="Openai"
                description={description}
                onSettings={() => setOpen(true)}
                onDoubleClick={() => setOpen(true)}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit OpenAi request</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Variable Name</label>
                        <Input value={variableName} onChange={e => setVariableName(e.target.value)} placeholder="myApiCall" />
                        <p className="text-gray-600">Use the name to reference the result in other nodes: {variableName|| 'myApiCall'}.httpsResponse.data</p>
                    </div>
                    <div className="grid gap-4 ">
                        <div className="grid gap-1">
                            <label className="text-sm font-medium">Model</label>
                            <Select onValueChange={setModel} defaultValue={"gpt-4o-mini"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select model of openai" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                                    <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                                    <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1">
                            <label className="text-sm font-medium">Credentials</label>
                            <Select
                                onValueChange={(val) => setSelectedCredential(val)}
                                value={selectedCredential || undefined}
                                placeholder="Select credential"
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select credential" />
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
                            <label className="text-sm font-medium">System Prompt (Optional)</label>
                            <Textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} placeholder="" />
                        </div>


                        <div className="grid gap-1">
                            <label className="text-sm font-medium">User Prompt </label>
                            <Textarea value={userPrompt} onChange={e => setUserPrompt(e.target.value)} placeholder="" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button className="w-full py-3" onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
