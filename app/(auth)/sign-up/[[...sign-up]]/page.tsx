'use client'
import React, { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import axios from "axios";
import { toast } from 'sonner'
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {useAuth} from "@/context/useAuth";
import Link from "next/link";
import {Loader2Icon, PlayCircleIcon} from "lucide-react";
import Image from "next/image";
import { FaGoogle } from "react-icons/fa";
import {GoogleLoginButton} from "@/app/(auth)/_components/GoogleLoginButton";

function Signup() {
    const { user, setUser, loading } = useAuth()
    const router = useRouter()
    const [form, setForm] = useState({ userName: '', email: '', password: '' })
    const [isLoading, setIsLoading] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await axios.post('/api/auth/sign-up', form)
            const data = res.data
            localStorage.setItem('token', data.token)

            const userRes = await fetch('/api/auth/user', {
                headers: { Authorization: `Bearer ${data.token}` },
            })
            if (!userRes.ok) throw new Error('Failed to fetch user')

            const userData = await userRes.json()
            setUser(userData.user)
            toast.success('Добро пожаловать в Websity!')
            router.replace('/workflows')
        } catch (err: any) {
            toast.error('Ошибка регистрации. Проверьте данные.')
        } finally {
            setIsLoading(false)
        }
    }
    const handleGoogleSignIn = async () => {

    }

    useEffect(() => {
        if (!loading && user) router.replace('/workflows')
    }, [user, loading, router])

    return ( <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-primary/60 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-2xl p-8 backdrop-blur-md dark:bg-zinc-900">
                <div className='flex items-center justify-center w-full'>
                    <Image width={140} height={140} className='w-[90px] h-[80px]' src='/logo.png' alt='logo' />
                </div>


        <h2 className="text-2xl font-bold text-center text-primary dark:text-primary">
            Создать аккаунт
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
            Добро пожаловать! Заполните форму, чтобы присоединиться.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
            <LabelInputContainer>
                <Label htmlFor="userName">Имя пользователя</Label>
                <Input
                    value={form.userName}
                    onChange={(e) => setForm({...form, userName: e.target.value})}
                    id="userName"
                    placeholder="Tyler"
                    type="text"
                />
            </LabelInputContainer>

            <LabelInputContainer>
                <Label htmlFor="email">Email</Label>
                <Input
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    id="email"
                    placeholder="you@example.com"
                    type="email"
                />
            </LabelInputContainer>

            <LabelInputContainer>
                <Label htmlFor="password">Пароль</Label>
                <Input
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    id="password"
                    placeholder="••••••••"
                    type="password"
                />
            </LabelInputContainer>

            <button
                className="relative flex h-10 w-full items-center justify-center rounded-lg bg-primary text-white font-medium shadow-md transition hover:bg-primary/90"
                type="submit"
            >
                {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin"/>}
                Создать аккаунт →
            </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
            Уже есть аккаунт? <Link href="/sign-in" className="text-primary hover:underline">Войти</Link>
        </p>

        <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"/>

        <div className="flex flex-col space-y-3">
            <GoogleLoginButton/>  </div>
    </div>
    </div>


)
}

const SocialButton = ({icon, text, handleProvider}: {icon: React.ReactNode, text: string, handleProvider:any}) => ( <button onClick={handleProvider}
       className="flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-primary/10 hover:text-primary dark:bg-zinc-800 dark:text-gray-200"
       type="button">
{icon} {text} </button>
)

const LabelInputContainer = ({children, className}: {children: React.ReactNode, className?: string}) => (

  <div className={cn("flex w-full flex-col space-y-2", className)}>
    {children}
  </div>
)

export default Signup
