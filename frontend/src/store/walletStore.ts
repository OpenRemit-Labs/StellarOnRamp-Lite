import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WalletState {
  address: string | null
  connectionMethod: 'freighter' | 'manual' | null
  setWallet: (address: string, method: 'freighter' | 'manual') => void
  disconnect: () => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      connectionMethod: null,
      setWallet: (address, method) => set({ address, connectionMethod: method }),
      disconnect: () => set({ address: null, connectionMethod: null }),
    }),
    { name: 'stellar-wallet' }
  )
)
