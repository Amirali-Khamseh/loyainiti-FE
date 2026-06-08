import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

// Fonts (self-hosted, loaded at runtime). Roboto across the whole app.
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Design tokens - drives every component via CSS custom properties
import './design-system/tokens.css';
import './styles/app.css';

import { router } from './routes';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/Toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>,
);
