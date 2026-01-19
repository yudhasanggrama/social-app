import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "react-router-dom"

export function Login() {
    
  return (
    <>
        <div className="flex h-[336px] mt-[128px] items-center justify-center bg-black-900 px-4">
            <Card className="w-full max-w-sm bg-zinc-950 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-green-500 font-semibold text-4xl">circle</CardTitle>
                        <CardDescription className="text-2xl">
                            Login to Circle
                        </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input id="password" type="password" required />
                                <Link
                                    to="/register"
                                    className="ml-auto inline-block text-sm underline-offset-4"
                                    >
                                    Forgot your password?
                                </Link>
                            </div>
                            
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button type="submit" className="w-full rounded-full bg-green-500 hover:bg-green-600">
                        Login
                    </Button>
                </CardFooter>
                <span className="ml-5">Don't have an account? <Link to="/register" className="text-green-500 underline">create account</Link></span>
            </Card>
    </div>
    
    </>
  )
}
