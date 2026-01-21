import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "./store"
import { login } from "./store"
import api from "./lib/api"

import {Login} from "./pages/Login"
import Register from "./pages/Register"
import ProtectedRoute from "./components/ProtectedRoute"
import { setAuthChecked } from "./store"
import Home from "./pages/Home"
import GuestRoute from "./components/GuestRoute"


function App() {
  const dispatch = useDispatch<AppDispatch>()


 useEffect(() => {
  api.get("/me")
    .then(res => {
      dispatch(login({ name: res.data.user.username }))
    })
    .catch(() => {
      dispatch(setAuthChecked())
    })
}, [dispatch])

  return (
    <Routes>
        {/* guest */}
    <Route element={<GuestRoute />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>

      {/* protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App
