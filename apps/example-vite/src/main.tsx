import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@xds/core/reset.css';
import '@xds/core/typography.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
