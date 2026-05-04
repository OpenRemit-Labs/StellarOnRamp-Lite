import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Pending' },
  processing: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Processing' },
  completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Failed' },
  expired: { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-400/10', label: 'Expired' },
} as const

type Status = keyof typeof STATUS_CONFIG

export default function StatusBadge({ status }: { status: Status }) {
  const { icon: Icon, color, bg, label } = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`badge ${bg} ${color}`}>
      <Icon size={12} className={status === 'processing' ? 'animate-spin' : ''} />
      {label}
    </span>
  )
}
