import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Scanner from './pages/Scanner'
import Admin from './pages/Admin'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Scanner />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  )
}

export default App