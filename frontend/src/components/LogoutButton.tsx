import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { useDispatch } from "react-redux"
import { logout } from "@/store"

const LogoutButton = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    const handleLogout = async () => {
            try {
            await api.post("/logout") // cookie akan ikut dihapus
            dispatch(logout())        // update state global
            navigate("/login", { replace: true })
            } catch {
            alert("Logout gagal")
            }
        }

        return (
            <Button onClick={handleLogout} variant="destructive">
                Logout
            </Button>
        )
    }

export default LogoutButton
