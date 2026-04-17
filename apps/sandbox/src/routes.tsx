import {lazy, Suspense} from 'react';
import {Routes, Route, Outlet, useParams, Navigate} from 'react-router';
import {SandboxShell} from './app/SandboxShell';
import {PreviewShell} from './app/(fullscreen)/PreviewShell';

const lazyPage = (load: () => Promise<{default: React.ComponentType}>) => {
  const Component = lazy(load);
  return (
    <Suspense>
      <Component />
    </Suspense>
  );
};

// -- Sandbox layout pages --
const HomePage = () => lazyPage(() => import('./app/(sandbox)/page'));
const TemplatesListPage = () =>
  lazyPage(() => import('./app/(sandbox)/templates/page'));
const ExamplePage = () =>
  lazyPage(() => import('./app/(sandbox)/pages/example/page'));
const NavigationPage = () =>
  lazyPage(() => import('./app/(sandbox)/pages/navigation/page'));
const MegaMenuPage = () =>
  lazyPage(() => import('./app/(sandbox)/pages/mega-menu/page'));
const TopNavMenuPage = () =>
  lazyPage(() => import('./app/(sandbox)/pages/topnav-menu/page'));
const TableOverviewPage = () =>
  lazyPage(() => import('./app/(sandbox)/pages/table-overview/page'));
const PolymorphicLinkPage = () =>
  lazyPage(() => import('./app/(sandbox)/pages/polymorphic-link/page'));
const MediaModePage = () =>
  lazyPage(() => import('./app/(sandbox)/pages/media-mode/page'));

// -- Fullscreen layout pages --
const ThemeEditorPage = () =>
  lazyPage(() => import('./app/(fullscreen)/pages/theme-editor/page'));
const DocsitePage = () =>
  lazyPage(() => import('./app/(fullscreen)/pages/docsite/page'));
const DocHomePage = () =>
  lazyPage(() => import('./app/(fullscreen)/pages/doc-home/page'));
const DocDocsPage = () =>
  lazyPage(() => import('./app/(fullscreen)/pages/doc-docs/page'));
const DocDiscoverPage = () =>
  lazyPage(() => import('./app/(fullscreen)/pages/doc-discover/page'));
const DocumentationPage = () =>
  lazyPage(() => import('./app/(fullscreen)/pages/documentation/page'));
const ExampleCardsPage = () =>
  lazyPage(() => import('./app/(fullscreen)/pages/example-cards/page'));
const ShowcaseComponentsPage = () =>
  lazyPage(
    () => import('./app/(fullscreen)/pages/showcase-components/page'),
  );
const ShowcaseHeaderPage = () =>
  lazyPage(() => import('./app/(fullscreen)/pages/showcase-header/page'));
const DictationLabPage = () =>
  lazyPage(() => import('./app/(fullscreen)/pages/dictation-lab/page'));
const CodeblockPerfPage = () =>
  lazyPage(() => import('./app/(fullscreen)/pages/codeblock-perf/page'));

// -- Raw layout pages --
const ShellLabPage = () =>
  lazyPage(() => import('./app/(raw)/pages/shell-lab/page'));

// -- Dynamic category page --
const LazyCategoryContent = lazy(() =>
  import('./app/(sandbox)/[category]/CategoryContent').then(m => ({
    default: m.CategoryContent,
  })),
);
function CategoryPageWrapper() {
  const {category} = useParams<{category: string}>();
  return (
    <Suspense>
      <LazyCategoryContent slug={category!} />
    </Suspense>
  );
}

// -- Template preview (dynamic slug) --
const LazyTemplateRoute = lazy(
  () => import('./app/(fullscreen)/TemplateRoute'),
);
function TemplatePreviewWrapper() {
  const {slug} = useParams<{slug: string}>();
  return (
    <Suspense>
      <LazyTemplateRoute slug={slug!} />
    </Suspense>
  );
}

function SandboxLayout() {
  return (
    <SandboxShell>
      <Outlet />
    </SandboxShell>
  );
}

function FullscreenLayout() {
  return (
    <PreviewShell>
      <Outlet />
    </PreviewShell>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Sandbox shell layout */}
      <Route element={<SandboxLayout />}>
        <Route index element={<HomePage />} />
        <Route path="templates" element={<TemplatesListPage />} />
        <Route path="pages/example" element={<ExamplePage />} />
        <Route path="pages/navigation" element={<NavigationPage />} />
        <Route path="pages/mega-menu" element={<MegaMenuPage />} />
        <Route path="pages/topnav-menu" element={<TopNavMenuPage />} />
        <Route path="pages/table-overview" element={<TableOverviewPage />} />
        <Route
          path="pages/polymorphic-link"
          element={<PolymorphicLinkPage />}
        />
        <Route path="pages/media-mode" element={<MediaModePage />} />
        <Route path=":category" element={<CategoryPageWrapper />} />
      </Route>

      {/* Fullscreen preview layout */}
      <Route element={<FullscreenLayout />}>
        <Route path="pages/theme-editor" element={<ThemeEditorPage />} />
        <Route path="pages/docsite" element={<DocsitePage />} />
        <Route path="pages/doc-home" element={<DocHomePage />} />
        <Route path="pages/doc-docs" element={<DocDocsPage />} />
        <Route path="pages/doc-discover" element={<DocDiscoverPage />} />
        <Route path="pages/documentation" element={<DocumentationPage />} />
        <Route path="pages/example-cards" element={<ExampleCardsPage />} />
        <Route
          path="pages/showcase-components"
          element={<ShowcaseComponentsPage />}
        />
        <Route
          path="pages/showcase-header"
          element={<ShowcaseHeaderPage />}
        />
        <Route path="pages/dictation-lab" element={<DictationLabPage />} />
        <Route
          path="pages/codeblock-perf"
          element={<CodeblockPerfPage />}
        />
        <Route path="templates/:slug" element={<TemplatePreviewWrapper />} />
      </Route>

      {/* Raw layout (no chrome) */}
      <Route path="pages/shell-lab" element={<ShellLabPage />} />

      {/* Catch-all — redirect unknown paths to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
