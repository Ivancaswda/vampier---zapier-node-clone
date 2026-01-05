'use client'
import React, { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useReactFlow } from "@xyflow/react";
import {GlobeIcon, MailIcon, MousePointerIcon, SendIcon, SparkleIcon, StarIcon, SunIcon} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import {FaDiscord, FaGoogle, FaMagic, FaSlack, FaStripe, FaTelegram, FaVk, FaWhatsapp, FaYandex} from "react-icons/fa";

import Image from "next/image";
import InitialNode from "@/app/(dashboard)/(rest)/nodes/components/initial-node/node";
import ManualTriggerNode from "@/app/(dashboard)/(rest)/nodes/components/manual-trigger-node/node";
import {HttpRequestNode} from "@/app/(dashboard)/(rest)/nodes/components/http-request/node";
import GoogleFormTrigger from "@/app/(dashboard)/(rest)/nodes/components/google-form-trigger/node";
import StripeTrigger from "@/app/(dashboard)/(rest)/nodes/components/stripe-trigger/node";
import {geminiNode} from "@/app/(dashboard)/(rest)/nodes/components/gemini/node";
import {openaiNode} from "@/app/(dashboard)/(rest)/nodes/components/openai/node";
import {anthropicNode} from "@/app/(dashboard)/(rest)/nodes/components/anthropic/node";
import {discordNode} from "@/app/(dashboard)/(rest)/nodes/components/discord/node";
import {slackNode} from "@/app/(dashboard)/(rest)/nodes/components/slack/node";
import {telegramNode} from "@/app/(dashboard)/(rest)/nodes/components/telegram/node";
import {whatsappNode} from "@/app/(dashboard)/(rest)/nodes/components/whatsapp/node";
import {vkNode} from "@/app/(dashboard)/(rest)/nodes/components/vk/node";
import YandexFormTrigger from "@/app/(dashboard)/(rest)/nodes/components/yandex-form-trigger/node";
import {EmailNode} from "@/app/(dashboard)/(rest)/nodes/components/email/node";

export const nodeTypes = {
    initial_node: InitialNode,
    manual_trigger: ManualTriggerNode,
    http_request: HttpRequestNode,
    google_form_trigger: GoogleFormTrigger,
    yandex_form_trigger: YandexFormTrigger,
    stripe_trigger: StripeTrigger,
    gemini_request: geminiNode,
    openai_request: openaiNode,
    anthropic_request: anthropicNode,
    discord_request: discordNode,
    slack_request: slackNode,
    telegram_request: telegramNode,
    whatsapp_request: whatsappNode,
    vk_request: vkNode,
    email_request: EmailNode
};

const triggerNodes = [
    {
        label: "Ручной триггер",
        description: "Запускает сценарий при нажатии кнопки",
        icon: MousePointerIcon,
        type: "manual_trigger"
    }
];

const executionNodes = [
    {
        label: "HTTP запрос",
        description: "Выполняет HTTP-запрос",
        icon: GlobeIcon,
        type: "http_request"
    }
];

const geminiNodes = [
    {
        label: "Gemini",
        description: "Отправляет запрос к Gemini AI",
        icon: SparkleIcon,
        type: "gemini_request"
    }
];

const openaiNodes = [
    {
        label: "OpenAI",
        description: "Отправляет запрос к OpenAI",
        icon: FaMagic,
        type: "openai_request"
    }
];

const anthropicNodes = [
    {
        label: "Anthropic",
        description: "Отправляет запрос к Claude (Anthropic)",
        icon: SunIcon,
        type: "anthropic_request"
    }
];

const googleFormNodes = [
    {
        label: "Google Форма",
        description: "Запускает сценарий при отправке Google Формы",
        icon: FaGoogle,
        type: "google_form_trigger"
    }
];

const yandexFormNodes = [
    {
        label: "Яндекс Форма",
        description: "Запускает сценарий при отправке Яндекс Формы",
        icon: FaYandex,
        type: "yandex_form_trigger"
    }
];

const stripeNodes = [
    {
        label: "Stripe",
        description: "Запускает сценарий при событии в Stripe",
        icon: FaStripe,
        type: "stripe_trigger"
    }
];

const discordNodes = [
    {
        label: "Discord",
        description: "Отправляет сообщение в Discord",
        icon: FaDiscord,
        type: "discord_request"
    }
];

const slackNodes = [
    {
        label: "Slack",
        description: "Отправляет сообщение в Slack",
        icon: FaSlack,
        type: "slack_request"
    }
];

const telegramNodes = [
    {
        label: "Telegram",
        description: "Отправляет сообщение в Telegram",
        icon: FaTelegram,
        type: "telegram_request"
    }
];

