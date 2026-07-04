import { useEffect, useState } from 'react';
import { ADRViewer, EvidencePanel, MetricsCard, ResearchCallout, TokenViewer } from '@jedi/docs';
import { DocLayout, SideNav } from '@jedi/patterns';
import { Badge, Button, Card, Heading, Text } from '@jedi/react';
import { defaultTheme, highContrastTheme, toggleTheme } from '@jedi/themes';
import { Stack } from '@jedi/foundation';

const NAV = [
  { id: 'overview', label: 'Overview' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'components', label: 'Components' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'adrs', label: 'ADRs' },
];

export function App() {
  const [active, setActive] = useState('overview');
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [themeName, setThemeName] = useState<'default' | 'high-contrast'>('default');
  const theme = themeName === 'high-contrast' ? highContrastTheme : defaultTheme;

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'jedi-theme';
    style.textContent = theme.toStyleTag(mode);
    document.head.appendChild(style);
    return () => style.remove();
  }, [mode, themeName, theme]);

  return (
    <DocLayout
      title="JEDI Platform Docs"
      sidebar={<SideNav items={NAV.map((n) => ({ ...n, active: n.id === active }))} onSelect={setActive} />}
    >
      <Stack spacing={6}>
        <Stack spacing={2}>
          <FlexControls
            mode={mode}
            themeName={themeName}
            onToggleMode={() => setMode(toggleTheme())}
            onSetTheme={setThemeName}
          />
        </Stack>

        {active === 'overview' && (
          <>
            <Heading level={1}>JEDI Reference Documentation</Heading>
            <ResearchCallout title="Public API Consumer" variant="insight">
              This app imports only @jedi/docs, @jedi/patterns, @jedi/react, @jedi/foundation, and @jedi/themes.
            </ResearchCallout>
            <MetricsCard label="Packages" value={10} delta="Gate 3 validation" trend="up" />
          </>
        )}
        {active === 'tokens' && <TokenViewer mode={mode} />}
        {active === 'components' && (
          <Card title="Component Gallery" padding={4}>
            <Stack spacing={3}>
              <Badge>Public API</Badge>
              <Text>Button, Badge, Card — consumed via @jedi/react only.</Text>
              <Button variant="primary">Primary Action</Button>
            </Stack>
          </Card>
        )}
        {active === 'evidence' && (
          <EvidencePanel
            claim="Architecture frozen at Gate 1; platform health baselined at Gate 2"
            source="ARCHITECTURE-FREEZE.md, PLATFORM-HEALTH.md"
            confidence="high"
          />
        )}
        {active === 'adrs' && (
          <Stack spacing={4}>
            <ADRViewer id="ADR-000" title="Foundation Program" status="Accepted" date="2026-07-04" decision="Re-founded JEDI as independent platform" />
            <ADRViewer id="ADR-003" title="Design Language Change Policy" status="Accepted" date="2026-07-04" decision="Evolvable during Gate 1; frozen at Architecture Freeze" />
          </Stack>
        )}
        <Text variant="caption">JEDI Gate 3 — Reference Consumer</Text>
      </Stack>
    </DocLayout>
  );
}

function FlexControls({
  mode,
  themeName,
  onToggleMode,
  onSetTheme,
}: {
  mode: 'light' | 'dark';
  themeName: 'default' | 'high-contrast';
  onToggleMode: () => void;
  onSetTheme: (t: 'default' | 'high-contrast') => void;
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Button variant={themeName === 'default' ? 'primary' : 'secondary'} onClick={() => onSetTheme('default')}>
        Default Theme
      </Button>
      <Button variant={themeName === 'high-contrast' ? 'primary' : 'secondary'} onClick={() => onSetTheme('high-contrast')}>
        High Contrast
      </Button>
      <Button variant="secondary" onClick={onToggleMode}>
        {mode === 'light' ? 'Dark' : 'Light'} Mode
      </Button>
    </div>
  );
}
