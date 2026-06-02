import { Link, Route, Routes } from 'react-router-dom';
import { About } from './pages/About';
import { Home } from './pages/Home';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { PlayPage } from './pages/PlayPage';
import { SearchPage } from './pages/SearchPage';
import { TvDetailPage } from './pages/TvDetailPage';

export function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-800">
        <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4 text-sm">
          <Link to="/" className="font-semibold text-[var(--color-foreground)]">
            Movie Streamer
          </Link>
          <Link to="/search" className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
            Search
          </Link>
          <Link to="/about" className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
            About
          </Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/tv/:id" element={<TvDetailPage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}
