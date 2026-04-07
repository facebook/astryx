'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {colorVars, fontWeightVars} from '@xds/core/theme/tokens.stylex';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const INQUIRY_REASONS = [
  'General inquiry',
  'New business',
  'Press & partnerships',
  'Recurring work',
  'Other',
];

const CONTACT_COLUMNS = [
  {label: 'General inquiries', email: 'hello@company.com'},
  {label: 'New business', email: 'newbiz@company.com'},
  {label: 'Press & partnerships', email: 'press@company.com'},
];

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = stylex.create({
  pageBg: {
    backgroundColor: colorVars['--color-surface'],
  },
  fullWidth: {
    width: '100%',
  },
  cardOverride: {
    backgroundColor: colorVars['--color-wash'],
  },
  imagePlaceholder: {
    backgroundColor: colorVars['--color-deemphasized'],
    borderRadius: 12,
    width: '100%',
    aspectRatio: '4 / 3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

/**
 * Form (Two-column) — marketing contact form template.
 *
 * Layout:
 *   Top: two-column — left has headline + description + illustration placeholder,
 *        right has the contact form on a card.
 *   Bottom: three-column contact info strip.
 */
export default function FormTwoColumnPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [inquiryReason, setInquiryReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const errors = submitted
    ? {
        fullName: !fullName.trim() ? 'Required' : undefined,
        email: !email.trim() ? 'Required' : undefined,
      }
    : {};

  const handleSubmit = () => setSubmitted(true);

  return (
    <div
      {...stylex.props(styles.pageBg)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100svh',
        padding: 48,
        position: 'fixed',
        inset: 0,
        overflow: 'auto',
      }}>
      <div
        style={{
          maxWidth: 1100,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 56,
        }}>

        {/* ── Top: two-column ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 80,
            alignItems: 'center',
          }}>

          {/* Left: headline + description + illustration */}
          <XDSVStack gap={6}>
            <XDSVStack gap={3}>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: fontWeightVars['--font-weight-bold'],
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  margin: 0,
                }}>
                Let&apos;s work together
              </div>
              <XDSText type="body" color="secondary">
                Tell us what you&apos;re working on and we&apos;ll help you
                figure out the best path forward.
              </XDSText>
            </XDSVStack>
            <div {...stylex.props(styles.imagePlaceholder)}>
              <XDSText type="supporting" color="secondary">
                Illustration coming soon
              </XDSText>
            </div>
          </XDSVStack>

          {/* Right: form on a card */}
          <XDSCard padding={8} xstyle={styles.cardOverride}>
            <XDSVStack gap={4}>
              <XDSTextInput
                label="Full name"
                isLabelHidden
                placeholder="Full name*"
                value={fullName}
                onChange={setFullName}
                status={errors.fullName ? {type: 'error', message: errors.fullName} : undefined}
              />
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
                <XDSTextInput
                  label="Email"
                  isLabelHidden
                  placeholder="Email*"
                  value={email}
                  onChange={setEmail}
                  status={errors.email ? {type: 'error', message: errors.email} : undefined}
                />
                <XDSTextInput
                  label="Phone number"
                  isLabelHidden
                  placeholder="Phone number"
                  value={phone}
                  onChange={setPhone}
                />
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
                <XDSTextInput
                  label="Company name"
                  isLabelHidden
                  placeholder="Company name"
                  value={company}
                  onChange={setCompany}
                />
                <XDSSelector
                  label="Inquiry reason"
                  isLabelHidden
                  placeholder="Inquiry reason*"
                  options={INQUIRY_REASONS}
                  value={inquiryReason}
                  onChange={setInquiryReason}
                />
              </div>
              <XDSTextArea
                label="Project details"
                isLabelHidden
                placeholder="Project details*"
                value={details}
                onChange={setDetails}
              />
              <XDSButton
                label="Let's connect"
                variant="primary"
                xstyle={styles.fullWidth}
                onClick={handleSubmit}
              />
            </XDSVStack>
          </XDSCard>
        </div>

        {/* ── Bottom: contact strip ── */}
        <div>
          <XDSDivider />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 32,
              paddingTop: 32,
              textAlign: 'center',
            }}>
            {CONTACT_COLUMNS.map(col => (
              <XDSVStack key={col.label} gap={1} hAlign="center">
                <XDSText type="supporting" color="secondary">
                  {col.label}
                </XDSText>
                <XDSLink
                  label={col.email}
                  href={`mailto:${col.email}`}
                  type="body"
                  size="sm">
                  {col.email}
                </XDSLink>
              </XDSVStack>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
