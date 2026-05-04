import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import OnrampPage from './pages/OnrampPage'
import DashboardPage from './pages/DashboardPage'
import ConnectPage from './pages/ConnectPage'
import { useWalletStore } from './store/walletStore'

export default function App() {
  const { address } = useWalletStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={address ? <Navigate to="/onramp" replace /> : <ConnectPage />} />
          <Route path="onramp" element={address ? <OnrampPage /> : <Navigate to="/" replace />} />
          <Route path="dashboard" element={address ? <DashboardPage /> : <Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
