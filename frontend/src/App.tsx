import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "./store/types"
import { login } from "./store"
import {Login} from "./pages/Login"
import Register from "./pages/Register"
import ProtectedRoute from "./components/ProtectedRoute"
import { setAuthChecked } from "./store"
import Home from "./pages/Home"
import GuestRoute from "./components/GuestRoute"
import { FlashMessageProvider } from "./contexts/FlashProvider"
import ThreadDetailPage from "./pages/ThreadDetailPage"
import { fetchProfile } from "./store/profile"
import { logout } from "./store"
import AppLayout from "./components/layouts/AppLayout"
import FollowPage from "./pages/FollowPage"
import SearchPage from "./pages/SearchPage"
import MyProfilePage from "./pages/MyProfilePage"




function App() {
const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchProfile())
      .unwrap()
      .then((profile) => {
        dispatch(
          login({
            id: Number(profile.id),
            name: profile.username, 
          })
        );
      })
      .catch(() => {
        dispatch(logout()); 
      })
      .finally(() => {
        dispatch(setAuthChecked()); 
      });
  }, [dispatch]);

  return (
    <FlashMessageProvider>
  <Routes>
    {/* GUEST */}
    <Route element={<GuestRoute />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>

    {/* PROTECTED + LAYOUT */}
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/thread/:id" element={<ThreadDetailPage />} />
        <Route path="/follow" element={<FollowPage />} />
        <Route path="/profile" element={<MyProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
      </Route>
    </Route>
  </Routes>
</FlashMessageProvider>

  )
}

export default App
