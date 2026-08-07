import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom'
import Scanner from './pages/Scanner'
import Admin from './pages/Admin'
import BulkInvitations from './pages/BulkInvitations'
import { supabase } from './supabaseClient'
import './App.css'

function ProtectedAdminRoute({ children }) {
  const [sessionChecked, setSessionChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setIsLoggedIn(Boolean(session))
      setSessionChecked(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setIsLoggedIn(Boolean(session))
      setSessionChecked(true)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (!sessionChecked) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Memeriksa sesi admin...</div>
  }

  return isLoggedIn ? children : <Navigate to="/admin" replace />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/scan" element={<ProtectedAdminRoute><Scanner /></ProtectedAdminRoute>} />
        <Route path="/admin/bulk-invitations" element={<ProtectedAdminRoute><BulkInvitations /></ProtectedAdminRoute>} />
      </Routes>
    </Router>
  )
}

export default App
