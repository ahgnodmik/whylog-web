import { HashRouter, NavLink, Route, Routes } from 'react-router-dom'
import { S } from './i18n'
import { ToastProvider } from './toast'
import ListPage from './pages/ListPage'
import EditPage from './pages/EditPage'
import DetailPage from './pages/DetailPage'
import ReviewPage from './pages/ReviewPage'
import InsightsPage from './pages/InsightsPage'
import DataPage from './pages/DataPage'
import SharePage from './pages/SharePage'

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <header className="topbar">
          <div className="topbar-inner">
            <NavLink to="/" className="brand">
              WhyLog
            </NavLink>
            <nav>
              <NavLink to="/" end>
                {S.filterAll}
              </NavLink>
              <NavLink to="/insights">{S.insights}</NavLink>
              <NavLink to="/data">{S.settings}</NavLink>
            </nav>
          </div>
        </header>
        <main className="container">
          <Routes>
            <Route path="/" element={<ListPage />} />
            <Route path="/new" element={<EditPage />} />
            <Route path="/decision/:id" element={<DetailPage />} />
            <Route path="/decision/:id/edit" element={<EditPage />} />
            <Route path="/decision/:id/review" element={<ReviewPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/s/:data" element={<SharePage />} />
          </Routes>
        </main>
      </ToastProvider>
    </HashRouter>
  )
}
