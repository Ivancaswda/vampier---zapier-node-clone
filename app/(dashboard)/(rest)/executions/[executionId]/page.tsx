"use client"
import React, {useEffect, useState} from 'react'
import {useParams} from "next/navigation";
import axios from "axios";
import {toast} from "sonner";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CheckCircleIcon, ClockIcon, Loader2Icon, XCircleIcon} from "lucide-react";
import {execOnce} from "next/dist/shared/lib/utils";
import Link from "next/link";
import {formatDateRu, formatDuration} from "@/lib/utils";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {Button} from "@/components/ui/button";

const ExecutionIdPage = () => {
    const [showStackTrace, setShowStackTrace] = useState<boolean>(false)
    const {executionId} = useParams()
    const [execution, setExecution] = useState<any>()
    const [loading, setLoading] = useState<boolean>()
    useEffect(() => {

            if (!executionId) return;

            const getExecutionById = async () => {
                setLoading(true)
                try {
                    const res = await axios.get(
                        `/api/executions/getOne?id=${executionId}`
                    );
                    setExecution(res.data.execution)
                    setLoading(false)
                } catch {
                    toast.error("Не удалось загрузить execution");
                    setLoading(false)
                }
            };

            getExecutionById();
        }, [ executionId]);

    if (!execution) {
        return
    }
    if (loading) {
        return  <div className='flex items-center justify-center w-screen h-screen'>
            <Loader2Icon className='text-primary animate-spin'/>
        </div>
    }
    const durationSeconds =
        execution.completedAt && execution.startedAt
            ? Math.round(
                (new Date(execution.completedAt).getTime() -
                    new Date(execution.startedAt).getTime()) / 1000
            )
            : null;
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Скопировано в буфер обмена");
        } catch {
            toast.error("Не удалось скопировать");
        }
    };

    return (
        <div className='p-4 md:px-10 md:py-6 h-full'>
            <div className='mx-auto max-w-screen-md w-full flex flex-col gap-y-8 h-full'>


                <Card className='shadow-none'>
                    <CardHeader>
                        <div className='flex items-center gap-3'>
                            {execution.status === 'success' ? <CheckCircleIcon className='size-5 text-green-600'/>
                                : execution.status === 'error' ? <XCircleIcon className="size-5 text-red-600"/>
                                    : execution.status === 'running' ? <Loader2Icon className='size-5
                                                            text-primary animate-spin
                                                        '/> : <ClockIcon className='size-5 text-muted-foreground'/>
                            }
                            <div>
                                <CardTitle>
                                    {execution.status}
                                </CardTitle>
                                <CardDescription>
                                    Запуск  {execution.name} сценария
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4 '>
                            <div>


                                <p className='text-sm font-medium text-muted-foreground'>
                                    Сценарий:
                                </p>
                                <Link prefetch={true} className='text-sm hover:underline transition cursor-pointer font-bold text-primary'
                                      href={`/workflows/${execution.workflowId}`} >
                                    {execution.name}
                                </Link>
                            </div>
                            <div>
                                <p className='text-sm font-medium text-muted-foreground'>Статус</p>
                                <p className='text-sm'>{execution.status}</p>
                            </div>
                            <div>
                                <p className='text-sm font-medium text-muted-foreground'>Запущено:</p>
                                <p className='text-sm'>{formatDateRu(execution.startedAt)}</p>
                            </div>
                            {durationSeconds &&    <div>
                                <p className='text-sm font-medium text-muted-foreground'>Длительность:</p>
                                <p className='text-sm'> {formatDuration(durationSeconds)}</p>
                            </div>}
                            {execution.inngestEventId &&    <div>
                                <p className='text-sm font-medium text-muted-foreground'>Inngest Event Id:</p>
                                <p className='text-sm  '> {execution.inngestEventId}</p>
                            </div>}

                        </div>
                            {execution.error && (
                                <div className='mt-6 p-4 bg-red-50 rounded-sm space-y-3'>
                                    <div>
                                        <p className='text-sm font-medium text-red-900 mb-2'>
                                            Ошибка
                                        </p>
                                        <p className='text-sm text-red-800 font-moo'>
                                            {execution.error}
                                        </p>
                                    </div>
                                    {execution.errorStack && (
                                        <Collapsible open={showStackTrace} onOpenChange={setShowStackTrace}>
                                            <CollapsibleTrigger>
                                                <Button variant='ghost' size='sm'
                                                        className='text-red-900 hover:bg-red-100'>
                                                    {showStackTrace ? "Скрыть логи ошибки" : 'Показать логи ошибки'}
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="relative mt-2">
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="absolute right-2 top-2 h-7 w-7 text-red-900 hover:bg-red-100"
                                                        onClick={() => copyToClipboard(execution.errorStack)}
                                                    >
                                                        📋
                                                    </Button>

                                                    <pre className="text-xs font-mono text-red-800 pr-10">
                                                        {execution.errorStack}
                                                    </pre>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    )}
                                </div>
                            )}
                        {execution.output && (
                            <div className="mt-6 p-4 bg-muted rounded-md relative">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium">Output</p>

                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-7 w-7"
                                        onClick={() =>
                                            copyToClipboard(JSON.stringify(execution.output, null, 2))
                                        }
                                    >
                                        📋
                                    </Button>
                                </div>

                                <pre className="text-xs font-mono overflow-auto">
                                    {JSON.stringify(execution.output, null, 2)}
                                </pre>
                            </div>
                        )}

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
export default ExecutionIdPage
