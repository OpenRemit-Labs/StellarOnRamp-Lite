import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Info, RefreshCw, Copy, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { onrampApi, Quote, PaymentIntent, OnrampConfig } from '../lib/api'
import { useWalletStore } from '../store/walletStore'
import StatusBadge from '../components/StatusBadge'
import TxLink from '../components/TxLink'

type Step = 'form' | 'review' | 'payment' | 'done'

const FIAT_SYMBOLS: Record<string, string> = {
  NGN: '₦', KES: 'KSh', GHS: '₵', ZAR: 'R', BRL: 'R$', PHP: '₱', USD: '$',
}

export default function OnrampPage() {
  const { address } = useWalletStore()
  const [step, setStep] = useState<Step>('form')
  const [fiatAmount, setFiatAmount] = useState('')
  const [fiatCurrency, setFiatCurrency] = useState('NGN')
  const [asset, setAsset] = useState<'XLM' | 'USDC'>('XLM')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [intent, setIntent] = useState<PaymentIntent | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const { data: config } = useQuery<OnrampConfig>({
    queryKey: ['config'],
    queryFn: onrampApi.getConfig,
  })

  // Poll intent status
  const { data: liveIntent } = useQuery<PaymentIntent>({
    queryKey: ['intent', intent?.id],
    queryFn: () => onrampApi.getIntent(intent!.id),
    enabled: !!intent && (intent.status === 'pending' || intent.status === 'processing'),
    refetchInterval: 3000,
  })

  useEffect(() => {
    if (liveIntent) {
      setIntent(liveIntent)
      if (liveIntent.status === 'completed') setStep('done')
    }
  }, [liveIntent])

  const handleGetQuote = async () => {
    const amount = parseFloat(fiatAmount)
    if (!amount || amount <= 0) return toast.error('Enter a valid amount')
    setLoading(true)
    try {
      const q = await onrampApi.getQuote(amount, fiatCurrency, asset)
      setQuote(q)
      setStep('review')
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!quote || !address) return
    setLoading(true)
    try {
      const i = await onrampApi.createIntent(quote.id, address)
      setIntent(i)
      setStep('payment')
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Dev helper: simulate payment completion
  const handleSimulatePay = async () => {
    if (!intent) return
    setLoading(true)
    try {
      const updated = await onrampApi.fulfillIntent(intent.id)
      setIntent(updated)
      if (updated.status === 'completed') setStep('done')
      else toast.success('Payment processing…')
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  const reset = () => {
    setStep('form')
    setQuote(null)
    setIntent(null)
    setFiatAmount('')
  }

  const symbol = FIAT_SYMBOLS[fiatCurrency] ?? fiatCurrency

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Buy Crypto</h1>
        <p className="text-slate-400 text-sm mt-1">Convert local currency to XLM or USDC</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {(['form', 'review', 'payment', 'done'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === s ? 'bg-stellar-500 text-white' :
              ['form', 'review', 'payment', 'done'].indexOf(step) > i ? 'bg-stellar-500/30 text-stellar-400' :
              'bg-slate-800 text-slate-500'
            }`}>{i + 1}</div>
            {i < 3 && <div className="h-px w-6 bg-slate-800" />}
          </div>
        ))}
        <span className="ml-2 text-xs text-slate-500 capitalize">{step}</span>
      </div>

      {/* STEP 1: Form */}
      {step === 'form' && (
        <div className="card space-y-5">
          <div>
            <label className="label">You pay</label>
            <div className="flex gap-2">
              <input
                type="number"
                className="input"
                placeholder="0.00"
                value={fiatAmount}
                onChange={(e) => setFiatAmount(e.target.value)}
                min="1"
              />
              <select
                className="input w-28"
                value={fiatCurrency}
                onChange={(e) => setFiatCurrency(e.target.value)}
              >
                {(config?.supportedCurrencies ?? ['NGN', 'KES', 'GHS', 'USD']).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">You receive</label>
            <div className="flex gap-2">
              {(['XLM', 'USDC'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAsset(a)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-colors ${
                    asset === a
                      ? 'bg-stellar-500/10 border-stellar-500 text-stellar-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/50 rounded-xl p-3">
            <Info size={13} />
            <span>1.5% platform fee · ~$0.00001 Stellar network fee · ~5 sec settlement</span>
          </div>

          <button onClick={handleGetQuote} disabled={loading || !fiatAmount} className="btn-primary flex items-center justify-center gap-2">
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Get Quote
          </button>
        </div>
      )}

      {/* STEP 2: Review */}
      {step === 'review' && quote && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-lg">Review your order</h2>

          <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
            <Row label="You pay" value={`${symbol}${quote.fiatAmount.toLocaleString()} ${quote.fiatCurrency}`} />
            <Row label="Platform fee (1.5%)" value={`${symbol}${quote.fee.toFixed(2)}`} muted />
            <Row label="Network fee" value={`${quote.networkFee} XLM`} muted />
            <div className="border-t border-slate-700 pt-3">
              <Row
                label="You receive"
                value={`${parseFloat(quote.assetAmount).toFixed(4)} ${quote.asset}`}
                highlight
              />
            </div>
            <Row label="Rate" value={`1 ${quote.asset} = ${symbol}${quote.rate.toLocaleString()}`} muted />
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Info size={12} />
            Quote expires in 5 minutes
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('form')} className="btn-secondary flex-1">Back</button>
            <button onClick={handleConfirm} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <RefreshCw size={16} className="animate-spin" /> : null}
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Payment instructions */}
      {step === 'payment' && intent && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Complete payment</h2>
            <StatusBadge status={intent.status} />
          </div>

          {intent.paymentInstructions && (
            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">
                {intent.paymentInstructions.method.replace('_', ' ')} Instructions
              </p>
              {Object.entries(intent.paymentInstructions.details).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-mono text-slate-200">{v}</span>
                    <button
                      onClick={() => copyToClipboard(v, k)}
                      className="text-slate-500 hover:text-stellar-400 transition-colors"
                    >
                      {copied === k ? <CheckCircle2 size={13} className="text-green-400" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-slate-500 bg-slate-800/50 rounded-xl p-3">
            Once payment is confirmed, your {intent.asset} will be sent to your wallet automatically.
          </div>

          {/* Dev mode: simulate payment */}
          {import.meta.env.DEV && (
            <button
              onClick={handleSimulatePay}
              disabled={loading}
              className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : null}
              🧪 Simulate Payment (Dev)
            </button>
          )}
        </div>
      )}

      {/* STEP 4: Done */}
      {step === 'done' && intent && (
        <div className="card text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mx-auto">
            <CheckCircle2 className="text-green-400" size={36} />
          </div>
          <h2 className="text-xl font-bold">Payment Complete!</h2>
          <p className="text-slate-400 text-sm">
            <span className="text-white font-semibold">{parseFloat(intent.assetAmount).toFixed(4)} {intent.asset}</span>{' '}
            has been sent to your wallet.
          </p>

          {liveIntent?.id && (
            <div className="bg-slate-800/50 rounded-xl p-3 text-sm">
              <span className="text-slate-400">Transaction: </span>
              <TxLink hash={liveIntent.id} />
            </div>
          )}

          <button onClick={reset} className="btn-primary">Make another payment</button>
        </div>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  muted,
  highlight,
}: {
  label: string
  value: string
  muted?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${muted ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-stellar-400 text-base font-bold' : 'text-slate-200'}`}>
        {value}
      </span>
    </div>
  )
}
