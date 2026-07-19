import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { StoreProvider } from './context/StoreContext'
import { ToastProvider } from './context/ToastContext'
import { TimerProvider } from './context/TimerContext'
import RequireAccess from './components/RequireAccess'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Academics from './pages/Academics'
import Exams from './pages/Exams'
import Portfolio from './pages/Portfolio'
import CollegePrep from './pages/CollegePrep'
import CalendarPage from './pages/Calendar'
import SettingsPage from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <ToastProvider>
          <TimerProvider>
            <HashRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  element={
                    <RequireAccess>
                      <Layout />
                    </RequireAccess>
                  }
                >
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/academics" element={<Academics />} />
                  <Route path="/exams" element={<Exams />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/college-prep" element={<CollegePrep />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
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
