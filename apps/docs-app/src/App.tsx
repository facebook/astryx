import { useEffect, useState } from 'react';
import { ADRViewer, EvidencePanel, MetricsCard, ResearchCallout, TokenViewer } from '@jedi/docs';
import { DocLayout, SideNav } from '@jedi/patterns';
import { Heading, Text } from '@jedi/react';
import { defaultTheme } from '@jedi/themes';
import { Stack } from '@jedi/foundation';

const NAV = [
  { id: 'overview', label: 'Overview' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'adr', label: 'ADRs' },
];

export function App() {
  const [active, setActive] = useState('overview');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = defaultTheme.toStyleTag('light');
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <DocLayout
      title="JEDI Platform"
      sidebar={<SideNav items={NAV.map((n) => ({ ...n, active: n.id === active }))} onSelect={setActive} />}
    >
      <Stack spacing={6}>
        {active === 'overview' && (
          <>
            <Heading level={1}>JEDI Foundation Program</Heading>
            <ResearchCallout title="Design Language ≠ Design System" variant="insight">
              Tokens express the design language. Components express the design system.
            </ResearchCallout>
            <MetricsCard label="Packages" value={10} delta="+10 capabilities" trend="up" />
          </>
        )}
        {active === 'tokens' && <TokenViewer mode="light" />}
        {active === 'evidence' && (
          <EvidencePanel
            claim="JEDI achieves Architectural Independence from Astryx at v0.2"
            source="JEDI Foundation Program — sync-strategy.md"
            confidence="high"
          />
        )}
        {active === 'adr' && (
          <ADRViewer
            id="ADR-001"
            title="Token Architecture"
            status="Accepted"
            date="2026-07-04"
            decision="Three-tier token model: core → semantic → component"
          />
        )}
        <Text variant="caption">JEDI v0.3 — Documentation System</Text>
      </Stack>
    </DocLayout>
  );
}
