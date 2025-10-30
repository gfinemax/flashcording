import { create } from "zustand"

interface AgentState {
  isProcessing: boolean
  progress: number
  message: string
  result: any | null
  setProcessing: (isProcessing: boolean) => void
  setProgress: (progress: number, message: string) => void
  setResult: (result: any) => void
  reset: () => void
}

export const useAgentStore = create<AgentState>((set) => ({
  isProcessing: false,
  progress: 0,
  message: "",
  result: null,
  setProcessing: (isProcessing) => set({ isProcessing }),
  setProgress: (progress, message) => set({ progress, message }),
  setResult: (result) => set({ result, isProcessing: false }),
  reset: () => set({ isProcessing: false, progress: 0, message: "", result: null }),
}))
