'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import {CrownIcon, Loader2Icon} from 'lucide-react'
import ExecutionContainer from "@/app/(dashboard)/(rest)/executions/_components/ExecutionContainer";
import {useAuth} from "@/context/useAuth";
import Image from "next/image";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

const ProfilePage = () => {
    const [executions, setExecutions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const {user } = useAuth()
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/executions/get')
                setExecutions(res.data.executions ?? [])
            } catch {
                toast.error('Не удалось загрузить профиль')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Профиль</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className='flex items-center gap-2'>
                        <Avatar  className='bg-primary text-white'>
                            <AvatarImage src={user?.avatarUrl}/>
                            <AvatarFallback  className='bg-primary text-white'>
                                {user?.userName[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                    <div className='flex items-center justify-between w-full pr-4'>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Email
                            </p>
                            <p className="font-medium">
                                {user?.email}
                            </p>
                        </div>

                        {user?.isPro && <div className='bg-primary px-2 py-1 text-white flex items-center gap-2 text-sm rounded-3xl text-center font-bold'>
                            <CrownIcon className='size-5'/>
                            PRO
                        </div>}

                    </div>
                    </div>

                    <Separator />

                    <p className="text-sm text-muted-foreground">
                        Всего запусков
                    </p>
                    <p className="font-medium">
                        {loading ? '—' : executions.length}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Последние запуски</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2Icon className="animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <ExecutionContainer loading={loading} executions={executions} />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default ProfilePage
