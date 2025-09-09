import { useEffect } from 'react'
import './App.css'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
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
            <Link to="/">Focus</Link>
            <Link to="/calendar">Calendar</Link>
            <Link to="/analytics">Analytics</Link>
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
