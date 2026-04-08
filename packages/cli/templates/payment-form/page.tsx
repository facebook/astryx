'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typeScaleVars,
  fontWeightVars,
} from '@xds/core/theme/tokens.stylex';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const MONTHS = [
  '01 – January',
  '02 – February',
  '03 – March',
  '04 – April',
  '05 – May',
  '06 – June',
  '07 – July',
  '08 – August',
  '09 – September',
  '10 – October',
  '11 – November',
  '12 – December',
];

const YEARS = Array.from({length: 12}, (_, i) => String(2025 + i));

const ORDER_ITEMS = [
  {label: 'Pro Plan – Annual', amount: '$299.00'},
  {label: 'Onboarding add-on', amount: '$49.00'},
  {label: 'Priority support', amount: '$79.00'},
];

const ORDER_TOTAL = '$427.00';

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = stylex.create({
  page: {
    minHeight: '100svh',
    backgroundColor: colorVars['--color-background-surface'],
    display: 'flex',
    flexDirection: 'column',
  },
  inner: {
    maxWidth: 1100,
    margin: '0 auto',
    width: '100%',
    paddingTop: spacingVars['--spacing-10'],
    paddingBottom: spacingVars['--spacing-10'],
    paddingLeft: spacingVars['--spacing-6'],
    paddingRight: spacingVars['--spacing-6'],
  },
  displayHeading: {
    fontSize: '56px',
    fontWeight: fontWeightVars['--font-weight-bold'],
    lineHeight: '1.05',
    letterSpacing: '-0.03em',
    margin: 0,
  },
  body: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: spacingVars['--spacing-8'],
    alignItems: 'start',
  },
  inlineGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacingVars['--spacing-4'],
  },
  threeGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: spacingVars['--spacing-4'],
  },
  orderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacingVars['--spacing-3'],
  },
  secureNote: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  sectionLabel: {
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: colorVars['--color-text-secondary'],
  },
});

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

/**
 * Payment Form — secure checkout template.
 *
 * Layout:
 *   Top: page header with title + description + divider.
 *   Body: two-column — left (~65%) has billing info + card details,
 *         right (~35%) has the order summary card.
 *   Mobile: single-column stack.
 */
