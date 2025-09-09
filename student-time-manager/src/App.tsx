import { useEffect } from 'react'
import './App.css'
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import FocusView from './views/FocusView'
import CalendarView from './views/CalendarView'
import AnalyticsView from './views/AnalyticsView'
import { seedIfEmpty } from './db'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  useEffect(() => { seedIfEmpty() }, [])
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div style={{ padding: 16 }}>
        <header style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Student Time Manager</h1>
          <nav style={{ display: 'flex', gap: 10 }}>
            <NavLink to="/" end style={({ isActive }) => ({
              padding: '6px 10px', borderRadius: 8, textDecoration: 'none',
              color: isActive ? '#0f172a' : '#e6e6e6', background: isActive ? '#8ab4ff' : 'transparent',
              border: '1px solid #333'
            })}>Focus</NavLink>
            <NavLink to="/calendar" style={({ isActive }) => ({
              padding: '6px 10px', borderRadius: 8, textDecoration: 'none',
              color: isActive ? '#0f172a' : '#e6e6e6', background: isActive ? '#8ab4ff' : 'transparent',
              border: '1px solid #333'
            })}>Calendar</NavLink>
            <NavLink to="/analytics" style={({ isActive }) => ({
              padding: '6px 10px', borderRadius: 8, textDecoration: 'none',
              color: isActive ? '#0f172a' : '#e6e6e6', background: isActive ? '#8ab4ff' : 'transparent',
              border: '1px solid #333'
            })}>Analytics</NavLink>
          </nav>
        </header>
        <main style={{ marginTop: 16 }}>
          <Routes>
            <Route path="/" element={<FocusView />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
