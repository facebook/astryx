'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSToken} from '@xds/core/Token';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSSelector} from '@xds/core/Selector';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@xds/core/theme/tokens.stylex';

const ILLUSTRATION_URL =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const INQUIRY_REASONS = [
  'New business',
  'General inquiry',
  'Press & media',
  'Partnerships',
  'Product feedback',
  'Technical support',
  'Other',
];

const BUDGET_OPTIONS = [
  'Under $10k',
  '$10k – $50k',
  '$50k – $100k',
  '$100k – $500k',
  '$500k+',
  'Not sure yet',
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
  page: {
    backgroundColor: colorVars['--color-background-surface'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100svh',
    padding: 48,
  },
  inner: {
    maxWidth: 1100,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 56,
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 80,
    alignItems: 'center',
  },
  headline: {
    fontSize: 48,
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    margin: 0,
  },
  imagePlaceholder: {
    backgroundColor: colorVars['--color-background-surface'],
    borderRadius: radiusVars['--radius-container'],
    overflow: 'hidden',
    alignSelf: 'flex-start',
    width: '85%',
    aspectRatio: '4 / 3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 32,
    paddingTop: 32,
    textAlign: 'center',
  },
  footerLabel: {
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  tokenWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-2'],
  },
  fullWidth: {
    width: '100%',
  },
});

const mobileStyles = stylex.create({
  page: {
    padding: 20,
    alignItems: 'flex-start',
  },
  topGrid: {
    gridTemplateColumns: '1fr',
    gap: 32,
  },
  image: {
    width: '100%',
  },
  footerGrid: {
    gridTemplateColumns: '1fr',
    textAlign: 'left',
  },
  inlineGrid: {
    gridTemplateColumns: '1fr',
  },
});

const MOBILE = '@media (max-width: 767px)' as const;

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

/**
 * Form (Two-column) — marketing contact form template.
 *
 * Layout:
 *   Top: two-column — left has headline + description + illustration,
 *        right has the contact form on a card.
 *   Bottom: three-column contact info strip.
 *   Mobile (<768px): single column stack.
 */
export default function FormTwoColumnPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryReason, setInquiryReason] = useState('');
  const [budget, setBudget] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const errors = submitted
    ? {
        fullName: !fullName.trim() ? 'Required' : undefined,
        email: !email.trim() ? 'Required' : undefined,
        details: !details.trim() ? 'Required' : undefined,
      }
    : {};

  const handleSubmit = () => setSubmitted(true);

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.inner)}>
        {/* ── Top: two-column ── */}
        <div {...stylex.props(styles.topGrid)}>
          {/* Left: headline + description + illustration */}
          <XDSVStack gap={6}>
            <XDSVStack gap={3}>
              <div {...stylex.props(styles.headline)}>
                Let&apos;s work together
              </div>
              <XDSText type="body" color="secondary">
                Tell us what you&apos;re working on and we&apos;ll help you
                figure out the best path forward.
              </XDSText>
            </XDSVStack>
            <div {...stylex.props(styles.imagePlaceholder)}>
              <img
                src={ILLUSTRATION_URL}
                alt="Illustration"
                style={{width: '100%', height: '100%', objectFit: 'contain'}}
              />
            </div>
          </XDSVStack>

          {/* Right: form on a card */}
          <XDSCard padding={8}>
            <XDSVStack gap={4}>
              <XDSText type="label">Your details</XDSText>
              <XDSTextInput
                label="Full name"
                isLabelHidden
                placeholder="Full name*"
                value={fullName}
                onChange={setFullName}
                status={
                  errors.fullName
                    ? {type: 'error', message: errors.fullName}
                    : undefined
                }
              />
              <div {...stylex.props(styles.inlineGrid)}>
                <XDSTextInput
                  label="Email"
                  isLabelHidden
                  placeholder="Email*"
                  value={email}
                  onChange={setEmail}
                  status={
                    errors.email
                      ? {type: 'error', message: errors.email}
                      : undefined
                  }
                />
                <XDSTextInput
                  label="Company name"
                  isLabelHidden
                  placeholder="Company name"
                  value={company}
                  onChange={setCompany}
                />
              </div>
              <div {...stylex.props(styles.inlineGrid)}>
                <XDSTextInput
                  label="Job title"
                  isLabelHidden
                  placeholder="Job title"
                  value={jobTitle}
                  onChange={setJobTitle}
                />
                <XDSTextInput
                  label="Phone number"
                  isLabelHidden
                  placeholder="Phone number"
                  value={phone}
                  onChange={setPhone}
                />
              </div>

              <XDSVStack gap={2}>
                <XDSText type="label">What are you reaching out about?</XDSText>
                <div {...stylex.props(styles.tokenWrap)}>
                  {INQUIRY_REASONS.map(reason => (
                    <XDSToken
                      key={reason}
                      label={reason}
                      color={inquiryReason === reason ? 'blue' : 'default'}
                      onClick={() =>
                        setInquiryReason(prev =>
                          prev === reason ? '' : reason,
                        )
                      }
                    />
                  ))}
                </div>
              </XDSVStack>
              <XDSSelector
                label="Budget range"
                options={BUDGET_OPTIONS}
                value={budget}
                onChange={setBudget}
                placeholder="Select a budget range..."
              />
              <XDSTextArea
                label="Project details"
                isLabelHidden
                placeholder="Project details*"
                value={details}
                onChange={setDetails}
                status={
                  errors.details
                    ? {type: 'error', message: errors.details}
                    : undefined
                }
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
          <div {...stylex.props(styles.footerGrid)}>
            {CONTACT_COLUMNS.map(col => (
              <XDSVStack key={col.label} gap={1} hAlign="center">
                <XDSText type="supporting" color="secondary">
                  <span {...stylex.props(styles.footerLabel)}>{col.label}</span>
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
