import type {Realtime} from "@inngest/realtime";
import {useInngestSubscription} from "@inngest/realtime/hooks";

import {useEffect, useState} from "react";

export function useNodeStatus({nodeId, channel, topic, refreshToken}:any) {
    const [status, setStatus] = useState();
    const {data} = useInngestSubscription({
        refreshToken,
        enabled:true
    })
    useEffect(() => {
        if (!data?.length) {
            return
        }

        // latest message for this node
    const latestMessage = data.filter((msg) => msg.kind === 'data' && msg.channel === channel && msg.topic === topic && msg.data.nodeId === nodeId )
        .sort((a,b) => {
            if (a.kind === 'data' && b.kind === 'data') {
                return (
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            }
            return  0
        })[0];

        if (latestMessage?.kind === 'data'){
            setStatus(latestMessage.data.status)
        }
    }, [data, nodeId, channel, topic]);
    return status;
}

export function useWorkflowExecutionStatus({
                                               workflowId,
                                               channel,
                                               topic,
                                               refreshToken,
                                           }: {
    workflowId: string;
    channel: string;
    topic: string;
    refreshToken: () => Promise<string>;
}) {
    const [status, setStatus] = useState<{
        status: "running" | "success" | "error";
        message?: string;
    } | null>(null);

    const { data } = useInngestSubscription({
        refreshToken,
        enabled: true,
    });

    useEffect(() => {
        if (!data?.length) return;

        const latest = data
            .filter(
                (msg) =>
                    msg.kind === "data" &&
                    msg.channel === channel &&
                    msg.topic === topic &&
                    msg.data.workflowId === workflowId
            )
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            )[0];

        if (latest?.kind === "data") {
            setStatus({
                status: latest.data.status,
                message: latest.data.message,
            });
        }
    }, [data, workflowId, channel, topic]);

    return status;
}