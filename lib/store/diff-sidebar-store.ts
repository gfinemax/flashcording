import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface DiffSidebarState {
  isCollapsed: boolean
  toggle: () => void
  setCollapsed: (collapsed: boolean) => void
}

export const useDiffSidebarStore = create<DiffSidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    }),
    {
      name: "diff-sidebar-storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : undefined) as any),
    },
  ),
)
