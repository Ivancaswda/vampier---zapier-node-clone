import React, {useEffect, useState} from 'react'
import {Button} from "@/components/ui/button";
import {FlaskConicalIcon, Loader2Icon} from "lucide-react";
import {toast} from "sonner"
import axios from "axios";
const ExecuteWorkflowButton = ({workflowId}:any) => {
    const [loading, setLoading] = useState<boolean>()
    useEffect(() => {
        if (loading ) {
            setTimeout(() => {
                setLoading(false)
            }, 5000)
        }

    }, [loading]);

    const handleExecute = async () => {
        try {
            setLoading(true)
            const result = await axios.post('/api/execute-workflow', {id:workflowId})
            setLoading(false)

        } catch (error) {
            toast.error('failed to execute')
            setLoading(false)
        }
    }
    console.log(loading)

    return (
        <Button disabled={loading} onClick={handleExecute} >
            {loading ? <Loader2Icon className='animate-spin'/> :      <FlaskConicalIcon className="size-4"/>}

            {loading ? "Пожалуйста подождите!" : 'Выполнить рабочий флоу'}
        </Button>
    )
}
export default ExecuteWorkflowButton
