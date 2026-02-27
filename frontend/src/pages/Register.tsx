import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { RegisterForm } from "@/Types/auth"
import { registerUser } from "@/services/authService"

const Register = () => {
    const [form, setForm] = useState<RegisterForm>({
        full_name: "",
        username: "",
        email: "",
        password: ""
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.id]: e.target.value
        })
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")
        
        try {
        const user = await registerUser(form);
        console.log("SUCCESS:", user.message);
        navigate("/login", {
            state: { fromRegister: true, message: "Account successfully created, You can Login Now" },
        });
        } catch (err: any) {
        console.error("REGISTER ERROR:", err.response?.data || err.message);
        } finally {
            setLoading(false)
        }
    }

    return (
    <>
        <div className="flex h-[336px] mt-[128px] items-center justify-center bg-black-900 px-4">
            <Card className="w-full max-w-sm bg-zinc-950 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-green-500 font-semibold text-4xl">circle</CardTitle>
                        <CardDescription className="text-2xl">
                            Create account Circle
                        </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input
                                    id="full_name"
                                    name="full_name"
                                    type="full_name"
                                    placeholder="John Doe"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    type="username"
                                    placeholder="John Doe"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input 
                                    id="password" 
                                    name="passwrod"
                                    type="password" 
                                    value={form.password}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                        <div className="mt-4">
                            <Button type="submit" className="w-full rounded-full bg-green-500 hover:bg-green-600" disabled={loading}>
                                {loading ? "Loading..." : "Create"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <span className="ml-5">Already have account? <Link to="/login" className="text-green-500 underline">Login</Link></span>
            </Card>
        </div>
    </>
    )
}

export default Register