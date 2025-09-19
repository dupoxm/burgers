import React from 'react';
    import ReactDOM from 'react-dom/client';
    import { BrowserRouter } from 'react-router-dom';
    import App from '@/App';
    import '@/index.css';
    import { AppProvider } from '@/contexts/AppContext';
    import { Toaster } from '@/components/ui/toaster';

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <BrowserRouter>
          <AppProvider>
            <App />
            <Toaster />
          </AppProvider>
        </BrowserRouter>
      </React.StrictMode>
    );