const whatsappNodes = [
    {
        label: "WhatsApp",
        description: "Отправляет сообщение в WhatsApp",
        icon: FaWhatsapp,
        type: "whatsapp_request"
    }
];

const vkNodes = [
    {
        label: "ВКонтакте",
        description: "Отправляет сообщение ВКонтакте",
        icon: FaVk,
        type: "vk_request"
    }
];
const emailNodes = [
    {
        label: "Электронная почта",
        description: "Отправляет сообщение на Электронную Почту",
        icon: MailIcon,
        type: "email_request",
        paid: true
    }
];
const NodeSelector = ({ children, open, onOpenChange }: any) => {
    const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();

    const handleNodeSelect = useCallback((nodeType: any) => {
        const nodes = getNodes();
        const hasManualTrigger = nodes.some((node) => node.type === "manual_trigger");
        if (nodeType.type === "manual_trigger" && hasManualTrigger) {
            toast.error("Разрешён только один ручной триггер");
            return;
        }

        const flowPosition = screenToFlowPosition({
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
            y: window.innerHeight / 2 + (Math.random() - 0.5) * 200
        });

        const newNode = { id: uuidv4(), type: nodeType.type, data: { label: nodeType.label }, position: flowPosition };
        setNodes((existingNodes: any) => [...existingNodes, newNode]);
        onOpenChange(false);
    }, [setNodes, getNodes, onOpenChange, screenToFlowPosition]);

    const renderNodesList = (nodesList: any[]) =>
        nodesList.map((nodeType, idx) => {
            const Icon = nodeType.icon;
            const isPaid = nodeType.paid;

            return (
                <div
                    key={idx}
                    onClick={() => handleNodeSelect(nodeType)}
                    className={`
                    relative flex items-center gap-4 p-3 rounded-lg cursor-pointer transition
                    ${isPaid
                        ? "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30"
                        : "hover:bg-primary/10"
                    }
                `}
                >
                    {/* Badge */}
                    {isPaid && (
                        <span className="absolute right-2 top-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black font-semibold">
                        PRO
                    </span>
                    )}

                    <div
                        className={`
                        w-8 h-8 flex items-center justify-center rounded
                        ${isPaid
                            ? "bg-amber-500/30 text-amber-700"
                            : "bg-primary/20 text-primary"
                        }
                    `}
                    >
                        {typeof Icon === "string" ? (
                            <Image src={Icon} alt="/logo" width={16} height={16} />
                        ) : (
                            <Icon className="size-5" />
                        )}
                    </div>

                    <div className="flex flex-col">
                    <span className="font-medium flex items-center gap-1">
                        {nodeType.label}
                        {isPaid && <StarIcon className="size-3 text-amber-500" />}
                    </span>

                        <span className="text-xs text-muted-foreground">
                        {nodeType.description}
                    </span>

                        {isPaid && (
                            <span className="text-[11px] text-amber-600">
                            Требуется подключение Email / домена
                        </span>
                        )}
                    </div>
                </div>
            );
        });

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto px-3">
                <SheetHeader>
                    <SheetTitle>Выберите ноду</SheetTitle>
                    <SheetDescription>Выберите ноду чтобы добавить в ваш воркфлоу</SheetDescription>
                </SheetHeader>

                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                        Триггеры
                    </h4>
                    <div className="flex flex-col gap-2">{renderNodesList(triggerNodes)}</div>
                </div>
                <div>

                    <div className="flex flex-col gap-2">{renderNodesList(googleFormNodes)}</div>
                </div>
                <div>

                    <div className="flex flex-col gap-2">{renderNodesList(yandexFormNodes)}</div>
                </div>
                <div>

                    <div className="flex flex-col gap-2">{renderNodesList(stripeNodes)}</div>
                </div>

                <Separator className="my-4" />

                <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                        Действия
                    </h4>
                    <div className="flex flex-col gap-2">{renderNodesList(executionNodes)}</div>


                    <div className="flex flex-col gap-2">{renderNodesList(geminiNodes)}</div>
                    <div className="flex flex-col gap-2">{renderNodesList(openaiNodes)}</div>
                    <div className="flex flex-col gap-2">{renderNodesList(anthropicNodes)}</div>
                    <div className="flex flex-col gap-2">{renderNodesList(discordNodes)}</div>
                    <div className="flex flex-col gap-2">{renderNodesList(slackNodes)}</div>
                    <div className="flex flex-col gap-2">{renderNodesList(telegramNodes)}</div>
                    <div className="flex flex-col gap-2">{renderNodesList(whatsappNodes)}</div>
                    <div className="flex flex-col gap-2">{renderNodesList(vkNodes)}</div>
                    <div className="flex flex-col gap-2">{renderNodesList(emailNodes)}</div>
                </div>



            </SheetContent>
        </Sheet>
    );
};

export default NodeSelector;
