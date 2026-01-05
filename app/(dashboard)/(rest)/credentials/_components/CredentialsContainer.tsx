"use client";

import React, {useEffect, useMemo, useState} from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CredentialHeader from "./credentialHeader";
import { EmptyState } from "@/components/EmptyState";
import {
    Edit3Icon,
    EditIcon,
    EyeClosedIcon,
    EyeIcon,
    GlobeIcon,
    Loader2Icon, SaveIcon,
    SearchIcon,
    SparkleIcon,
    SunIcon
} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {cn, formatDateRu} from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
const credentialTypeIconMap: Record<string, React.ElementType> = {
    openai: GlobeIcon,
    anthropic: SunIcon,
    gemini: SparkleIcon,
};
const credentialTypeOptions = [
    { value: "openai", label: "OpenAI", Icon: GlobeIcon },
    { value: "gemini", label: "Gemini", Icon: SparkleIcon },
    { value: "anthropic", label: "Anthropic", Icon: SunIcon },
];

const CredentialsContainer = () => {
    const [credentials, setCredentials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchCredentials = async () => {
            try {
                const res = await axios.get("/api/credentials/get");
                setCredentials(res.data.credentials ?? []);
            } catch {
                toast.error("Не удалось загрузить credentials");
                setLoading(false)
            } finally {
                setLoading(false);
            }
        };

        fetchCredentials();
    }, []);
    const [searchInput, setSearchInput] = useState<string>("")
    const filteredCredentials = useMemo(() => {
        return credentials.filter((w) =>
            w.name?.toLowerCase().includes(searchInput.toLowerCase())
        );
    }, [credentials, searchInput]);
    const sortedCredentials = useMemo(() => {
        return [...filteredCredentials].sort(
            (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
        );
    }, [filteredCredentials]);

    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [value, setValue] = useState("");
    const [credentialId, setCredentialId] = useState('')
    const [open, setOpen] = useState(false);
    const [activeCredential, setActiveCredential] = useState<any | null>(null);
    useEffect(() => {
        if (!open || !credentialId) return;

        const load = async () => {
            try {
                const res = await axios.get(
                    `/api/credentials/getOne?id=${credentialId}`
                );
                setName(res.data.credential.name);
                setType(res.data.credential.type);
                setValue("");
            } catch {
                toast.error("Не удалось загрузить credential");
                setOpen(false);
            }
        };

        load();
    }, [open, credentialId]);
    useEffect(() => {
        if (!open) {
            setActiveCredential(null);
            setCredentialId("");
            setValue("");
            setInputType("closed");
        }
    }, [open]);
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
setLoading(true)
        if (!credentialId || !name || !type) {
            toast.error("Некорректные данные");
            return;
        }


        try {
            await axios.patch("/api/credentials/update", {
                id: credentialId,
                newName: name,
                newType: type,
                newValue: value || undefined,
            });

            toast.success("Credential обновлён");
            setOpen(false);
            setValue("");

            // обновляем список
            setCredentials((prev) =>
                prev.map((c) =>
                    c.credentialId === credentialId
                        ? { ...c, name, type }
                        : c
                )
            );
            setLoading(false)
        } catch {
            setLoading(false)
            toast.error("Ошибка обновления");
        }
    };

    const [inputType, setInputType] = useState<'opened' | 'closed'>('closed')
    return (
        <div className="p-6">

            <CredentialHeader disabled={loading} />

            <div className={" relative w-64 mt-4 "}>
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 " />
                <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={'search workflow by name'}
                    className="pl-9"
                />
            </div>
            {!loading && credentials.length === 0 && (
                <EmptyState
                    title="Нет credentials"
                    description="Добавь credential, чтобы использовать его в нодах"
                    actionLabel="Создать credential"
                    onAction={() => router.push("/credentials/new")}
                    className="mt-8"
                />
            )}

            {sortedCredentials.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-start gap-3">
                    {sortedCredentials.map((c) => {
                        const Icon = credentialTypeIconMap[c.type];
                        return (
                            <div  onClick={() => {
                                setActiveCredential(c);
                                setCredentialId(c.credentialId);
                                setOpen(true);
                            }} className='flex hover:bg-gray-100 cursor-pointer hover:transition-all items-center rounded-lg border p-4 justify-center gap-3'>

                                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                                <div
                                    key={c.credentialId}
                                    className=""
                                >

                                    <p className="font-medium">{c.name}</p>
                                    <p className="text-xs text-muted-foreground">{c.type}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Создано: {formatDateRu(c.createdAt)}
                                    </p>
                                </div>
                                <Button
                                    size="icon"
                                    variant="outline"

                                >
                                    <EditIcon />
                                </Button>


                            </div>

                        )
                    }
                    )}
                </div>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>


                        <DialogTitle>
                            Редактировать credential
                        </DialogTitle>
                        <DialogDescription>
                            {activeCredential?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div  className="space-y-6 mt-4">
                        <div className='space-y-2 my-2'>
                            <Label>Name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className='space-y-2 mt-4'>
                            <Label>Provider</Label>
                            <div className="flex gap-3 mt-2">
                                {credentialTypeOptions.map(({ value, label, Icon }) => (
                                    <button
                                        type="button"
                                        key={value}
                                        onClick={() => setType(value)}
                                        className={cn(
                                            "flex items-center gap-2 border rounded-lg p-2",
                                            type === value && "border-primary bg-primary/10"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className='space-y-2 mt-4 relative'>
                            <Label>New API Key (optional)</Label>
                            <Input
                                type={inputType === "closed" ? "password" : 'text'}
                                placeholder="Оставь пустым, чтобы не менять"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                            />

                                {inputType === 'closed' ? <Button className=' top-2 right-4 absolute' variant='outline'
                                onClick={() => setInputType("opened")}
                                > <EyeIcon /> </Button> : <Button className=' top-2 right-4 absolute' variant='outline'  onClick={() => setInputType("closed")}> <EyeClosedIcon/> </Button> }


                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
 disabled={loading}
                                variant="ghost"
                                onClick={() => setOpen(false)}
                            >
                                Отмена
                            </Button>
                            <Button onClick={onSubmit} disabled={loading} type="submit">
                                {loading ? <Loader2Icon className='animate-spin'/> : <SaveIcon/>}

                                {loading ? 'Подождите...' : 'Сохранить'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CredentialsContainer;
