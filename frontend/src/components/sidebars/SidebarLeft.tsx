import { LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarNav } from "./SidebarNav"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import api from "@/lib/api"
import { logout } from "@/store"
import { useEffect, useState } from "react"
import type { MeUser } from "./SidebarRight"

const SidebarLeft = () => {

      const [me, setMe] = useState<MeUser | null>(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchMe = async () => {
          try {
            const res = await api.get("/me");
            setMe(res.data.user);
          } catch {
            setMe(null);
          } finally {
            setLoading(false);
          }
        };

        fetchMe();
      }, []);



    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    const handleLogout = async () => {
            try {
            await api.post("/logout") 
            dispatch(logout())        
            navigate("/login", { replace: true })
            } catch {
            alert("Logout gagal")
            }
        }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-zinc-950 border-x">
   
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-green-500">circle</h1>
      </div>

      <div className="flex-1 px-2">
        <SidebarNav />
      </div>

      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>

            <div className="text-sm">
              <p className="font-medium">{me?.full_name}</p>
              <p className="text-zinc-400">{me?.username}</p>
            </div>
          </div>


          <LogOut
            onClick={handleLogout}
            className="h-5 w-5 cursor-pointer text-zinc-400 hover:text-red-500"
          />
        </div>
      </div>
    </aside>
  )
}

export default SidebarLeft
