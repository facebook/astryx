'use client';

import {XDSBanner} from '@xds/core/Banner';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTheme} from '@xds/core/theme';
import {XDSLayerProvider} from '@xds/core/Layer';
import {y2kTheme} from '@xds/theme-y2k/built';

type Mode = 'light' | 'dark';

function SemanticBadgeSection() {
  return (
    <div style={{marginBottom: 24}}>
      <h3 style={{fontSize: 13, fontWeight: 600, margin: 0, marginBottom: 12}}>Semantic Badges</h3>
      <XDSHStack gap={2} wrap>
        <XDSBadge variant="success" label="Success" />
        <XDSBadge variant="error" label="Error" />
        <XDSBadge variant="warning" label="Warning" />
        <XDSBadge variant="info" label="Info" />
        <XDSBadge variant="neutral" label="Neutral" />
      </XDSHStack>
    </div>
  );
}

function CategoricalBadgeSection() {
  return (
    <div style={{marginBottom: 24}}>
      <h3 style={{fontSize: 13, fontWeight: 600, margin: 0, marginBottom: 12}}>Categorical Badges</h3>
      <XDSHStack gap={2} wrap>
        <XDSBadge variant="blue" label="Blue" />
        <XDSBadge variant="cyan" label="Cyan" />
        <XDSBadge variant="green" label="Green" />
        <XDSBadge variant="orange" label="Orange" />
        <XDSBadge variant="pink" label="Pink" />
        <XDSBadge variant="purple" label="Purple" />
        <XDSBadge variant="red" label="Red" />
        <XDSBadge variant="teal" label="Teal" />
        <XDSBadge variant="yellow" label="Yellow" />
      </XDSHStack>
    </div>
  );
}

function BannerSection() {
  return (
    <div style={{marginBottom: 24}}>
      <h3 style={{fontSize: 13, fontWeight: 600, margin: 0, marginBottom: 12}}>Banners</h3>
      <XDSVStack gap={2}>
        <XDSBanner status="info" title="Info banner" description="Description text for the info state." />
        <XDSBanner status="success" title="Success banner" description="Description text for the success state." />
        <XDSBanner status="warning" title="Warning banner" description="Description text for the warning state." />
        <XDSBanner status="error" title="Error banner" description="Description text for the error state." />
      </XDSVStack>
    </div>
  );
}

function InputSection() {
  return (
    <div style={{marginBottom: 24}}>
      <h3 style={{fontSize: 13, fontWeight: 600, margin: 0, marginBottom: 12}}>Inputs</h3>
      <XDSVStack gap={3}>
        <XDSTextInput label="Default" placeholder="Placeholder text" value="" onChange={() => {}} />
        <XDSTextInput label="Success" value="Valid input" onChange={() => {}} status={{type: 'success', message: 'Looks good!'}} />
        <XDSTextInput label="Error" value="Invalid input" onChange={() => {}} status={{type: 'error', message: 'This field is required.'}} />
        <XDSTextInput label="Warning" value="Risky value" onChange={() => {}} status={{type: 'warning', message: 'This value may cause issues.'}} />
        <XDSTextInput label="Disabled" value="Cannot edit" onChange={() => {}} isDisabled />
      </XDSVStack>
    </div>
  );
}

