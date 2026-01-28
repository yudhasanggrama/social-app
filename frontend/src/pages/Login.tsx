import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState, useRef }from "react"
import type { LoginForm } from "@/Types/auth"
import { useDispatch } from "react-redux"
import api from "@/lib/api"
import { login } from "@/store"
import { toast } from "sonner"



export function Login() {
    const [form, setForm] = useState<LoginForm>({
        identifier: "",
        password: "",
    })
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation();
    const shownRef = useRef(false);

    useEffect(() => {
        if (shownRef.current) return;

        const st = location.state as
        | { fromRegister?: boolean; message?: string }
        | null;

        if (st?.fromRegister && st?.message) {
        shownRef.current = true;
        toast.success(st.message);

        navigate(location.pathname, { replace: true, state: null });
        }
    }, [location, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {

        await api.post("/login", form, { withCredentials: true });
        const meRes = await api.get("/profile", { withCredentials: true });
            dispatch(
                login({
                id: meRes.data.id,
                name: meRes.data.username,
                })
            );
            toast.success("Login Successfull");
            navigate("/", { replace: true });
        } catch (err) {
            console.error(err);
            toast.error("Login gagal");
        }
    };

    return (
    <>
        <div className="flex h-[336px] mt-[128px] items-center justify-center bg-black-900 px-4">
            <Card className="w-full max-w-sm bg-zinc-950 border-zinc-800">
            <CardHeader>
                <CardTitle className="text-green-500 font-semibold text-4xl">
                circle
                </CardTitle>
                <CardDescription className="text-2xl">
                Login to Circle
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                    <Label htmlFor="identifier">Username or Email</Label>
                    <Input
                        id="identifier"
                        name="identifier"
                        value={form.identifier}
                        onChange={handleChange}
                        required
                        autoComplete="identifier"
                        />

                    </div>

                    <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                        />

                    <Link
                        to="/register"
                        className="ml-auto inline-block text-sm underline-offset-4"
                    >
                        Forgot your password?
                    </Link>
                    </div>
                </div>

                <div className="mt-4">
                    <Button
                    type="submit"
                    className="w-full rounded-full bg-green-500 hover:bg-green-600"
                    >
                    Login
                    </Button>
                </div>
                </form>
            </CardContent>

            <span className="ml-5">
                Don't have an account?{" "}
                <Link to="/register" className="text-green-500 underline">
                create account
                </Link>
            </span>
            </Card>
        </div>
        </>
    )
}