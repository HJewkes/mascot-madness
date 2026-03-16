import { Routes, Route, Navigate } from 'react-router-dom'
import BracketPage from './pages/bracket/BracketPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BracketPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
