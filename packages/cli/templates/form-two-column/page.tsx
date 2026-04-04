'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSLink} from '@xds/core/Link';
import {colorVars} from '@xds/core/theme/tokens.stylex';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const COMPANY_SIZES = [
  '1–10 employees',
  '11–50 employees',
  '51–200 employees',
  '201–1000 employees',
  '1000+ employees',
];

const USE_CASES = [
  {label: 'Run it ourselves', value: 'self'},
  {label: 'Managed service', value: 'managed'},
];

const BULLETS = [
  'Connect with a solutions specialist',
  'Get a personalized demo tailored to your needs',
  'Learn which plan fits your operations',
  'Explore partnership opportunities',
];

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = stylex.create({
  pageBg: {
    backgroundColor: colorVars['--color-background-body'],
  },
  fullWidth: {
    width: '100%',
  },
  bulletDot: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colorVars['--color-background-gray'],
    flexShrink: 0,
    marginTop: 2,
  },
  goalButton: {
    flex: 1,
  },
});

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

/**
 * Form (Two-column) — marketing lead-gen / demo request form template.
 *
 * Layout: full-height split. Left side is a marketing hero with large headline
 * and benefit bullets. Right side is a contained form card. Mirrors the Login
 * (Two-Column) structural pattern applied to a lead-capture context.
 */
export default function FormTwoColumnPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [phone, setPhone] = useState('');
  const [goal, setGoal] = useState('');
  const [notes, setNotes] = useState('');
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
          display: 'grid',
          gridTemplateColumns: '1fr 480px',
          gap: 80,
          maxWidth: 1100,
          width: '100%',
          alignItems: 'center',
        }}>
        {/* ── Left: Marketing hero ── */}
        <XDSVStack gap={8}>
          <XDSHeading level={1}>
            Let&apos;s bring our platform
            <br />
            to your operations
          </XDSHeading>

          <XDSVStack gap={3}>
            {BULLETS.map(bullet => (
              <XDSHStack key={bullet} gap={3} vAlign="start">
                <div {...stylex.props(styles.bulletDot)} />
                <XDSText type="body">{bullet}</XDSText>
              </XDSHStack>
            ))}
          </XDSVStack>
        </XDSVStack>

        {/* ── Right: Form card ── */}
        <XDSCard padding={8}>
          <XDSVStack gap={5}>
            {/* Card header */}
            <XDSVStack gap={1}>
              <XDSHeading level={2}>Request a demo</XDSHeading>
              <XDSText type="supporting" color="secondary">
                Fill out the form and we&apos;ll be in touch within one business
                day.
              </XDSText>
            </XDSVStack>

            {/* Fields */}
            <XDSVStack gap={3}>
              <XDSTextInput
                label="Full Name"
                isLabelHidden
                placeholder="Full Name*"
                value={fullName}
                onChange={setFullName}
                status={
                  errors.fullName
                    ? {type: 'error', message: errors.fullName}
                    : undefined
                }
              />

              <XDSVStack gap={1}>
                <XDSTextInput
                  label="Business Email"
                  isLabelHidden
                  placeholder="Business Email*"
                  value={email}
                  onChange={setEmail}
                  status={
                    errors.email
                      ? {type: 'error', message: errors.email}
                      : undefined
                  }
                />
                <XDSText type="supporting" color="secondary">
                  Work email required — no personal accounts
                </XDSText>
              </XDSVStack>

              <XDSTextInput
                label="Company"
                isLabelHidden
                placeholder="Company"
                value={company}
                onChange={setCompany}
              />

              <XDSSelector
                label="Company size"
                isLabelHidden
                placeholder="Company size"
                options={COMPANY_SIZES}
                value={companySize}
                onChange={setCompanySize}
              />

              <XDSTextInput
                label="Business Phone"
                isLabelHidden
                placeholder="Business Phone"
                value={phone}
                onChange={setPhone}
              />
            </XDSVStack>

            {/* Goal toggle */}
            <XDSVStack gap={2}>
              <XDSText type="label" weight="semibold">
                What&apos;s your primary goal?
              </XDSText>
              <XDSHStack gap={2}>
                {USE_CASES.map(opt => (
                  <XDSButton
                    key={opt.value}
                    label={opt.label}
                    variant={goal === opt.value ? 'primary' : 'secondary'}
                    xstyle={styles.goalButton}
                    onClick={() =>
                      setGoal(prev => (prev === opt.value ? '' : opt.value))
                    }
                  />
                ))}
              </XDSHStack>
            </XDSVStack>

            {/* Notes */}
            <XDSTextArea
              label="Additional notes"
              isLabelHidden
              placeholder="Tell us more about your use case (optional)"
              value={notes}
              onChange={setNotes}
            />

            {/* CTA */}
            <XDSButton
              label="Request a demo"
              variant="primary"
              xstyle={styles.fullWidth}
              onClick={handleSubmit}
            />

            {/* Legal */}
            <XDSText type="supporting" color="secondary">
              By submitting this form, you agree to our{' '}
              <XDSLink label="Terms" href="#" type="supporting">
                Terms
              </XDSLink>{' '}
              and{' '}
              <XDSLink label="Privacy Policy" href="#" type="supporting">
                Privacy Policy
              </XDSLink>
              .
            </XDSText>
          </XDSVStack>
        </XDSCard>
      </div>
    </div>
  );
}
