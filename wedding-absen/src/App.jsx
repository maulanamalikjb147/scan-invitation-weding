import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Scanner from './pages/Scanner'
import Admin from './pages/Admin'
import BulkInvitations from './pages/BulkInvitations'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Scanner />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/bulk-invitations" element={<BulkInvitations />} />
      </Routes>
    </Router>
  )
}

export default App