function TextRampSection() {
  const base = 14;
  const ratio = 1.25;
  const sizes = {
    h1: (base * ratio ** 4).toFixed(1),
    h2: (base * ratio ** 3).toFixed(1),
    h3: (base * ratio ** 2).toFixed(1),
    h4: (base * ratio ** 1).toFixed(1),
    body: base.toFixed(1),
    supporting: '12.0',
  };
  return (
    <div style={{marginBottom: 24}}>
      <h3 style={{fontSize: 13, fontWeight: 600, margin: 0, marginBottom: 12}}>Text Hierarchy (1.25 scale, 14px base)</h3>
      <XDSVStack gap={2}>
        <XDSHStack gap={2} vAlign="baseline"><XDSHeading level={1}>Heading 1</XDSHeading><XDSText type="supporting" color="secondary">{sizes.h1}px</XDSText></XDSHStack>
        <XDSHStack gap={2} vAlign="baseline"><XDSHeading level={2}>Heading 2</XDSHeading><XDSText type="supporting" color="secondary">{sizes.h2}px</XDSText></XDSHStack>
        <XDSHStack gap={2} vAlign="baseline"><XDSHeading level={3}>Heading 3</XDSHeading><XDSText type="supporting" color="secondary">{sizes.h3}px</XDSText></XDSHStack>
        <XDSHStack gap={2} vAlign="baseline"><XDSHeading level={4}>Heading 4</XDSHeading><XDSText type="supporting" color="secondary">{sizes.h4}px</XDSText></XDSHStack>
        <XDSHStack gap={2} vAlign="baseline"><XDSText type="body">Body — primary</XDSText><XDSText type="supporting" color="secondary">{sizes.body}px</XDSText></XDSHStack>
        <XDSHStack gap={2} vAlign="baseline"><XDSText type="body" color="secondary">Body — secondary</XDSText><XDSText type="supporting" color="secondary">{sizes.body}px</XDSText></XDSHStack>
        <XDSHStack gap={2} vAlign="baseline"><XDSText type="supporting">Supporting</XDSText><XDSText type="supporting" color="secondary">{sizes.supporting}px</XDSText></XDSHStack>
        <XDSHStack gap={2} vAlign="baseline"><XDSText type="body" color="disabled">Disabled</XDSText><XDSText type="supporting" color="secondary">{sizes.body}px</XDSText></XDSHStack>
      </XDSVStack>
    </div>
  );
}

function ButtonSection() {
  return (
    <div style={{marginBottom: 24}}>
      <h3 style={{fontSize: 13, fontWeight: 600, margin: 0, marginBottom: 12}}>Buttons</h3>
      <XDSVStack gap={3}>
        <div>
          <div style={{fontSize: 10, opacity: 0.6, marginBottom: 6}}>Default</div>
          <XDSHStack gap={3} vAlign="center">
            <XDSButton label="Primary" variant="primary" />
            <XDSButton label="Secondary" variant="secondary" />
            <XDSButton label="Ghost" variant="ghost" />
            <XDSButton label="Destructive" variant="destructive" />
          </XDSHStack>
        </div>
        <div>
          <div style={{fontSize: 10, opacity: 0.6, marginBottom: 6}}>Disabled</div>
          <XDSHStack gap={3} vAlign="center">
            <XDSButton label="Primary" variant="primary" isDisabled />
            <XDSButton label="Secondary" variant="secondary" isDisabled />
            <XDSButton label="Ghost" variant="ghost" isDisabled />
            <XDSButton label="Destructive" variant="destructive" isDisabled />
          </XDSHStack>
        </div>
      </XDSVStack>
    </div>
  );
}

function ModeColumn({mode}: {mode: Mode}) {
  return (
    <XDSTheme theme={y2kTheme} mode={mode}>
      <XDSLayerProvider>
        <div style={{
          background: 'var(--color-background-body)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: 24,
          display: 'flex',
          flexDirection: 'column' as const,
          gap: 0,
        }}>
          <p style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const,
            letterSpacing: '0.1em', margin: 0, marginBottom: 16, opacity: 0.6,
          }}>
            {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
          </p>
          <TextRampSection />
          <SemanticBadgeSection />
          <CategoricalBadgeSection />
          <BannerSection />
          <InputSection />
          <ButtonSection />
        </div>
      </XDSLayerProvider>
    </XDSTheme>
  );
}

export default function Y2kPalettePage() {
  return (
    <XDSTheme theme={y2kTheme} mode="light">
      <XDSLayerProvider>
        <div style={{
          minHeight: '100vh',
          background: 'var(--color-background-body)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-body)',
          padding: '40px 32px',
        }}>
          <div style={{maxWidth: 1280, margin: '0 auto'}}>
            <h1 style={{
              fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em',
              margin: 0, marginBottom: 8, fontFamily: 'var(--font-family-heading)',
            }}>
              Y2K Theme Palette
            </h1>
            <p style={{
              fontSize: 14, color: 'var(--color-text-secondary)',
              margin: 0, marginBottom: 32,
            }}>
              A bubbly, playful pop theme — hot pink body, lime green accents, Poppins typography.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 24,
            }}>
              <ModeColumn mode="light" />
              <ModeColumn mode="dark" />
            </div>
          </div>
        </div>
      </XDSLayerProvider>
    </XDSTheme>
  );
}
