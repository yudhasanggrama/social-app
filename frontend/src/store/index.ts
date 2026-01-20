import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit"

// ===== Auth Slice =====
interface AuthState {
  name: string
  isLoggedIn: boolean
  authChecked: boolean,
}

const initialState: AuthState = {
  name: "",
  isLoggedIn: false,
   authChecked: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ name: string }>) => {
      state.name = action.payload.name
      state.isLoggedIn = true,
      state.isLoggedIn = true
      state.authChecked = true
    },
     logout: (state) => {
      state.name = ""
      state.isLoggedIn = false
      state.authChecked = true
    },
    setAuthChecked: (state) => {
      state.authChecked = true
    }
  },
})

export const { login, logout, setAuthChecked } = authSlice.actions

// ===== Configure Store =====
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
})

// ===== Types =====
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
