import { useEffect } from 'react'
import './App.css'
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import FocusView from './views/FocusView'
import CalendarView from './views/CalendarView'
import AnalyticsView from './views/AnalyticsView'
import CoachView from './views/CoachView'
import SettingsView from './views/SettingsView'
import { seedIfEmpty } from './db'
import { useReminders } from './hooks/useReminders'
import LoadingOverlay from './components/LoadingOverlay'
import { useI18n } from './i18n/i18n'
import HeaderParticles from './components/HeaderParticles'
import KawaiiStickers from './components/KawaiiStickers'
import ConfettiLayer from './components/ConfettiLayer'
import AmbientSound from './components/AmbientSound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  useEffect(() => { seedIfEmpty() }, [])
  useReminders()
  const { t, lang, setLang } = useI18n()
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div style={{ padding: 16 }}>
        <LoadingOverlay />
        <ConfettiLayer />
        <header style={{ position: 'relative', display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'linear-gradient(135deg, #1a0b22, #2a0e33)' }}>
          <HeaderParticles />
          <h1 style={{ margin: 0, fontSize: 20 }}>{t('app.title')}</h1>
          <nav style={{ display: 'flex', gap: 10 }}>
            <NavLink to="/" end style={({ isActive }) => ({
              padding: '6px 10px', borderRadius: 8, textDecoration: 'none',
              color: isActive ? '#0f172a' : '#e6e6e6', background: isActive ? '#8ab4ff' : 'transparent',
              border: '1px solid #333'
            })}>{t('nav.focus')}</NavLink>
            <NavLink to="/calendar" style={({ isActive }) => ({
              padding: '6px 10px', borderRadius: 8, textDecoration: 'none',
              color: isActive ? '#0f172a' : '#e6e6e6', background: isActive ? '#8ab4ff' : 'transparent',
              border: '1px solid #333'
            })}>{t('nav.calendar')}</NavLink>
            <NavLink to="/analytics" style={({ isActive }) => ({
              padding: '6px 10px', borderRadius: 8, textDecoration: 'none',
              color: isActive ? '#0f172a' : '#e6e6e6', background: isActive ? '#8ab4ff' : 'transparent',
              border: '1px solid #333'
            })}>{t('nav.analytics')}</NavLink>
            <NavLink to="/coach" style={({ isActive }) => ({
              padding: '6px 10px', borderRadius: 8, textDecoration: 'none',
              color: isActive ? '#0f172a' : '#e6e6e6', background: isActive ? '#8ab4ff' : 'transparent',
              border: '1px solid #333'
            })}>{t('nav.coach')}</NavLink>
            <NavLink to="/settings" style={({ isActive }) => ({
              padding: '6px 10px', borderRadius: 8, textDecoration: 'none',
              color: isActive ? '#0f172a' : '#e6e6e6', background: isActive ? '#8ab4ff' : 'transparent',
              border: '1px solid #333'
            })}>Settings</NavLink>
          </nav>
          <div>
            <select value={lang} onChange={(e) => setLang(e.target.value as any)} style={{ borderRadius: 8, border: '1px solid #333', background: '#101014', color: '#e6e6e6', padding: '6px 10px' }}>
              <option value="vi">VI</option>
              <option value="en">EN</option>
            </select>
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
              <AmbientSound />
            </div>
          </div>
        </header>
        <KawaiiStickers />
        <main style={{ marginTop: 16 }}>
          <Routes>
            <Route path="/" element={<FocusView />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path="/coach" element={<CoachView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
