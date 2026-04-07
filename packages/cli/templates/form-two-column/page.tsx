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
import Image from 'next/image';
import illustrationSrc from './illustration.png';
import {colorVars, spacingVars, radiusVars} from '@xds/core/theme/tokens.stylex';
import './form-two-column.css';

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
// Styles — tokens for colors, radius, spacing only
// Grid layout lives in form-two-column.css
// ─────────────────────────────────────────────────────────────

const styles = stylex.create({
  imagePlaceholder: {
    backgroundColor: colorVars['--color-background-surface'],
    borderRadius: radiusVars['--radius-container'],
    overflow: 'hidden',
    alignSelf: 'flex-start',
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
    <div className="ftc-page">
      <div className="ftc-inner">

        {/* ── Top: two-column ── */}
        <div className="ftc-top-grid">

          {/* Left: headline + description + illustration */}
          <XDSVStack gap={6}>
            <XDSVStack gap={3}>
              <div className="ftc-headline">
                Let&apos;s work together
              </div>
              <XDSText type="body" color="secondary">
                Tell us what you&apos;re working on and we&apos;ll help you
                figure out the best path forward.
              </XDSText>
            </XDSVStack>
            <div className="ftc-image" {...stylex.props(styles.imagePlaceholder)}>
              <Image
                src={illustrationSrc}
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
                status={errors.fullName ? {type: 'error', message: errors.fullName} : undefined}
              />
              <div className="ftc-inline-grid">
                <XDSTextInput
                  label="Email"
                  isLabelHidden
                  placeholder="Email*"
                  value={email}
                  onChange={setEmail}
                  status={errors.email ? {type: 'error', message: errors.email} : undefined}
                />
                <XDSTextInput
                  label="Company name"
                  isLabelHidden
                  placeholder="Company name"
                  value={company}
                  onChange={setCompany}
                />
              </div>
              <div className="ftc-inline-grid">
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
                status={errors.details ? {type: 'error', message: errors.details} : undefined}
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
          <div className="ftc-footer-grid">
            {CONTACT_COLUMNS.map(col => (
              <XDSVStack key={col.label} gap={1} hAlign="center">
                <XDSText type="supporting" color="secondary">
                  <span className="ftc-footer-label">{col.label}</span>
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
