import { create } from 'zustand'

interface AppState {
  isDeployed: boolean
  aiEnabled: boolean
  setDeployed: (value: boolean) => void
  setAiEnabled: (value: boolean) => void
  toggleAi: () => void
}

export const useAppStore = create<AppState>((set) => ({
  isDeployed: true,
  aiEnabled: false,
  setDeployed: (value) => set({ isDeployed: value }),
  setAiEnabled: (value) => set({ aiEnabled: value }),
  toggleAi: () => set((state) => ({ aiEnabled: !state.aiEnabled })),
}))

