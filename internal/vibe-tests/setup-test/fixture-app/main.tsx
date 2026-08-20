import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './app/globals.css';
import RunsPage from './app/page';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RunsPage />
  </StrictMode>,
);
