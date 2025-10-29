'use client'
import React, {useEffect, useState} from 'react'
import { Input } from '@/components/ui/input'
import axios from "axios";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useAuth} from "../../../../../context/useAuth";
import {Label} from "@/components/ui/label";

import {cn} from "@/lib/utils";
import Link from "next/link";
import {Loader2Icon} from "lucide-react";
import {FaGithub, FaGoogle, FaTwitch} from "react-icons/fa";
import Image from "next/image";
import {signInWithPopup} from "firebase/auth";
import {auth, provider} from "@/lib/firebase";

function SignIn() {
    const {user, setUser} = useAuth()

    const [form, setForm] = useState({
        email: '',
        password: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
       try {


        setIsLoading(true)

        const res = await axios.post('/api/auth/login', form)

        const data = await res.data
        localStorage.setItem("token", data.token)
        // получаем пользователя
        const userRes = await fetch("/api/auth/user", {
            headers: {
                Authorization: `Bearer ${data.token}`,
            },
        });

        if (!userRes.ok) throw new Error("Failed to fetch user");

        const userData = await userRes.json();
        setUser(userData?.user); // обновляем контекст
        setIsLoading(false)
        router.replace('/dashboard')

        toast.success('Вы успешно вошли в аккаунт')
       } catch (error) {
        toast.error('Не удалось войти! Проверьте данные!')
           console.log(error)
       }
    }

    const handleGoogleSignIn = async () => {
        try {

            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: user.email,
                    userName: user.displayName,
                    avatarUrl: user.photoURL
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Ошибка входа");

            setUser(data.user);
            localStorage.setItem("token", data.token);

            router.push("/dashboard");
            toast.success("Успешный вход через Google!");
        } catch (err: any) {
            toast.error(err.message);
        }
    };
    useEffect(() => {
        if (user) {
            router.replace("/dashboard");
        }
    }, [user, router]);
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-600 via-orange-600 to-yellow-800 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-xl p-8 backdrop-blur-md dark:bg-zinc-900">

                {/* Лого */}
                <div className="flex justify-center mb-6 ">
                    <Image src="/logo.png" alt="Lingvify Logo" className='rounded-xl' width={64} height={64}/>
                </div>

                <h2 className="text-2xl font-bold text-center text-orange-700 dark:text-orange-300">
                    Добро пожаловать в <span className="text-orange-500">Learnify-AI</span>
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Войдите в аккаунт, чтобы продолжить
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                    <LabelInputContainer>
                        <Label htmlFor="email">Email</Label>
                        <Input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} type="email" id="email" placeholder="you@example.com"/>
                    </LabelInputContainer>

                    <LabelInputContainer>
                        <Label htmlFor="password">Пароль</Label>
                        <Input value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} type="password" id="password" placeholder="••••••••"/>
                    </LabelInputContainer>

                    <button
                        className="relative flex h-10 w-full items-center justify-center rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium shadow-md transition hover:opacity-90"
                        type="submit"
                    >
                        {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin"/>}
                        Войти →
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-500">
                    Нет аккаунта? <Link href="/sign-up" className="text-orange-600 hover:underline">Зарегистрироваться</Link>
                </p>

                <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"/>

                {/* Социальные кнопки */}
                <div className="flex flex-col space-y-3">
                      <SocialButton handleProvider={handleGoogleSignIn} icon={<FaGoogle/>} text="Войти через Google"/>
                          </div>
            </div>
        </div>
    );
}

const BottomGradient = () => {
    return (
        <>
            <span
                className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100"/>
            <span
                className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100"/>
        </>
    );
};

const SocialButton = ({icon, text, handleProvider}: {icon: React.ReactNode, text: string, handleProvider:any}) => (
    <button onClick={handleProvider}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-200"
            type="button"
    >
        {icon} {text}
    </button>
)

const LabelInputContainer = ({children, className}: {children: React.ReactNode, className?: string}) => (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
        {children}
    </div>
)
export default SignIn