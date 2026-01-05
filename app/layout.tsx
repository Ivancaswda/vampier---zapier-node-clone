
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {AuthProvider} from "@/context/AuthProvider";
import {Toaster} from "@/components/ui/sonner";
import { GoogleOAuthProvider } from '@react-oauth/google';



const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Vampier",
    description: "Сделай свой сценарий по твоему вкусу интегрируя любимые приложения",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {


    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            <AuthProvider>



                <html lang="en">
                <body
                    className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                >


                {children}

                <Toaster/>

                </body>
                </html>

            </AuthProvider>
        </GoogleOAuthProvider>
    );
}
