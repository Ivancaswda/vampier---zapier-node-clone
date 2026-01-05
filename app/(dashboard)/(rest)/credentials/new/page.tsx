"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { GlobeIcon, SparkleIcon, SunIcon } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const credentialTypeOptions = [
    { value: "openai", label: "OpenAI", Icon: GlobeIcon },
    { value: "gemini", label: "Gemini", Icon: SparkleIcon },
    { value: "anthropic", label: "Anthropic", Icon: SunIcon },
];

const NewCredentialPage = () => {
    const router = useRouter();

    const [name, setName] = useState("");
    const [value, setValue] = useState("");
    const [type, setType] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !value || !type) {
            toast.error("Заполни все поля");
            return;
        }

        try {
            setLoading(true);

            const res = await axios.post("/api/credentials/create", {
                name,
                value,
                type,
            });

            if (res.data.success) {
                toast.success("Credential создан");
                router.push(`/credentials`);
            }
        } catch (err) {
            console.error(err);
            toast.error("Не удалось создать credential");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:px-10 md:py-6">
            <div className="mx-auto max-w-screen-md">
                <Card>
                    <CardHeader>
                        <CardTitle>Создать credential</CardTitle>
                        <CardDescription>
                            Выбери AI-провайдера и укажи API ключ
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-6">
                            {/* NAME */}
                            <div className="space-y-2">
                                <Label>Название</Label>
                                <Input
                                    placeholder="My OpenAI Key"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>


                            <div className="my-4 space-y-2">
                                <Label>ИИ Провайдер</Label>
                                <div className="flex items-center justify-start gap-3">
                                    {credentialTypeOptions.map(({ value, label, Icon }) => (
                                        <button
                                            type="button"
                                            key={value}
                                            onClick={() => setType(value)}
                                            className={cn(
                                                "flex  justify-center items-center gap-2 rounded-lg border p-3 text-sm transition",
                                                type === value
                                                    ? "border-primary bg-primary/10"
                                                    : "hover:bg-muted"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* API KEY */}
                            <div className="space-y-2">
                                <Label>Ключ API</Label>
                                <Input
                                    type="password"
                                    placeholder="sk-..."
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                />
                            </div>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.back()}
                                >
                                    Отмена
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Создание..." : "Создать"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NewCredentialPage;
