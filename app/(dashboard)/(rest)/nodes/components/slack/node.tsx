'use client'
import React, {useState, useCallback, useEffect} from "react";
import { BaseExecutionNode } from "@/components/base-execution-node";
import {AlertCircleIcon, GlobeIcon, SparkleIcon} from "lucide-react";
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

import {slackChannel} from "@/inngest/channels/slack";
import {fetchSlackRealtimeToken} from "@/app/(dashboard)/(rest)/nodes/components/slack/actions";
import {FaSlack} from "react-icons/fa";

export const slackNode = (props: any) => {
    const nodeData = props.data || {};
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: slackChannel().name,
        topic: 'status',
        refreshToken: fetchSlackRealtimeToken
    })
    console.log('slackStatus')
    console.log(nodeStatus)
    const description = nodeData.username
        ? `${nodeData.username || 'GET'} : ${nodeData.content.slice(0,10)}...`
        : 'Не настроено';

    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState(nodeData.username ||'');
    const [content, setContent] = useState(nodeData.content ||  '');
    const [webhookUrl, setWebhookUrl] = useState( nodeData.webhookUrl ||'');

    const [body, setBody] = useState(nodeData.body || '');
    const [variableName, setVariableName] = useState(nodeData.variableName || "slackCall")
    const handleSave = useCallback(() => {
        setNodes((nodes: any[]) =>
            nodes.map((node) => {
                if (node.id === props.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            username,
                            content,
                            webhookUrl,
                            body,
                            variableName,
                               },
                    };
                }
                return node;
            })
        );
        setOpen(false);
    }, [setNodes, props.id, content, webhookUrl, username, body, variableName]);

    const handleDelete = useCallback(() => {
        setNodes((nodes: any[]) => nodes.filter(node => node.id !== props.id))
    }, [setNodes, props.id]);

    return (
        <>
            <BaseExecutionNode
                {...props}
                status={nodeStatus}
                icon={FaSlack}
                name="Slack"
                description={description}
                onSettings={() => setOpen(true)}
                onDoubleClick={() => setOpen(true)}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Gemini request</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Variable Name</label>
                        <Input value={variableName} onChange={e => setVariableName(e.target.value)} placeholder="DiscordCall" />
                        <p className="text-gray-600">Variable name must start with a letter or underscore and contain only letters, number and underscores</p>
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Username</label>
                        <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Johannes_Boe" />
                        <p className="text-gray-600">Name of user you want to correspond with </p>
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Content</label>
                        <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Your content...." />
                        <p className="text-gray-600">Slack messages cannot exceed 2000 characters</p>
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Webhook Url</label>
                        <Input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://hooks.slack.com/triggers/T0A7979....." />
                        <p className="text-gray-600 test-sm">Enter webhook url, you can find it in sublet "More" -- Tools -- + New -- Build a workflow -- Choose an Event -- From Webhook Url - Setup variable (in key must be "content", in data type "text") - Continue - Enter Webhook one more time and at the bottom you will se webhook url  </p>
                    </div>
                    <div className='mt-3'>
                        <h1 className='text-lg font-bold flex items-center gap-3'>Important thing
                        <AlertCircleIcon/></h1>
                        <p className="text-gray-600" >Make sure the key in your slack webhook settings is "content" otherwise it would not work</p>
                    </div>

                    <DialogFooter>
                        <Button className="w-full py-3" onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
