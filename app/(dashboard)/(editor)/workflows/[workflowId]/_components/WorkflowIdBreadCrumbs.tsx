"use client";

import React, {useEffect, useState} from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Loader2Icon, SaveIcon} from "lucide-react";
import {toast} from 'sonner'
import axios from "axios";
import {useParams} from "next/navigation";
type WorkflowHeaderProps = {
    workflowName?: string;
    currentEdges:any[],
    currentNodes: any[]
};

const WorkflowIdBreadCrumbs = ({ workflowName, currentEdges, currentNodes }: WorkflowHeaderProps) => {
    const { workflowId } = useParams();
    const [loading, setLoading]  = useState<boolean>(false);

    console.log('currentNodes===')
    console.log(currentNodes)
    console.log("currentEdges===")
    console.log(currentEdges)
    const handleSave = async () => {

        try {
            setLoading(true)
            await axios.post("/api/workflows/save", {
                workflowId,
                name: workflowName,
                nodes: currentNodes,
                connections: currentEdges,
            });
            setLoading(false)

            toast.success("Workflow saved!");
        } catch (err) {
            setLoading(false)
            toast.error("Save failed");
        }
    };
    useEffect(() => {
        if (!workflowId) return;

        const saveNodes = async () => {
            try {
                await axios.post("/api/workflows/save", {
                    workflowId,
                    name: workflowName,
                    nodes: currentNodes ?? [],
                    connections: currentEdges ?? [],
                });
           //      toast.success("Nodes saved"); // по желанию для дебага
            } catch (err) {
                console.error(err);
               // toast.error("Не удалось сохранить ноды!");
            }
        };


        const timeout = setTimeout(saveNodes, 500);
        return () => clearTimeout(timeout);

    }, [currentNodes, currentEdges, workflowName, workflowId]);
    return (
        <div className="mb-4 flex items-center justify-between px-4 py-1">
            <div >
                <Breadcrumb>
                    <BreadcrumbList>





                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/workflows">Workflows</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />


                        <BreadcrumbItem>
                            <BreadcrumbPage>{workflowName || "Загрузка..."}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>


                <h1 className="text-xl font-semibold mt-2">{workflowName || "Workflow"}</h1>
            </div>
            <Button disabled={loading} onClick={handleSave}>
                {loading ? <Loader2Icon className='animate-spin'/> :  <SaveIcon/>}
                {loading ? 'Подождите...' : "Сохранить"}

            </Button>
        </div>

    );
};

export default WorkflowIdBreadCrumbs;
