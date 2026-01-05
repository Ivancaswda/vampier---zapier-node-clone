import React, {useEffect} from 'react'
import {
    CheckIcon,
    CreditCardIcon,
    FolderOpenIcon,
    MailIcon,
    PlayCircleIcon,
    PlayIcon,
    StarIcon,
    UserIcon
} from "lucide-react";
import {
    Sidebar,
    SidebarContent, SidebarFooter,
    SidebarGroup,
    SidebarGroupContent, SidebarHeader, SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import {toast} from "sonner";
import Link from "next/link";
import Image from "next/image";
import {usePathname, useRouter} from "next/navigation";
import {useAuth} from "@/context/useAuth";
import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const menuItems = [
    {
        title: 'Рабочие процессы',
        icon: FolderOpenIcon,
        url: '/workflows'
    },
    {
        title: 'Учётные данные',
        icon: MailIcon,
        url: '/credentials'
    },
    {
        title: 'Запуски',
        icon: PlayIcon,
        url: '/executions'
    },
    {
        title: 'Получить Premium',
        icon: FolderOpenIcon,
        url: '/billing'
    },
    {
        title: 'Профиль',
        icon: UserIcon,
        url: '/profile'
    }
]
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

const AppSidebar = () => {
    const {logout} = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const {user} = useAuth()
    const proLink = 'https://vampier.lemonsqueezy.com/checkout/buy/1b7ee646-a0bd-4fd0-a33b-28c08ac8f400'
    const [workflowCount, setWorkflowCount] = React.useState(0);

    useEffect(() => {
        if (!user?.isPro) {
            fetch('/api/workflows/get')
                .then(res => res.json())
                .then(data => setWorkflowCount(data.workflows?.length ?? 0));
        }
    }, [user]);


    const handleUpgrade = () => {
        if (user?.isPro) {
            toast.success('У вас уже есть Pro подписка!')
            return
        }
        window.open(proLink, '_blank')
    }
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenuItem>
                <Link href="/" >
                    <div className="flex items-center px-4 mb-4 cursor-pointer gap-2 text-xl justify-start font-bold text-primary  ">

                        <PlayCircleIcon  height={30} className='text-primary w-[30px] h-[30px] ' width={30}/>
                        Vampier
                    </div>
                </Link>


                </SidebarMenuItem>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup key={"workflows"}>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton tooltip={item.title}
                                                       isActive={item.url === '/' ? pathname === '/' : pathname.startsWith(item.url)}
                                                       asChild={true}
                                                       className='gap-x-4 h-10 px-4'
                                    >
                                        <Link href={item.url} prefetch={true}>
                                            <item.icon className='size-4'/>
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>

                    {!user?.isPro && (
                        <div className="px-4 py-3 space-y-2 w-[100%]">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Созданные сценарии</span>
                                <span>{workflowCount} / 3</span>
                            </div>

                            <Progress  value={(workflowCount / 3) * 100} />


                        </div>
                    )}

                    <SidebarMenuItem>
                        <Dialog>
                            <DialogTrigger>



                                <SidebarMenuButton tooltip='Платёжный портал'
                                                   className='gap-x-4 h-10 px-4' onClick={() => {}}
                                >
                                    <CreditCardIcon className='h-4 w-4'/>
                                    <span>Платёжный портал</span>
                                </SidebarMenuButton>
                            </DialogTrigger>
                            <DialogContent>
                                {!user?.isPro ? (
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



                                                    {plan.current ? (
                                                        <Button

                                                            disabled className="mt-6">
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
                                ) :  <div className="grid md:grid-cols-2 gap-6">
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



                                            {plan.current ? (
                                                <Button

                                                    disabled className="mt-6">
                                                    Текущий план
                                                </Button>
                                            ) : (
                                                <Button disabled={true}
                                                    className="mt-6 bg-amber-500 hover:bg-amber-500/90 text-black"
                                                    onClick={handleUpgrade}
                                                >
                                                    Вы уже на Pro
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>}

                            </DialogContent>
                        </Dialog>

                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip='Выйти из аккаунта'
                                           className='gap-x-4 h-10 px-4' onClick={() => {
                            logout()
                            router.replace('/sign-up')
                            toast.success('Вы успешно вышли!')
                        }}
                        >
                            <CreditCardIcon className='h-4 w-4'/>
                            <span>Выйти</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSidebar
