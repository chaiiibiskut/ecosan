import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/MainLayout'
import { LiveOperations } from './pages/LiveOperations'
import { AISegregationHub } from './pages/AISegregationHub'
import { FleetLogistics } from './pages/FleetLogistics'
import { SanitizationIndex } from './pages/SanitizationIndex'
import { Analytics } from './pages/Analytics'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/live-operations" replace />} />
        <Route element={<MainLayout />}>
          <Route path="live-operations" element={<LiveOperations />} />
          <Route path="ai-segregation-hub" element={<AISegregationHub />} />
          <Route path="fleet-logistics" element={<FleetLogistics />} />
          <Route path="sanitization-index" element={<SanitizationIndex />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
        <Route path="*" element={<Navigate to="/live-operations" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App