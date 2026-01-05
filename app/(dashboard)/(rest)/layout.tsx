
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
import AppHeader from "@/components/AppHeader";
const RestLayout = ({children}: {children: React.ReactNode}) => {




    return (
        <>
            <AppHeader/>
            <main className='flex-1'>

                {children}
            </main>
        </>

    )
}
export default RestLayout
