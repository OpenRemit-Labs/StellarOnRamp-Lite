/**
 * Freighter wallet integration.
 * Falls back gracefully when Freighter is not installed.
 */

declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<boolean>
      getPublicKey: () => Promise<string>
      getNetwork: () => Promise<string>
      signTransaction: (xdr: string, opts?: { network?: string }) => Promise<string>
    }
  }
}

export async function isFreighterInstalled(): Promise<boolean> {
  return typeof window.freighter !== 'undefined'
}

export async function connectFreighter(): Promise<string> {
  if (!window.freighter) {
    throw new Error('Freighter wallet not installed. Please install the Freighter browser extension.')
  }
  const connected = await window.freighter.isConnected()
  if (!connected) {
    throw new Error('Please unlock your Freighter wallet and try again.')
  }
  return window.freighter.getPublicKey()
}

export async function getFreighterNetwork(): Promise<string> {
  if (!window.freighter) return 'TESTNET'
  return window.freighter.getNetwork()
}
