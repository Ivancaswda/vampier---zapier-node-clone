'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import {StarIcon, PlayIcon, MailIcon, FolderOpenIcon, Loader2Icon, PlayCircleIcon} from 'lucide-react'
import {FaTwitter, FaDiscord, FaGithub, FaTelegram, FaGoogle} from 'react-icons/fa'
import Image from 'next/image'
import { SparklesCore } from "@/components/ui/sparkles"
import {InfiniteMovingCards} from "@/components/ui/infinite-moving-cards";
import {Carousel} from "@/components/ui/apple-cards-carousel";
import {Card} from "@/components/ui/apple-cards-carousel";
import Carousel2 from "@/components/ui/carousel";
import {useAuth} from "@/context/useAuth";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import { FaVk,  FaYandex, FaStripe,  FaSlack, FaWhatsapp,  } from 'react-icons/fa';
import {GoogleLoginButton} from "@/app/(auth)/_components/GoogleLoginButton";

const features = [
    {
        title: 'Автоматизация',
        description: 'Создавай и управляй воркфлоу без усилий.',
        icon: PlayIcon
    },
    {
        title: 'Интеграции',
        description: 'Подключай Google Формы, Stripe, Discord и более 15+ сервисов.',
        icon: FolderOpenIcon
    },
    {
        title: 'Email рассылки',
        description: 'Отправляй email через Resend с кастомными доменами.',
        icon: MailIcon
    },
    {
        title: 'Pro функционал',
        description: 'Безлимитные воркфлоу, приоритетная поддержка и PRO-фичи.',
        icon: StarIcon
    }
]

const socialLinks = [
    { icon: FaTwitter, url: "https://twitter.com" },
    { icon: FaDiscord, url: "https://discord.com" },
    { icon: FaGithub, url: "https://github.com" },
    { icon: FaTelegram, url: "https://t.me" },
]
const testimonials = [
    {
        quote:
            "Vampier полностью изменил мой рабочий процесс! Раньше я тратил часы на рутину, а теперь все автоматические задачи выполняются сами.",
        name: "Алексей Иванов",
        title: "Фрилансер, Москва",
    },
    {
        quote:
            "Создание сложных воркфлоу стало простым и понятным. С Vampier я могу интегрировать Google Формы, Stripe и Discord без единой строчки кода.",
        name: "Мария Петрова",
        title: "Менеджер проектов, Санкт-Петербург",
    },
    {
        quote:
            "Раньше я забывал отправлять клиентам важные уведомления, а теперь Vampier делает это автоматически. Это сэкономило мне массу времени и нервов.",
        name: "Игорь Сидоров",
        title: "Стартап, Новосибирск",
    },
    {
        quote:
            "Pro-подписка просто супер! Безлимитные воркфлоу и приоритетная поддержка сделали мой бизнес полностью автоматизированным.",
        name: "Екатерина Смирнова",
        title: "Владелец интернет-магазина, Казань",
    },
    {
        quote:
            "Я пробовал несколько сервисов автоматизации, но только Vampier сочетает простоту и мощь. Настройка интеграций занимает минуты, а не часы.",
        name: "Дмитрий Кузнецов",
        title: "Разработчик, Екатеринбург",
    },
];
const slideData = [
    {
        title: "Автоматизация задач",
        button: "Начать бесплатно",
        description: "Создавай воркфлоу, подключай сервисы и экономь время на рутине.",
        src: "/instanct.png",
    },
    {
        title: "Интеграции без кода",
        button: "Подключить сервис",
        description: "Google Формы, Stripe, Discord и более 15+ сервисов — всё под рукой.",
        src: "/config.png",
    },
    {
        title: "Email рассылки через Resend",
        button: "Отправить письмо",
        description: "Управляй уведомлениями и email с кастомными доменами без усилий.",
        src: "/email.png",
    },
    {
        title: "Pro-функции для бизнеса",
        button: "Перейти на Pro",
        description: "Безлимитные воркфлоу, приоритетная поддержка и расширенные возможности.",
        src: "/pro.png",
    },
];

const logoIcons = [
    { name: "ВКонтакте", icon: FaVk },
    { name: "Google", icon: FaGoogle },
    { name: "Яндекс", icon: FaYandex },
    { name: "Stripe", icon: FaStripe },
    { name: "Discord", icon: FaDiscord },
    { name: "Slack", icon: FaSlack },
    { name: "WhatsApp", icon: FaWhatsapp },
    { name: "Telegram", icon: FaTelegram },
];


