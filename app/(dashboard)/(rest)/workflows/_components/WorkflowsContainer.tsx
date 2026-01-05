"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import WorkflowHeader from "./WorkflowHeader";
import { EmptyState } from "@/components/EmptyState";
import {Loader2Icon, SearchIcon, Trash2Icon} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDateRu } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const WorkflowsContainer = () => {
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState<string>("");
    const [deleteWorkflowId, setDeleteWorkflowId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const router = useRouter();
    const [isDeleting, setIsDeleting] =useState<boolean>(false)
    useEffect(() => {
        const fetchWorkflows = async () => {
            try {
                const res = await axios.get("/api/workflows/get");
                setWorkflows(res.data.workflows || []);
            } catch (e) {
                toast.error("Не удалось загрузить workflows");
            } finally {
                setLoading(false);
            }
        };

        fetchWorkflows();
    }, []);

    const filteredWorkflows = useMemo(() => {
        return workflows.filter((w) =>
            w.name?.toLowerCase().includes(searchInput.toLowerCase())
        );
    }, [workflows, searchInput]);

    const handleDelete = async () => {
        if (!deleteWorkflowId) return;

        try {
            setIsDeleting(true)
            await axios.delete(`/api/workflows/remove?id=${deleteWorkflowId}`);
            setWorkflows(workflows.filter(wf => wf.workflowId !== deleteWorkflowId));
            toast.success("Workflow удалён!");
            setDeleteDialogOpen(false);
            setDeleteWorkflowId(null);
            setIsDeleting(false)
        } catch (err) {
            setIsDeleting(false)
            console.error(err);
            toast.error("Не удалось удалить workflow");
        }
    };

    return (
        <div className="p-6">
            <WorkflowHeader disabled={loading} />

            <div className="relative w-64 mt-4">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 " />
                <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Поиск workflow по имени"
                    className="pl-9"
                />
            </div>

            {!loading && filteredWorkflows.length === 0 && (
                <EmptyState
                    title="Воркфлоу пока нет"
                    description="Создай первый workflow, чтобы начать автоматизацию"
                    actionLabel="Создать воркфлоу"
                    className="mt-8"
                />
            )}

            {filteredWorkflows.length > 0 && (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {filteredWorkflows.map((wf) => (
                        <div
                            key={wf.workflowId}
                            className="relative cursor-pointer rounded-lg border p-4 hover:bg-muted/50 transition"
                        >
                            <div
                                onClick={() => router.push(`/workflows/${wf.workflowId}`)}
                                className="cursor-pointer"
                            >
                                <p className="font-medium">{wf.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    Обновлен: {formatDateRu(wf.updatedAt) ?? formatDateRu(wf.createdAt)}
                                </p>
                            </div>


                            <Button variant='outline'
                                onClick={() => {
                                    setDeleteWorkflowId(wf.workflowId);
                                    setDeleteDialogOpen(true);
                                }}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                                <Trash2Icon className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}


            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Удалить воркфлоу?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground mt-2">
                        Вы точно хотите удалить этот workflow? Это действие нельзя отменить.
                    </p>
                    <DialogFooter className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Отмена
                        </Button>
                        <Button disabled={isDeleting} variant="destructive" onClick={handleDelete}>
                            {isDeleting ? 'Подождите...' : "Удалить"}
                            {isDeleting ? <Loader2Icon className='animate-spin'/> : <Trash2Icon/>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default WorkflowsContainer;
