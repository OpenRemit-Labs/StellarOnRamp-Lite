import { useQuery } from '@tanstack/react-query'
import { walletApi, WalletBalance } from '../lib/api'
import { Coins } from 'lucide-react'

const ASSET_COLORS: Record<string, string> = {
  XLM: 'text-stellar-400',
  USDC: 'text-green-400',
}

export default function BalanceCard({ address }: { address: string }) {
  const { data, isLoading, error } = useQuery<WalletBalance[]>({
    queryKey: ['balances', address],
    queryFn: () => walletApi.getBalances(address),
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-24 mb-4" />
        <div className="h-8 bg-slate-800 rounded w-32" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card border-red-900/50">
        <p className="text-sm text-red-400">Could not load balances. Account may not be activated.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Coins size={16} className="text-slate-400" />
        <h3 className="text-sm font-medium text-slate-400">Wallet Balances</h3>
      </div>
      {data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((b) => (
            <div key={b.asset} className="flex items-center justify-between">
              <span className={`font-semibold ${ASSET_COLORS[b.asset] ?? 'text-slate-300'}`}>
                {b.asset}
              </span>
              <span className="font-mono text-lg text-slate-100">
                {parseFloat(b.balance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No balances found. Fund your account to get started.</p>
      )}
    </div>
  )
}
