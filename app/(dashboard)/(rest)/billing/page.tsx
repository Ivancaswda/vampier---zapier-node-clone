'use client'
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, StarIcon } from "lucide-react";
import {toast} from "sonner";
import {useAuth} from "@/context/useAuth";

const plans = [
    {
        name: "Classic",
        price: "Бесплатно",
        description: "Для простых сценариев",
        features: [
            "До 3 воркфлоу",
            "Все триггеры",
            "Базовые действия",
        ],
        current: true,
    },
    {
        name: "Pro",
        price: "150 рублей / месяц",
        description: "Для автоматизации без ограничений",
        features: [
            "Безлимитные воркфлоу",
            "Email (Resend)",
            "Все интеграции",
            "Приоритетная поддержка",
        ],
        highlight: true,
    },
];

const BillingPage = () => {
    const {user} = useAuth()


    const proLink = 'https://vampier.lemonsqueezy.com/checkout/buy/1b7ee646-a0bd-4fd0-a33b-28c08ac8f400'



    const handleUpgrade = () => {
        if (user?.isPro) {
            toast.success('У вас уже есть Pro подписка!')
            return
        }
        window.open(proLink, '_blank')
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-center mb-2">
                Тарифные планы
            </h1>
            <p className="text-muted-foreground text-center mb-10">
                Выберите план, который подходит вам
            </p>

            <div className="grid md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`
              relative rounded-xl border p-6 flex flex-col
              ${plan.highlight
                            ? "border-amber-500 bg-amber-500/5"
                            : "border-border"
                        }
            `}
                    >
                        {plan.highlight && (
                            <span className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full bg-amber-500 text-black font-semibold flex items-center gap-1">
                <StarIcon className="size-3" />
                PRO
              </span>
                        )}

                        <h2 className="text-xl font-semibold">{plan.name}</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            {plan.description}
                        </p>

                        <div className="text-3xl font-bold mb-6">
                            {plan.price}
                        </div>

                        <ul className="space-y-2 flex-1">
                            {plan.features.map((f) => (
                                <li key={f} className="flex items-center gap-2 text-sm">
                                    <CheckIcon className="size-4 text-green-500" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        {plan.current ? (
                            <Button disabled className="mt-6">
                                Текущий план
                            </Button>
                        ) : (
                            <Button
                                className="mt-6 bg-amber-500 hover:bg-amber-500/90 text-black"
                                onClick={handleUpgrade}
                            >
                                Перейти на Pro
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BillingPage;
