// context/AuthContext.tsx
'use client'
import { createContext, useContext, useEffect, useState } from "react"

interface User {
    email: string
    userName: string
    avatarUrl?: string | null
}

interface AuthContextType {
    user: User | null
    loading: boolean
    logout: () => void
    setUser: (user: User | null) => void
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: () => {},
    setUser: () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token")
            if (!token) {
                setLoading(false)
                return
            }

            try {
                const res = await fetch("/api/auth/user", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                } else {
                    localStorage.removeItem("token")
                }
            } catch (err) {
                console.error("Auth error", err)
                localStorage.removeItem("token")
            }
            setLoading(false)
        }

        fetchUser()
    }, [])

    const logout = () => {
        localStorage.removeItem("token")
        setUser(null)

    }

    return (
        <AuthContext.Provider value={{ user, loading, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
