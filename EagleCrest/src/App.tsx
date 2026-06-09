import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import { Layout } from './components/Layout/Layout'
import Landing from './pages/Landing'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import Transactions from './pages/Transactions'
import Transfer from './pages/Transfer'
import Cards from './pages/Cards'
import Analytics from './pages/Analytics'
import Savings from './pages/Savings'
import Loans from './pages/Loans'
import Settings from './pages/Settings'

// Smart root: landing page when logged out, redirect to /home when logged in
const SmartRoot = () => {
  const { token, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-base">
        <i className="ti ti-loader-2 animate-spin text-gold text-2xl" aria-hidden="true" />
      </div>
    )
  }
  if (token) return <Navigate to="/home" replace />
  return <Landing />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* smart root */}
        <Route path="/" element={<SmartRoot />} />

        {/* public auth pages */}
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />

        {/* protected app */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
