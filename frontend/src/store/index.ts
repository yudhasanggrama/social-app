import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit"

// ===== Auth Slice =====
interface AuthState {
  name: string
  isLoggedIn: boolean
}

const initialState: AuthState = {
  name: "",
  isLoggedIn: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ name: string }>) => {
      state.name = action.payload.name
      state.isLoggedIn = true
    },
    logout: (state) => {
      state.name = ""
      state.isLoggedIn = false
    },
  },
})

export const { login, logout } = authSlice.actions

// ===== Configure Store =====
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
})

// ===== Types =====
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
