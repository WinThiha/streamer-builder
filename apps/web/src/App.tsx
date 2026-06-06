import { Navigate, Route, Routes } from 'react-router-dom';
import { SubscriberShell } from './layouts/SubscriberShell';
import { AdminShell } from './layouts/AdminShell';
import { SetupGate, AdminAuthGate } from './components/RouteGuards';
import { About } from './pages/About';
import { Home } from './pages/Home';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { PlayPage } from './pages/PlayPage';
import { SearchPage } from './pages/SearchPage';
import { TvDetailPage } from './pages/TvDetailPage';
import { SetupPage } from './pages/SetupPage';
import { BrandingPage } from './pages/admin/BrandingPage';
import { HomepagePage } from './pages/admin/HomepagePage';
import { PreviewPage } from './pages/admin/PreviewPage';
import { SourcesPage } from './pages/admin/SourcesPage';
import { LoginPage } from './pages/admin/LoginPage';

export function App() {
  return (
    <SetupGate>
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
        <Route element={<SubscriberShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/tv/:id" element={<TvDetailPage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/about" element={<About />} />
        </Route>
        <Route path="/admin" element={<AdminAuthGate />}>
          <Route path="login" element={<LoginPage />} />
          <Route element={<AdminShell />}>
            <Route index element={<Navigate to="/admin/branding" replace />} />
            <Route path="branding" element={<BrandingPage />} />
            <Route path="homepage" element={<HomepagePage />} />
            <Route path="preview" element={<PreviewPage />} />
            <Route path="sources" element={<SourcesPage />} />
          </Route>
        </Route>
      </Routes>
    </SetupGate>
  );
}
