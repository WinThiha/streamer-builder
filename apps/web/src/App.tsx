import { Link, Route, Routes } from 'react-router-dom';
import { About } from './pages/About';
import { Home } from './pages/Home';

export function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-800">
        <nav className="mx-auto flex max-w-3xl items-center gap-6 px-6 py-4 text-sm">
          <Link to="/" className="font-semibold text-[var(--color-foreground)]">
            Movie Streamer
          </Link>
          <Link to="/about" className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
            About
          </Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}
