'use client'
import React, {useEffect, useState} from 'react'

import ExecutionContainer from "@/app/(dashboard)/(rest)/executions/_components/ExecutionContainer";
import ExecutionHeader from "@/app/(dashboard)/(rest)/executions/_components/ExecutionHeader";
import {EmptyState} from "@/components/EmptyState";
import axios from "axios";
import {toast} from "sonner";

const ExecutionsPage = () => {
    const [executions, setExecutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchExecutions = async () => {
            try {
                const res = await axios.get("/api/executions/get");
                setExecutions(res.data.executions ?? []);
            } catch {
                toast.error("Не удалось загрузить executions");
                setLoading(false)
            } finally {
                setLoading(false);
            }
        };

        fetchExecutions();
    }, []);
    return (
        <div>
            <ExecutionContainer executions={executions} loading={loading}/>
        </div>
    )
}
export default ExecutionsPage
