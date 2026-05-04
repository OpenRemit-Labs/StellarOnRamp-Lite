import { useQuery } from '@tanstack/react-query'
import { walletApi, PaymentIntent } from '../lib/api'
import { useWalletStore } from '../store/walletStore'
import BalanceCard from '../components/BalanceCard'
import StatusBadge from '../components/StatusBadge'
import TxLink from '../components/TxLink'
import { History, Copy } from 'lucide-react'
import { useState } from 'react'

export default function DashboardPage() {
  const { address } = useWalletStore()
  const [copied, setCopied] = useState(false)

  const { data: history, isLoading } = useQuery<PaymentIntent[]>({
    queryKey: ['history', address],
    queryFn: () => walletApi.getHistory(address!),
    enabled: !!address,
    refetchInterval: 15_000,
  })

  const short = address ? `${address.slice(0, 8)}…${address.slice(-8)}` : ''

  const copyAddress = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={copyAddress}
          className="flex items-center gap-1.5 mt-1 text-sm text-slate-500 hover:text-slate-300 transition-colors font-mono"
        >
          {short}
          <Copy size={12} className={copied ? 'text-green-400' : ''} />
        </button>
      </div>

      <BalanceCard address={address!} />

      {/* Transaction history */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <History size={16} className="text-slate-400" />
          <h3 className="font-medium">Onramp History</h3>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && (!history || history.length === 0) && (
          <p className="text-sm text-slate-500 text-center py-6">
            No transactions yet. Make your first onramp!
          </p>
        )}

        {history && history.length > 0 && (
          <div className="space-y-2">
            {history.map((tx) => (
              <TxRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TxRow({ tx }: { tx: PaymentIntent & { tx_hash?: string } }) {
  const date = new Date(tx.createdAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const FIAT_SYMBOLS: Record<string, string> = {
    NGN: '₦', KES: 'KSh', GHS: '₵', ZAR: 'R', BRL: 'R$', PHP: '₱', USD: '$',
  }
  const symbol = FIAT_SYMBOLS[tx.fiatCurrency] ?? tx.fiatCurrency

  return (
    <div className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3">
      <div className="space-y-0.5">
        <div className="text-sm font-medium">
          {symbol}{tx.fiatAmount.toLocaleString()} → {parseFloat(tx.assetAmount).toFixed(4)} {tx.asset}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{date}</span>
          {tx.tx_hash && <TxLink hash={tx.tx_hash} />}
        </div>
      </div>
      <StatusBadge status={tx.status} />
    </div>
  )
}
