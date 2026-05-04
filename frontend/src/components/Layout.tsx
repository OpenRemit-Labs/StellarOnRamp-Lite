import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Zap, LayoutDashboard, LogOut, Wallet } from 'lucide-react'
import { useWalletStore } from '../store/walletStore'

export default function Layout() {
  const { address, disconnect } = useWalletStore()
  const navigate = useNavigate()

  const handleDisconnect = () => {
    disconnect()
    navigate('/')
  }

  const short = address ? `${address.slice(0, 4)}…${address.slice(-4)}` : null

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-lg">
            <Zap className="text-stellar-500" size={22} />
            <span>StellarOnRamp</span>
            <span className="text-xs font-normal text-slate-500 ml-1">Lite</span>
          </NavLink>

          {address && (
            <nav className="flex items-center gap-1">
              <NavLink
                to="/onramp"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-stellar-500/10 text-stellar-400' : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Zap size={15} /> Buy
              </NavLink>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-stellar-500/10 text-stellar-400' : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <LayoutDashboard size={15} /> Dashboard
              </NavLink>
              <div className="ml-2 flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5 text-sm">
                <Wallet size={14} className="text-stellar-400" />
                <span className="text-slate-300 font-mono">{short}</span>
                <button onClick={handleDisconnect} className="text-slate-500 hover:text-red-400 transition-colors ml-1">
                  <LogOut size={14} />
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-600">
        StellarOnRamp Lite · Open Source · MIT License ·{' '}
        <a href="https://stellar.org" target="_blank" rel="noreferrer" className="hover:text-stellar-400">
          Built on Stellar
        </a>
      </footer>
    </div>
  )
}
