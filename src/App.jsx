import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { StoreProvider } from './context/StoreContext'
import { ToastProvider } from './context/ToastContext'
import { TimerProvider } from './context/TimerContext'
import RequireAccess from './components/RequireAccess'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Academics from './pages/Academics'
import Portfolio from './pages/Portfolio'
import CollegePath from './pages/CollegePath'
import GrowthJourney from './pages/GrowthJourney'
import SettingsPage from './pages/Settings'
import PublicPortfolio from './pages/PublicPortfolio'

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <ToastProvider>
          <TimerProvider>
            <HashRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/p/:slug" element={<PublicPortfolio />} />
                <Route
                  element={
                    <RequireAccess>
                      <Layout />
                    </RequireAccess>
                  }
                >
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/growth-journey" element={<GrowthJourney />} />
                  <Route path="/academics" element={<Academics />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/college-path" element={<CollegePath />} />
                  <Route path="/settings" element={<SettingsPage />} />

                  {/* Redirects from the pre-reorganization sidebar, so old
                      bookmarks and muscle memory still land somewhere real. */}
                  <Route path="/north-star" element={<Navigate to="/growth-journey?tab=identity" replace />} />
                  <Route path="/growth" element={<Navigate to="/growth-journey?tab=progress" replace />} />
                  <Route path="/story" element={<Navigate to="/growth-journey?tab=story" replace />} />
                  <Route path="/evidence" element={<Navigate to="/portfolio?tab=evidence" replace />} />
                  <Route path="/exams" element={<Navigate to="/academics?tab=exams" replace />} />
                  <Route path="/calendar" element={<Navigate to="/academics?tab=calendar" replace />} />
                  <Route path="/college-prep" element={<Navigate to="/college-path" replace />} />
                  <Route path="/momentum" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </HashRouter>
          </TimerProvider>
        </ToastProvider>
      </StoreProvider>
    </AuthProvider>
  )
}

export default App
