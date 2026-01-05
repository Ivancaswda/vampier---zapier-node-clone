
'use client'
import React, {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import {useAuth} from "@/context/useAuth";
import {Loader2Icon} from 'lucide-react'
import axios from "axios";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
const DashboardLayout = ({children}: {children: React.ReactNode}) => {
    const {user, loading} = useAuth()
    const [name, setName] = useState<string>()
    const router =useRouter()
    useEffect(() => {
        if (!user && !loading) {
            router.replace("/sign-up");
        }
    }, [user, router, loading]);
    useEffect(() => {
        user && onObtain()
    }, [user]);

    const onCreate = async () => {
        try {
            if (!name?.trim()) {
                return
            }
            await axios.post('/api/workflows/create', {name: name})
            toast.success('workflow-created!')
        } catch (error) {
            console.log(error)
        }
    }
    const onExecute = async () => {
        try {

            const result = await axios.post('/api/execute')
            console.log(result)
            toast.success('execute-ai!')
        } catch (error) {
            console.log(error)
        }
    }
    const onObtain = async () => {
        try {
            const result = await axios.post('/api/workflows/get')
            console.log(result.data.workflows)
            toast.success('workflow-obtained!')
        } catch (error) {
            console.log(error)
        }
    }

    if (!user && loading) {
        return <div className='flex items-center justify-center w-screen h-screen'>
            <Loader2Icon className='animate-spin text-primary'/>
        </div>
    }
    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset className='bg-accent/20'>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
export default DashboardLayout
