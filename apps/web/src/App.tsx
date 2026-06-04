import { Navigate, Route, Routes } from 'react-router-dom';
import { SubscriberShell } from './layouts/SubscriberShell';
import { AdminShell } from './layouts/AdminShell';
import { About } from './pages/About';
import { Home } from './pages/Home';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { PlayPage } from './pages/PlayPage';
import { SearchPage } from './pages/SearchPage';
import { TvDetailPage } from './pages/TvDetailPage';
import { BrandingPage } from './pages/admin/BrandingPage';
import { HomepagePage } from './pages/admin/HomepagePage';
import { PreviewPage } from './pages/admin/PreviewPage';

export function App() {
  return (
    <Routes>
      <Route element={<SubscriberShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/tv/:id" element={<TvDetailPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/about" element={<About />} />
      </Route>
      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<Navigate to="/admin/branding" replace />} />
        <Route path="branding" element={<BrandingPage />} />
        <Route path="homepage" element={<HomepagePage />} />
        <Route path="preview" element={<PreviewPage />} />
      </Route>
    </Routes>
  );
}