const DummyContent = () => {
    return (
        <>
            {[...new Array(3).fill(1)].map((_, index) => {
                return (
                    <div
                        key={"dummy-content" + index}
                        className="bg-neutral-900 p-8 md:p-14 rounded-3xl mb-4"
                    >
                        <p className="text-neutral-300 text-base md:text-2xl font-sans max-w-3xl mx-auto mb-6">
              <span className="font-bold text-white">
                Связывай ноды и создавай автоматизацию без кода.
              </span>{" "}
                            Подключай сервисы, обрабатывай события и запускай действия
                            автоматически. Строй сложные цепочки процессов и управляй ими
                            централизованно. Каждый узел может взаимодействовать с другими
                            узлами для полной автоматизации.
                        </p>
                        <img
                            src="https://images.unsplash.com/photo-1612831455543-d94a4bfc0f16?q=80&w=1200&auto=format&fit=crop"
                            alt="Пример работы нодов"
                            className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain rounded-lg shadow-lg"
                        />
                    </div>
                );
            })}
        </>
    );
};
const data = [
    {
        category: "Автоматизация",
        title: "Создавай свои первые воркфлоу",
        src: "/firstImage.png",
        content: <DummyContent />,
    },
    {
        category: "Интеграции",
        title: "Подключай сервисы и API",
        src: "/int.jpg",
        content: <DummyContent />,
    },
    {
        category: "Email и уведомления",
        title: "Отправляй письма и уведомления",
        src: "/email.png",
        content: <DummyContent />,
    },
    {
        category: "Pro-функции",
        title: "Безлимитные ноды и расширенные возможности",
        src: "/pro.png",
        content: <DummyContent />,
    },
    {
        category: "Мониторинг",
        title: "Следи за выполнением воркфлоу",
        src: "/monitoring.jpg",
        content: <DummyContent />,
    },
    {
        category: "Аналитика",
        title: "Отслеживай эффективность процессов",
        src: "/analytics.png",
        content: <DummyContent />,
    },
];
export function AppleCardsCarouselDemo() {
    const cards = data.map((card, index) => (
        <Card key={card.src} card={card} index={index} />
    ));

    return (
        <div className="w-full h-full py-20 bg-black text-white">
            <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-white font-sans mb-12">
                Автоматизация и связка нодов
            </h2>
            <Carousel items={cards} />
        </div>
    );
}
const HomePage = () => {
    const {user, loading} = useAuth()
    return (
        <div className="flex flex-col min-h-screen bg-black text-white">

            <header className="flex justify-between items-center p-6 bg-gray-900/90">
                <div className="flex items-center px-4 mb-4 cursor-pointer gap-2 text-xl justify-start font-bold text-primary  ">

                    <PlayCircleIcon  height={30} className='text-primary w-[30px] h-[30px] ' width={30}/>
                    Vampier
                </div>
                {!loading ? <>

                    {!user ?  <div className="flex gap-4">
                        <Button variant="outline" className='text-black!' onClick={() => window.location.href='/sign-up'}>Регистрация</Button>
                        <Button onClick={() => window.location.href='/sign-in'}>Вход</Button>
                    </div> :  <div className="flex gap-4 text-black! bg-primary rounded-full">
                        <Avatar className='bg-primary! text-black!'>
                            <AvatarImage src={user?.avatarUrl}/>
                            <AvatarFallback className='bg-primary! text-black!'>
                                {user?.userName[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div> }
                </> : <div className='flex items-center justify-center'><Loader2Icon className='animate-spin text-primary'/></div>}


            </header>


            <section className="flex flex-col items-center text-center py-20 bg-gradient-to-b from-gray-900 to-black">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">Автоматизируй свой бизнес с Vampier</h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-6">
                    Подключай сервисы, создавай воркфлоу, отправляй уведомления и email — всё в одном месте.
                </p>

                {!loading ? <>

                    {!user ?  <div className='flex items-center justify-center gap-3'>
                        <Button size="lg" className='py-6! px-6! text-lg! transition hover:scale-105' onClick={() => window.location.href='/sign-up'}>Начать бесплатно</Button>
                        <GoogleLoginButton/>

                    </div> :  <div className="flex gap-4">
                        <Button onClick={() => window.location.href='/workflows'} className='text-black! text-lg! py-6! px-6! transition hover:scale-105'
                        >К сценариям</Button>

                    </div> }
                </> : <div className='flex items-center justify-center'><Loader2Icon className='animate-spin text-primary'/></div>}


            </section>
            <AppleCardsCarouselDemo/>

            <div className="relative overflow-hidden w-full h-full py-20 bg-black text-white">
                <Carousel2
                    slides={slideData && slideData.length ? slideData : []}
                />
            </div>

            <div className="h-[40rem] rounded-md flex flex-col antialiased bg-black bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
                <InfiniteMovingCards
                    items={testimonials}
                    direction="right"
                    speed="slow"
                />
            </div>


            <section className="py-16 ">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">Возможности Vampier</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f) => {
                            const Icon = f.icon
                            return (
                                <div key={f.title} className="p-6 border border-gray-700 rounded-xl hover:shadow-lg transition cursor-pointer flex flex-col items-center text-center">
                                    <Icon className="size-8 text-primary mb-4" />
                                    <h3 className="font-semibold text-xl mb-2">{f.title}</h3>
                                    <p className="text-gray-300">{f.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>


            <div className="h-[40rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden relative rounded-md">
                <h1 style={{color: 'crimson'}} className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-red! relative z-20">
                    Vampier
                </h1>
                <div className="w-[40rem] h-40 relative">
                    <SparklesCore
                        background="transparent"
                        minSize={0.4}
                        maxSize={1}
                        particleDensity={1200}
                        className="w-full h-full absolute inset-0"
                        particleColor="#FF0000"
                    />
                    <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
                </div>
            </div>


            <section className="py-16  text-center">
                <h2 className="text-3xl font-bold mb-4">Начни создавать воркфлоу прямо сейчас</h2>
                <p className="text-gray-300 mb-6">Создай свой первый сценарий и автоматизируй рутину</p>
                <Button size="lg" onClick={() => window.location.href='/workflows'}>Создать воркфлоу</Button>
            </section>
            <div className="overflow-hidden py-8">
                <div className="flex animate-marquee whitespace-nowrap gap-12">
                    {logoIcons.concat(logoIcons).map((logo, index) => {
                        const Icon = logo.icon;
                        return (
                            <div
                                key={index}
                                className="flex items-center justify-center w-16 h-16 text-gray-300 hover:text-primary transition text-4xl"
                            >
                                <Icon />
                            </div>
                        );
                    })}
                </div>

                <style jsx>{`
                    .animate-marquee {
                        display: inline-flex;
                        animation: marquee 20s linear infinite;
                    }
                    @keyframes marquee {
                        0% {
                            transform: translateX(0%);
                        }
                        100% {
                            transform: translateX(-50%);
                        }
                    }
                `}</style>
            </div>



            <footer className="bg-gray-900 mt-auto">
                <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center px-4 mb-4 cursor-pointer gap-2 text-xl justify-start font-bold text-primary  ">

                            <PlayCircleIcon  height={30} className='text-primary w-[30px] h-[30px] ' width={30}/>
                            Vampier
                        </div>
                        <p className="text-gray-400">Автоматизация бизнеса и управление воркфлоу в одном месте.</p>
                        <div className="flex gap-3 mt-2">
                            {socialLinks.map((s, idx) => {
                                const Icon = s.icon
                                return (
                                    <a key={idx} href={s.url} target="_blank" rel="noreferrer" className="hover:text-primary transition">
                                        <Icon className="size-5" />
                                    </a>
                                )
                            })}
                        </div>
                    </div>


                    <div className="flex flex-col gap-2 text-gray-400">
                        <h3 className="font-semibold text-white mb-2">Полезные ссылки</h3>
                        <a href="#" className="hover:text-primary transition">Документация</a>
                        <a href="#" className="hover:text-primary transition">Тарифы</a>
                        <a href="#" className="hover:text-primary transition">Поддержка</a>
                        <a href="#" className="hover:text-primary transition">Блог</a>
                    </div>


                    <div className="flex flex-col gap-2 text-gray-400">
                        <h3 className="font-semibold text-white mb-2">Контакты</h3>
                        <p>Email: <a href="mailto:katkovskiji@gmail.com" className="hover:text-primary transition">katkovskiji@gmail.com</a></p>
                        <p>Телефон: <a href="tel:+1234567890" className="hover:text-primary transition">+79521637168</a></p>
                        <p>Адрес: Томск, Россия</p>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-6 py-4 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Vampier. Все права защищены.
                </div>
            </footer>
        </div>
    )
}

export default HomePage
