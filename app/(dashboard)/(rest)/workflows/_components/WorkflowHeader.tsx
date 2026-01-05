"use client"
import React, {useMemo, useState} from 'react'
import {EntityHeader} from "@/components/Entity-Components";
import {useRouter} from "next/navigation";
import {generateRandomName} from "@/lib/utils";
import axios from "axios";
import {toast} from "sonner";
import {SearchIcon} from "lucide-react";
import {Input} from "@/components/ui/input";

const WorkflowHeader = ({disabled}: any) => {

    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter();
    const createWorkflow = async () => {
        try {
            setLoading(true);

            const name = generateRandomName();
            const res = await axios.post('/api/workflows/create', { name });

            toast.success('Воркфлоу создан!');
            router.push(`/workflows/${res.data.workflowId}`);

        } catch (err: any) {
            if (err.response?.data?.error === "LIMIT_REACHED") {
                toast.error(
                    "Достигнут лимит бесплатного тарифа (3 воркфлоу). Перейдите на Pro 🚀"
                );
            } else {
                toast.error("Не удалось создать воркфлоу");
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className=''>
            <EntityHeader title='Сценарии' description='Создавай и управляй своими сценариями'
                          onNew={() => createWorkflow()}
                          newButtonLabel='Новый воркфлоу'
                          disabled={disabled}
                          isCreating={loading}
            />

        </div>
    )
}
export default WorkflowHeader
