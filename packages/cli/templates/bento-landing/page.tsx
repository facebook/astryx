'use client';

import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDivider} from '@xds/core/Divider';

function BentoCard({children, style, accent}: {children: React.ReactNode; style?: React.CSSProperties; accent?: boolean;}) {
  return (
    <div style={{backgroundColor: accent ? 'var(--color-background-blue)' : 'var(--color-background-card)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 'var(--card-radius, 12px)', padding: 24, height: '100%', boxSizing: 'border-box' as const, overflow: 'hidden', ...style}}>
      {children}
    </div>
  );
}

function Stat({value, label}: {value: string; label: string}) {
  return (<XDSVStack gap={0.5}><XDSHeading size='xlarge'>{value}</XDSHeading><XDSText type='base' color='secondary'>{label}</XDSText></XDSVStack>);
}

const AVATAR_COLORS = ['var(--color-background-blue)', 'var(--color-background-green)', 'var(--color-background-pink)', 'var(--color-background-orange)'];
const INITIALS = ['JL', 'MK', 'SP', 'TR'];

function AvatarCluster() {
  return (
    <XDSHStack gap={2} align='center'>
      <div style={{display: 'flex'}}>
        {INITIALS.map((init, i) => (
          <div key={init} style={{width: 32, height: 32, borderRadius: '50%', backgroundColor: AVATAR_COLORS[i], border: '2px solid var(--color-background-surface)', marginLeft: i === 0 ? 0 : -10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--color-text-primary)', position: 'relative' as const, zIndex: INITIALS.length - i}}>
            {init}
          </div>
        ))}
      </div>
      <XDSText type='small' color='secondary'>Trusted by <strong>12,000+</strong> teams</XDSText>
    </XDSHStack>
  );
}

const BAR_HEIGHTS = [35, 55, 42, 70, 60, 85, 65, 95, 78, 100, 88, 72];

function MiniBarChart() {
  return (
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 4, height: 64, marginTop: 16}}>
      {BAR_HEIGHTS.map((h, i) => (<div key={i} style={{flex: 1, height: `${h}%`, borderRadius: '3px 3px 0 0', backgroundColor: i === BAR_HEIGHTS.length - 1 ? 'var(--color-icon-accent)' : 'var(--color-background-blue)', opacity: i === BAR_HEIGHTS.length - 1 ? 1 : 0.5 + i * 0.04}} />))}
    </div>
  );
}

function FeatureRow({icon, label}: {icon: string; label: string}) {
  return (
    <XDSHStack gap={2} align='center'>
      <div style={{width: 32, height: 32, borderRadius: 8, backgroundColor: 'var(--color-background-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0}}>{icon}</div>
      <XDSText type='base'>{label}</XDSText>
    </XDSHStack>
  );
}

function IntegrationBubble({label}: {label: string}) {
  return (<div style={{padding: '6px 14px', borderRadius: 100, backgroundColor: 'var(--color-background-muted)', border: '1px solid rgba(0,0,0,0.08)', display: 'inline-flex', alignItems: 'center'}}><XDSText type='small' weight='medium'>{label}</XDSText></div>);
}

export default function BentoLandingPage() {
  return (
    <div style={{minHeight: '100vh', backgroundColor: 'var(--color-background-body)', padding: '48px 24px', boxSizing: 'border-box' as const}}>
      <div style={{maxWidth: 1100, margin: '0 auto'}}>

        {/* Nav */}
        <XDSHStack align='center' justify='space-between' gap={4} style={{marginBottom: 56}}>
          <XDSText type='large' weight='bold'>Orbit</XDSText>
          <XDSHStack gap={3} align='center'>
            <XDSText type='base' color='secondary'>Features</XDSText>
            <XDSText type='base' color='secondary'>Pricing</XDSText>
            <XDSText type='base' color='secondary'>Docs</XDSText>
            <XDSButton label='Get started' variant='primary' size='small' />
          </XDSHStack>
        </XDSHStack>

        {/* Hero */}
        <XDSVStack gap={3} align='center' style={{textAlign: 'center', marginBottom: 48}}>
          <XDSBadge label='Now in public beta' variant='blue' />
          <XDSHeading size='xxlarge'>Analytics that move you forward</XDSHeading>
          <XDSText type='large' color='secondary' style={{maxWidth: 480}}>Orbit turns raw product data into decisions. Real-time dashboards, smart alerts, and AI insights — all in one place.</XDSText>
          <XDSHStack gap={2}>
            <XDSButton label='Start for free' variant='primary' />
            <XDSButton label='Watch demo' variant='secondary' />
          </XDSHStack>
          <AvatarCluster />
        </XDSVStack>

        {/* Bento grid */}
        <XDSGrid columns={4} gap={3}>

          {/* Revenue card — 2 cols */}
          <XDSGridSpan columns={2}><BentoCard accent><XDSVStack gap={2} style={{height: '100%'}}>
            <XDSText type='small' weight='medium' color='secondary'>Monthly Revenue</XDSText>
            <XDSHeading size='xxlarge' color='accent'>$84.2K</XDSHeading>
            <XDSHStack gap={1} align='center'><XDSBadge label='18.4%' variant='green' /><XDSText type='small' color='secondary'>vs last month</XDSText></XDSHStack>
            <MiniBarChart />
          </XDSVStack></BentoCard></XDSGridSpan>

          {/* Features list — 2 cols */}
          <XDSGridSpan columns={2}><BentoCard><XDSVStack gap={3}>
            <XDSText type='base' weight='semibold'>Everything you need</XDSText>
            <FeatureRow icon='📊' label='Real-time dashboards' />
            <XDSDivider />
            <FeatureRow icon='⚡' label='Smart alerts' />
            <XDSDivider />
            <FeatureRow icon='🤖' label='AI-powered insights' />
            <XDSDivider />
            <FeatureRow icon='🔗' label='One-click integrations' />
          </XDSVStack></BentoCard></XDSGridSpan>

          {/* Active users — 1 col */}
          <XDSGridSpan columns={1}><BentoCard><XDSVStack gap={1}>
            <XDSText type='small' color='secondary'>Active users</XDSText>
            <XDSHeading size='xlarge'>12,409</XDSHeading>
            <XDSBadge label='6.2% this week' variant='green' />
          </XDSVStack></BentoCard></XDSGridSpan>

          {/* Churn — 1 col */}
          <XDSGridSpan columns={1}><BentoCard><XDSVStack gap={1}>
            <XDSText type='small' color='secondary'>Churn rate</XDSText>
            <XDSHeading size='xlarge'>1.8%</XDSHeading>
            <XDSBadge label='0.4% improved' variant='green' />
          </XDSVStack></BentoCard></XDSGridSpan>

          {/* Integrations — 2 cols */}
          <XDSGridSpan columns={2}><BentoCard><XDSVStack gap={3}>
            <XDSText type='base' weight='semibold'>Connect your stack</XDSText>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
              {['Stripe', 'Segment', 'Mixpanel', 'Postgres', 'BigQuery', 'Slack', 'Linear', 'Notion'].map(name => <IntegrationBubble key={name} label={name} />)}
            </div>
          </XDSVStack></BentoCard></XDSGridSpan>

          {/* Testimonial — full row */}
          <XDSGridSpan columns='full'><BentoCard>
            <XDSHStack gap={6} align='center'>
              <div style={{width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--color-background-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0}}>JL</div>
              <XDSVStack gap={1}>
                <XDSText type='base' style={{fontStyle: 'italic'}}>We replaced three separate tools with Orbit and our team&apos;s time-to-insight went from days to minutes. The AI summaries alone save us hours each week.</XDSText>
                <XDSHStack gap={2} align='center'>
                  <XDSText type='small' weight='semibold'>Jamie Liu</XDSText>
                  <XDSText type='small' color='secondary'>Head of Product, Finch</XDSText>
                </XDSHStack>
              </XDSVStack>
            </XDSHStack>
          </BentoCard></XDSGridSpan>

          {/* Stat cards */}
          <XDSGridSpan columns={1}><BentoCard><Stat value='4,200+' label='Teams on Orbit' /></BentoCard></XDSGridSpan>
          <XDSGridSpan columns={1}><BentoCard><Stat value='99.9%' label='Uptime SLA' /></BentoCard></XDSGridSpan>
          <XDSGridSpan columns={1}><BentoCard><Stat value='2s' label='Avg query time' /></BentoCard></XDSGridSpan>
          <XDSGridSpan columns={1}><BentoCard><Stat value='SOC 2' label='Type II certified' /></BentoCard></XDSGridSpan>

          {/* CTA — full row */}
          <XDSGridSpan columns='full'><BentoCard accent>
            <XDSVStack gap={3} align='center' style={{textAlign: 'center', padding: '16px 0'}}>
              <XDSHeading size='xlarge'>Ready to see what your data is telling you?</XDSHeading>
              <XDSText type='large' color='secondary'>Up and running in under 10 minutes. No credit card required.</XDSText>
              <XDSHStack gap={2}>
                <XDSButton label='Start for free' variant='primary' />
                <XDSButton label='Schedule a demo' variant='secondary' />
              </XDSHStack>
            </XDSVStack>
          </BentoCard></XDSGridSpan>

        </XDSGrid>
      </div>
    </div>
  );
}
