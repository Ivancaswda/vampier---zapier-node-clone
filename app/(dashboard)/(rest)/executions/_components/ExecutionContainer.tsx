'use client'
import React, {useEffect, useState} from 'react'
import {useRouter} from "next/navigation";
import axios from "axios";
import {toast} from "sonner";
import {EmptyState} from "@/components/EmptyState";
import {formatDateRu, formatDuration} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {CheckCircleIcon, ClockIcon, EditIcon, FolderOpenIcon, Loader2Icon, XCircleIcon} from "lucide-react";
import CredentialHeader from "@/app/(dashboard)/(rest)/credentials/_components/credentialHeader";
import ExecutionHeader from "@/app/(dashboard)/(rest)/executions/_components/ExecutionHeader";
import Link from "next/link";

const ExecutionContainer = ({executions, loading}:any) => {


    const router = useRouter();

    return (
        <div className="p-6">

            <ExecutionHeader disabled={loading} />
            {!loading && executions.length === 0 && (
                <EmptyState
                    title="Нет executions"
                    description=""

                    onAction={() => router.push("/credentials/new")}
                    className="mt-8"
                />
            )}

            {executions.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-start gap-3">
                    {executions.map((c) => {
                        const durationSeconds =
                            c.completedAt && c.startedAt
                                ? Math.round(
                                    (new Date(c.completedAt).getTime() -
                                        new Date(c.startedAt).getTime()) / 1000
                                )
                                : null;
                        return (
                            <Link href={`/executions/${c.executionId}`} >


                                <div   className='flex hover:bg-gray-100 cursor-pointer hover:transition-all items-center rounded-lg border p-4 justify-center gap-3'>


                                    <div
                                        key={c.executionId}
                                        className=""
                                    >

                                        {c.status === 'success' ? <CheckCircleIcon className='size-5 text-green-600'/>
                                         : c.status === 'error' ? <XCircleIcon className="size-5 text-red-600"/>
                                                : c.status === 'running' ? <Loader2Icon className='size-5
                                                    text-primary animate-spin
                                                '/> : <ClockIcon className='size-5 text-muted-foreground'/>
                                        }

                                        <p className="font-medium">{c.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Запущено: {formatDateRu(c.startedAt)}
                                        </p>
                                        {durationSeconds !== null && (
                                            <p className="text-xs text-muted-foreground">
                                                Длительность: {formatDuration(durationSeconds)}
                                            </p>
                                        )}


                                    </div>
                                    <Button
                                        size="icon"
                                        variant="outline"

                                    >
                                        <FolderOpenIcon />
                                    </Button>


                                </div>
                            </Link>
                            )
                        }
                    )}
                </div>
            )}
        </div>
    )
}
export default ExecutionContainer
