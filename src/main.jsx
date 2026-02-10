import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import './index.css';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