export default function PaymentFormPage() {
  // Billing
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');

  // Card
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');

  // Options
  const [saveCard, setSaveCard] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const errors = submitted
    ? {
        firstName: !firstName.trim() ? 'Required' : undefined,
        lastName: !lastName.trim() ? 'Required' : undefined,
        email: !email.trim() ? 'Required' : undefined,
        address: !address.trim() ? 'Required' : undefined,
        city: !city.trim() ? 'Required' : undefined,
        zip: !zip.trim() ? 'Required' : undefined,
        cardName: !cardName.trim() ? 'Required' : undefined,
        cardNumber: !cardNumber.trim() ? 'Required' : undefined,
        expMonth: !expMonth ? 'Required' : undefined,
        expYear: !expYear ? 'Required' : undefined,
        cvc: !cvc.trim() ? 'Required' : undefined,
        agreeTerms: !agreeTerms ? 'You must accept the terms' : undefined,
      }
    : {};

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.inner)}>
        <XDSVStack gap={8}>

          {/* ── Header ── */}
          <XDSVStack gap={3}>
            <div {...stylex.props(styles.displayHeading)}>Payment Request</div>
            <XDSText type="body" color="secondary">
              Complete your purchase securely. All transactions are encrypted
              and your payment information is never stored on our servers.
            </XDSText>
            <XDSDivider />
          </XDSVStack>

          {/* ── Body: two-column ── */}
          <div {...stylex.props(styles.body)}>

            {/* ── Left: form ── */}
            <XDSVStack gap={7}>

              {/* Billing info */}
              <XDSVStack gap={4}>
                <span {...stylex.props(styles.sectionLabel)}>Billing information</span>
                <div {...stylex.props(styles.inlineGrid)}>
                  <XDSTextInput
                    label="First name"
                    placeholder="First name"
                    value={firstName}
                    onChange={setFirstName}
                    status={errors.firstName ? {type: 'error', message: errors.firstName} : undefined}
                  />
                  <XDSTextInput
                    label="Last name"
                    placeholder="Last name"
                    value={lastName}
                    onChange={setLastName}
                    status={errors.lastName ? {type: 'error', message: errors.lastName} : undefined}
                  />
                </div>
                <XDSTextInput
                  label="Email address"
                  placeholder="you@company.com"
                  value={email}
                  onChange={setEmail}
                  status={errors.email ? {type: 'error', message: errors.email} : undefined}
                />
                <XDSTextInput
                  label="Street address"
                  placeholder="123 Main St"
                  value={address}
                  onChange={setAddress}
                  status={errors.address ? {type: 'error', message: errors.address} : undefined}
                />
                <div {...stylex.props(styles.threeGrid)}>
                  <XDSTextInput
                    label="City"
                    placeholder="City"
                    value={city}
                    onChange={setCity}
                    status={errors.city ? {type: 'error', message: errors.city} : undefined}
                  />
                  <XDSTextInput
                    label="State"
                    placeholder="State"
                    value={state}
                    onChange={setState}
                  />
                  <XDSTextInput
                    label="ZIP code"
                    placeholder="00000"
                    value={zip}
                    onChange={setZip}
                    status={errors.zip ? {type: 'error', message: errors.zip} : undefined}
                  />
                </div>
                <XDSTextInput
                  label="Country"
                  placeholder="United States"
                  value={country}
                  onChange={setCountry}
                />
              </XDSVStack>

              <XDSDivider />

              {/* Card details */}
              <XDSVStack gap={4}>
                <span {...stylex.props(styles.sectionLabel)}>Card details</span>
                <XDSTextInput
                  label="Name on card"
                  placeholder="Full name as shown on card"
                  value={cardName}
                  onChange={setCardName}
                  status={errors.cardName ? {type: 'error', message: errors.cardName} : undefined}
                />
                <XDSTextInput
                  label="Card number"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={setCardNumber}
                  status={errors.cardNumber ? {type: 'error', message: errors.cardNumber} : undefined}
                />
                <div {...stylex.props(styles.threeGrid)}>
                  <XDSSelector
                    label="Expiry month"
                    placeholder="Month"
                    options={MONTHS}
                    value={expMonth}
                    onChange={setExpMonth}
                    status={errors.expMonth ? {type: 'error', message: errors.expMonth} : undefined}
                  />
                  <XDSSelector
                    label="Expiry year"
                    placeholder="Year"
                    options={YEARS}
                    value={expYear}
                    onChange={setExpYear}
                    status={errors.expYear ? {type: 'error', message: errors.expYear} : undefined}
                  />
                  <XDSTextInput
                    label="CVC"
                    placeholder="CVC"
                    value={cvc}
                    onChange={setCvc}
                    status={errors.cvc ? {type: 'error', message: errors.cvc} : undefined}
                  />
                </div>
                <XDSCheckboxInput
                  label="Save card for future payments"
                  value={saveCard}
                  onChange={setSaveCard}
                />
              </XDSVStack>

              <XDSDivider />

              {/* Submit */}
              <XDSVStack gap={3}>
                <XDSCheckboxInput
                  label="I agree to the terms of service and privacy policy"
                  value={agreeTerms}
                  onChange={setAgreeTerms}
                />
                {errors.agreeTerms && (
                  <XDSText type="supporting" color="error">
                    {errors.agreeTerms}
                  </XDSText>
                )}
                <XDSButton
                  label={`Pay ${ORDER_TOTAL}`}
                  variant="primary"
                  size="lg"
                  xstyle={styles.fullWidth}
                  onClick={() => setSubmitted(true)}
                />
                <div {...stylex.props(styles.secureNote)}>
                  <XDSText type="supporting" color="secondary">
                    🔒 Secured with 256-bit SSL encryption
                  </XDSText>
                </div>
                <XDSHStack gap={1} hAlign="center">
                  <XDSText type="supporting" color="secondary">
                    By paying you agree to our{' '}
                    <XDSLink label="Terms of Service" href="#" type="supporting">
                      Terms of Service
                    </XDSLink>{' '}
                    and{' '}
                    <XDSLink label="Privacy Policy" href="#" type="supporting">
                      Privacy Policy
                    </XDSLink>
                    .
                  </XDSText>
                </XDSHStack>
              </XDSVStack>

            </XDSVStack>

            {/* ── Right: order summary ── */}
            <XDSCard padding={6}>
              <XDSVStack gap={5}>
                <XDSVStack gap={1}>
                  <XDSText type="label">Order summary</XDSText>
                  <XDSBadge variant="success">1 item</XDSBadge>
                </XDSVStack>

                <XDSDivider />

                <XDSVStack gap={3}>
                  {ORDER_ITEMS.map(item => (
                    <div key={item.label} {...stylex.props(styles.orderRow)}>
                      <XDSText type="supporting" color="secondary">{item.label}</XDSText>
                      <XDSText type="supporting" weight="medium">{item.amount}</XDSText>
                    </div>
                  ))}
                </XDSVStack>

                <XDSDivider />

                <div {...stylex.props(styles.totalRow)}>
                  <XDSText type="body" weight="bold">Total due today</XDSText>
                  <XDSText type="body" weight="bold">{ORDER_TOTAL}</XDSText>
                </div>

                <XDSDivider />

                <XDSVStack gap={2}>
                  <XDSText type="supporting" color="secondary">
                    Questions about your order?
                  </XDSText>
                  <XDSLink label="Contact support" href="#" type="supporting">
                    Contact support
                  </XDSLink>
                </XDSVStack>
              </XDSVStack>
            </XDSCard>

          </div>
        </XDSVStack>
      </div>
    </div>
  );
}
