"use client"
import React, {useCallback, useEffect, useMemo, useState} from "react";
import "@xyflow/react/dist/style.css";
import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls,
    Edge,
    EdgeChange,
    MiniMap,
    NodeChange,
    ReactFlow,
    Node,
    NodeProps, Panel
} from "@xyflow/react";
import axios from "axios";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import WorkflowIdBreadCrumbs from "@/app/(dashboard)/(editor)/workflows/[workflowId]/_components/WorkflowIdBreadCrumbs";
import NodeSelector from "@/components/NodeSelector";
import { Button } from "@/components/ui/button";
import {AlertCircleIcon, PlusIcon} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import InitialNode from "@/app/(dashboard)/(rest)/executions/components/initial-node/node";
import {nodeTypes} from "@/components/NodeSelector";
import ExecuteWorkflowButton from "@/components/ExecuteWorkflowButton";
import {workflowExecutionChannel} from "@/inngest/channels/workflow";
import {useWorkflowExecutionStatus} from "@/hooks/use-node-status";
import {fetchWorkflowRealtimeToken} from "@/app/(dashboard)/(editor)/workflows/[workflowId]/_components/actions";
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
// Кастомный node "InitialNode"


const WorkflowIdPage = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [workflow, setWorkflow] = useState<any>();
    const [open, setOpen] = useState(false);
    const [showInitialNode, setShowInitialNode] = useState(true);
    const { workflowId } = useParams();

    const executionStatus = useWorkflowExecutionStatus({
        workflowId,
        channel: workflowExecutionChannel().name,
        topic: "status",
        refreshToken: fetchWorkflowRealtimeToken,
    });
    console.log('executionstatus===')
    console.log(executionStatus)


    useEffect(() => {
        workflowId && getWorkflow();

        if (showInitialNode) {
            // initial node “+”
            setNodes((prev) => [
                {
                    id: "initial-node",
                    type: "initial_node",
                    position: { x: 0, y: 0 },
                    data: { open, onOpenChange: setOpen }
                },
                ...prev.filter((n) => n.id !== "initial-node")
            ]);
        }
    }, [workflowId]);
    useEffect(() => {
        if (!workflow) return;

        setNodes(prevNodes => {

            const serverNodeIds = workflow.nodes?.map((n:any) => n.id) || [];
            const newNodes = prevNodes.filter(n => !serverNodeIds.includes(n.id));

            return [...workflow.nodes, ...newNodes];
        });

        setEdges(prevEdges => {
            const serverEdgeIds = workflow.connections?.map((c:any) => `${c.fromNodeId}-${c.toNodeId}`) || [];
            const newEdges = prevEdges.filter(e => !serverEdgeIds.includes(e.id));

            return [...workflow.connections, ...newEdges];
        });

        setShowInitialNode(!workflow.nodes?.length);
    }, [workflow]);
    const getWorkflow = async () => {
        try {
            const res = await axios.get("/api/workflows/getOne", {
                params: { id: workflowId }
            });


            setWorkflow(res.data.workflow);
        } catch (error) {
            console.log(error);
            toast.error("Не удалось получить воркфлоу!");
        }
    };
    console.log('workflow===')
    console.log(workflow)

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nodesSnapshot) => {
                const updatedNodes = applyNodeChanges(changes, nodesSnapshot);

                if (showInitialNode && updatedNodes.some((n) => n.id !== "initial-node")) {
                    setShowInitialNode(false);
                    return updatedNodes.filter((n) => n.id !== "initial-node");
                }
                return updatedNodes;
            });
        },
        [showInitialNode]
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        []
    );

    const onConnect = useCallback(
        (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        []
    );

    const hasManualTrigger = useMemo(() => {
        return nodes.some((node) => node.type === "manual_trigger")
    }, [nodes])
    const [closeError, setCloseError] = useState<boolean>(false)
    useEffect(() => {
        if (executionStatus?.status === "error") {
            setCloseError(true);
        }
    }, [executionStatus?.status]);

    console.log(nodes)
    console.log(workflow)
    console.log('hasManualTrigger==')
    console.log(hasManualTrigger)
    console.log(edges)
    console.log(nodes)
    return (

        <div className="h-full w-full p-4">
            <WorkflowIdBreadCrumbs currentNodes={nodes} currentEdges={edges}  workflowName={workflow?.name} />
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                proOptions={{ hideAttribution: true }}
                nodeTypes={nodeTypes}
            >
                <Background />
                <Controls />
                <MiniMap />
                {
                    hasManualTrigger && (
                        <Panel position="bottom-center">
                                <ExecuteWorkflowButton workflowId={workflowId}/>
                        </Panel>
                    )
                }


                <div className="absolute top-4 right-4 z-10">
                    <NodeSelector open={open} onOpenChange={setOpen}>
                        <Button variant="outline">
                            <PlusIcon />
                        </Button>
                    </NodeSelector>
                </div>
            </ReactFlow>
            <Dialog
                open={closeError}
                onOpenChange={setCloseError}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'> <AlertCircleIcon className='text-red-500'/>Workflow Ошибка</DialogTitle>
                    </DialogHeader>
                    <p className="text-lg text-muted-foreground ">

                        {executionStatus?.message}
                    </p>
                    <p className='text-muted-foreground text-sm  '>Возможно вы забыли сохранить ваш воркфлоу перед тем как запустить его!</p>
                    <DialogFooter>
                        <Button onClick={() => setCloseError(false)}>
                            Понятно
                        </Button>
                    </DialogFooter>




                </DialogContent>

            </Dialog>
        </div>
    );
};

export default WorkflowIdPage;
