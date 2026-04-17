import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router';
import {XDSLinkProvider} from '@xds/core/Link';
import '@xds/core/reset.css';
import '@xds/core/xds.css';
import '@xds/theme-default/theme.css';
import '@xds/theme-neutral/theme.css';
import '@xds/theme-brutalist/theme.css';
import '@xds/theme-meta/theme.css';
import './app/globals.css';
import {Providers} from './app/providers';
import {AppRoutes} from './routes';
import {Link} from './Link';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basePath}>
      <XDSLinkProvider component={Link}>
        <Providers>
          <AppRoutes />
        </Providers>
      </XDSLinkProvider>
    </BrowserRouter>
  </StrictMode>,
);
