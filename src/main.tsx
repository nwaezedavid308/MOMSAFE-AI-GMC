import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure window.fetch can be assigned to without getter-only TypeError
if (typeof window !== 'undefined') {
  try {
    const origFetch = window.fetch || (typeof globalThis !== 'undefined' ? globalThis.fetch : undefined);
    if (origFetch) {
      let currentFetch = origFetch;
      const descriptor = {
        get() {
          return currentFetch;
        },
        set(val: typeof fetch) {
          currentFetch = val;
        },
        configurable: true,
        enumerable: true
      };
      try {
        Object.defineProperty(window, 'fetch', descriptor);
      } catch (e) {
        // ignore
      }
      if (typeof globalThis !== 'undefined') {
        try {
          Object.defineProperty(globalThis, 'fetch', descriptor);
        } catch (e) {
          // ignore
        }
      }
    }
  } catch (e) {
    // ignore
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
