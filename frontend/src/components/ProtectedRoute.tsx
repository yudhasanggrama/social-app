import { Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"

const ProtectedRoute = () => {
  const isAuth = useSelector((state: RootState) => state.auth.isLoggedIn)
  if (!isAuth) return <Navigate to="/login" replace />
  return <Outlet />
}

export default ProtectedRoute
