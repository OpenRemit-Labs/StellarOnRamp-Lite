import { ExternalLink } from 'lucide-react'

const HORIZON_BASE = import.meta.env.VITE_STELLAR_NETWORK === 'mainnet'
  ? 'https://stellar.expert/explorer/public/tx'
  : 'https://stellar.expert/explorer/testnet/tx'

export default function TxLink({ hash }: { hash: string }) {
  const short = `${hash.slice(0, 8)}…${hash.slice(-8)}`
  return (
    <a
      href={`${HORIZON_BASE}/${hash}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-mono text-xs text-stellar-400 hover:text-stellar-300 transition-colors"
    >
      {short}
      <ExternalLink size={11} />
    </a>
  )
}
