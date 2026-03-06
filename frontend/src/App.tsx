/**
 * RouteOps – Vehicle Routing Optimizer.
 * Root: React Router only. MantineProvider + Notifications live in main.tsx.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { Dashboard } from '@/pages/Dashboard'
import '@/styles/global.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}