import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Wallet, KeyRound, AlertCircle } from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import { connectFreighter, isFreighterInstalled } from '../lib/freighter'
import toast from 'react-hot-toast'

const STELLAR_ADDRESS_REGEX = /^G[A-Z2-7]{55}$/

export default function ConnectPage() {
  const { setWallet } = useWalletStore()
  const navigate = useNavigate()
  const [manualAddress, setManualAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'choose' | 'manual'>('choose')

  const handleFreighter = async () => {
    setLoading(true)
    try {
      const installed = await isFreighterInstalled()
      if (!installed) {
        toast.error('Freighter not installed. Get it at freighter.app')
        return
      }
      const address = await connectFreighter()
      setWallet(address, 'freighter')
      navigate('/onramp')
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleManual = () => {
    if (!STELLAR_ADDRESS_REGEX.test(manualAddress)) {
      toast.error('Invalid Stellar address')
      return
    }
    setWallet(manualAddress, 'manual')
    navigate('/onramp')
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-stellar-500/10 rounded-2xl mb-4">
          <Zap className="text-stellar-400" size={32} />
        </div>
        <h1 className="text-3xl font-bold mb-2">StellarOnRamp Lite</h1>
        <p className="text-slate-400 text-base leading-relaxed">
          Convert local currency to XLM or USDC on Stellar.<br />
          Fast. Cheap. Simple.
        </p>
      </div>

      {/* Value props */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: '~5 sec', sub: 'Settlement' },
          { label: '<$0.01', sub: 'Network fee' },
          { label: '150+', sub: 'Countries' },
        ].map((v) => (
          <div key={v.label} className="card text-center py-4">
            <div className="text-xl font-bold text-stellar-400">{v.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{v.sub}</div>
          </div>
        ))}
      </div>

      {/* Connect */}
      <div className="card">
        <h2 className="font-semibold text-lg mb-4">Connect your wallet</h2>

        {mode === 'choose' && (
          <div className="space-y-3">
            <button onClick={handleFreighter} disabled={loading} className="btn-primary flex items-center justify-center gap-2">
              <Wallet size={18} />
              {loading ? 'Connecting…' : 'Connect with Freighter'}
            </button>
            <button onClick={() => setMode('manual')} className="btn-secondary w-full flex items-center justify-center gap-2">
              <KeyRound size={16} />
              Enter address manually
            </button>
          </div>
        )}

        {mode === 'manual' && (
          <div className="space-y-3">
            <div>
              <label className="label">Stellar Address (G…)</label>
              <input
                className="input font-mono text-sm"
                placeholder="GABC…XYZ"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value.trim())}
              />
            </div>
            <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <AlertCircle size={15} className="text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-300">
                Read-only mode. Transactions will require Freighter to sign.
              </p>
            </div>
            <button onClick={handleManual} className="btn-primary">Continue</button>
            <button onClick={() => setMode('choose')} className="btn-secondary w-full">Back</button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-slate-600 mt-4">
        Non-custodial · Open source · MIT License
      </p>
    </div>
  )
}
