import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/lib/types"

interface UserState {
  user: User | null
  token: string | null
  setUser: (user: User, token: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", token)
        }
        set({ user, token })
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.clear()
        }
        set({ user: null, token: null })
      },
    }),
    {
      name: "user-storage",
    },
  ),
)
