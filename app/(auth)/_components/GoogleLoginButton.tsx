
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/useAuth";
import { FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export const GoogleLoginButton = () => {
    const { setUser } = useAuth();
    const router = useRouter();

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const { data } = await axios.post("/api/auth/google", {
                    access_token: tokenResponse.access_token,
                });

                localStorage.setItem("token", data.token);
                toast.success("Добро пожаловать, " + data.user.userName);
                setUser(data.user);
                router.replace("/workflows");

            } catch (err: any) {
                console.error(err);
                toast.error("Ошибка входа через Google");
            }
        },
        onError: () => toast.error("Не удалось войти через Google"),
    });

    return (
        <Button
            onClick={() => googleLogin()}
            className="flex px-6 py-6 text-lg items-center gap-2 bg-white text-gray-700 border hover:bg-gray-100"
            type="button"
        >
            <FaGoogle className="text-primary" />
            Войти через Google
        </Button>
    );
};


