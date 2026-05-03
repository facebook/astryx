'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSToken} from '@xds/core/Token';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSSelector} from '@xds/core/Selector';
import {colorVars} from '@xds/core/theme/tokens.stylex';

// illustration-horizontal-1 from xds_oss asset set
const ILLUSTRATION_URL =
  'https://lookaside.facebook.com/assets/xds_oss/illustration-horizontal-1.png';

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
  },
  imagePlaceholder: {
    width: '85%',
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
    <XDSCenter height="100svh" xstyle={styles.page}>
      <XDSSection
        maxWidth={1100}
        width="100%"
        padding={10}
        variant="transparent">
        <XDSVStack gap={10}>
          {/* ── Top: two-column ── */}
          <XDSGrid columns={2} align="center" gap={10}>
            {/* Left: headline + description + illustration */}
            <XDSVStack gap={6}>
              <XDSVStack gap={3}>
                <XDSText type="display-1" as="h1">
                  Let&apos;s work together
                </XDSText>
                <XDSText type="body" color="secondary">
                  Tell us what you&apos;re working on and we&apos;ll help you
                  figure out the best path forward.
                </XDSText>
              </XDSVStack>
              <XDSAspectRatio ratio={4 / 3} xstyle={styles.imagePlaceholder}>
                <img src={ILLUSTRATION_URL} alt="Illustration" />
              </XDSAspectRatio>
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
                <XDSGrid columns={2} gap={3}>
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
                </XDSGrid>
                <XDSGrid columns={2} gap={3}>
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
                </XDSGrid>

                <XDSVStack gap={2}>
                  <XDSText type="label">
                    What are you reaching out about?
                  </XDSText>
                  <XDSHStack gap={2} wrap="wrap">
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
                  </XDSHStack>
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
          </XDSGrid>

          {/* ── Bottom: contact strip ── */}
          <XDSVStack gap={6}>
            <XDSDivider />
            <XDSGrid columns={3} gap={6}>
              {CONTACT_COLUMNS.map(col => (
                <XDSVStack key={col.label} gap={1} hAlign="center">
                  <XDSText type="supporting" color="secondary">
                    {col.label}
                  </XDSText>
                  <XDSLink
                    href={`mailto:${col.email}`}
                    type="body"
                    size="sm">
                    {col.email}
                  </XDSLink>
                </XDSVStack>
              ))}
            </XDSGrid>
          </XDSVStack>
        </XDSVStack>
      </XDSSection>
    </XDSCenter>
  );
}
