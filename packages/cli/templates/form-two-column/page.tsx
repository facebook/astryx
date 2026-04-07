'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSLink} from '@xds/core/Link';
import {XDSAvatar} from '@xds/core/Avatar';
import {colorVars, fontWeightVars} from '@xds/core/theme/tokens.stylex';

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

const CONTACT_GRID = [
  {
    category: 'General inquiries',
    name: 'Alex Johnson',
    email: 'hello@company.com',
  },
  {
    category: 'New business',
    name: 'Jordan Lee',
    email: 'newbiz@company.com',
  },
  {
    category: 'Press & partnerships',
    name: 'Morgan Smith',
    email: 'press@company.com',
  },
  {
    category: 'Recurring work',
    name: 'Taylor Brown',
    email: 'work@company.com',
  },
  {
    category: 'Find us',
    address: ['123 Main Street', 'Suite 400', 'San Francisco, CA 94103'],
  },
  {
    category: 'Give us a ring',
    phone: '+1 (415) 000-0000',
    hours: ['9am – 6pm', 'Mon to Fri'],
  },
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
  goalButton: {
    flex: 1,
  },
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
  },
  categoryLabel: {
    color: colorVars['--color-text-secondary'],
    fontSize: 13,
  },
});

// ─────────────────────────────────────────────────────────────
// Contact cell
// ─────────────────────────────────────────────────────────────

function ContactCell(item: (typeof CONTACT_GRID)[number]) {
  return (
    <XDSVStack gap={2}>
      <XDSText type="supporting" color="secondary">
        {item.category}
      </XDSText>

      {'name' in item && item.name != null ? (
        <XDSHStack gap={3} vAlign="center">
          <XDSAvatar name={item.name} size="medium" />
          <XDSVStack gap={0}>
            <XDSText type="body" weight="semibold">
              {item.name}
            </XDSText>
            <XDSLink label={item.email ?? ''} href={`mailto:${item.email}`} type="supporting">
              {item.email}
            </XDSLink>
          </XDSVStack>
        </XDSHStack>
      ) : 'address' in item && item.address != null ? (
        <XDSVStack gap={0}>
          {item.address.map(line => (
            <XDSText key={line} type="body">
              {line}
            </XDSText>
          ))}
        </XDSVStack>
      ) : 'phone' in item && item.phone != null ? (
        <XDSVStack gap={0}>
          <XDSText type="body" weight="semibold">
            {item.phone}
          </XDSText>
          {(item.hours ?? []).map(line => (
            <XDSText key={line} type="body" color="secondary">
              {line}
            </XDSText>
          ))}
        </XDSVStack>
      ) : null}
    </XDSVStack>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

/**
 * Form (Two-column) — marketing lead-gen / demo request form template.
 *
 * Layout: full-height split. Left side has a large display heading and a
 * 2x3 contact info grid. Right side is a contained form card.
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
        {/* ── Left: Hero + contact grid ── */}
        <XDSVStack gap={8}>
          {/* Display heading — matches contact-form template size */}
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

          {/* 2x3 contact grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 32,
            }}>
            {CONTACT_GRID.map(item => (
              <ContactCell key={item.category} {...item} />
            ))}
          </div>
        </XDSVStack>

        {/* ── Right: Form card ── */}
        <XDSCard padding={8}>
          <XDSVStack gap={5}>
            {/* Card header */}
            <XDSVStack gap={1}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: fontWeightVars['--font-weight-bold'],
                  lineHeight: 1.2,
                  margin: 0,
                }}>
                Request a demo
              </div>
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
