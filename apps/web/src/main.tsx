import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AppModeProvider } from './providers/AppModeProvider';
import { SiteConfigProvider } from './providers/SiteConfigProvider';
import { AuthProvider } from './providers/AuthProvider';
import './index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppModeProvider>
          <SiteConfigProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </SiteConfigProvider>
        </AppModeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
