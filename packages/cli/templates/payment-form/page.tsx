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
import {XDSSegmentedControl, XDSSegmentedControlItem} from '@xds/core/SegmentedControl';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSCenter} from '@xds/core/Center';
import {
  colorVars, spacingVars, radiusVars, typeScaleVars, fontWeightVars,
} from '@xds/core/theme/tokens.stylex';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const COUNTRIES = ['United States','Canada','United Kingdom','France','Germany','Australia','Japan','Other'];
const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const YEARS = Array.from({length: 12}, (_, i) => String(2025 + i));

const ORDER_ITEMS = [
  {name: 'Pro Plan', variant: 'Annual / Team', originalPrice: '$359.00', price: '$299.00'},
];
const TOTAL = '$299.00';
const SAVINGS = '$60.00';

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = stylex.create({
  displayHeading: {
    fontSize: '64px',
    fontWeight: fontWeightVars['--font-weight-bold'],
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  sectionTitle: {
    fontSize: typeScaleVars['--text-large-size'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    lineHeight: typeScaleVars['--text-large-leading'],
    margin: 0,
  },
  inlineGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacingVars['--spacing-3'],
  },
  expGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: spacingVars['--spacing-3'],
  },
  fullWidth: {
    width: '100%',
  },
  orderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-3'],
  },
  orderThumb: {
    width: 52,
    height: 52,
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-neutral'],
    flexShrink: 0,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strikethrough: {
    textDecoration: 'line-through',
  },
  orDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-3'],
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colorVars['--color-border'],
  },
  secureNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-2'],
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

/**
 * Payment Form — two-column checkout template.
 *
 * Uses XDSAppShell + XDSCenter for outer layout (same pattern as product-detail).
 * Left column (~60%): contact, shipping, payment form.
 * Right column (~40%): sticky order summary.
 */
export default function PaymentFormPage() {
  const [contact, setContact] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('ship');
  const [country, setCountry] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [saveInfo, setSaveInfo] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const errors = submitted ? {
    contact: !contact.trim() ? 'Required' : undefined,
    country: deliveryMode === 'ship' && !country ? 'Required' : undefined,
    lastName: deliveryMode === 'ship' && !lastName.trim() ? 'Required' : undefined,
    address: deliveryMode === 'ship' && !address.trim() ? 'Required' : undefined,
    city: deliveryMode === 'ship' && !city.trim() ? 'Required' : undefined,
    zip: deliveryMode === 'ship' && !zip.trim() ? 'Required' : undefined,
    cardNumber: !cardNumber.trim() ? 'Required' : undefined,
    cardName: !cardName.trim() ? 'Required' : undefined,
    expMonth: !expMonth ? 'Required' : undefined,
    expYear: !expYear ? 'Required' : undefined,
    cvc: !cvc.trim() ? 'Required' : undefined,
  } : {};

  return (
    <XDSAppShell height="auto" contentPadding={0} variant="surface">
      <XDSCenter axis="horizontal">
        <div style={{maxWidth: 1100, width: '100%', padding: '48px 24px'}}>

          {/* ── Page header ── */}
          <XDSVStack gap={1} style={{marginBottom: 40}}>
            <div {...stylex.props(styles.displayHeading)}>Payment Request</div>
            <XDSText type="body" color="secondary">
              Complete your purchase securely. All transactions are encrypted
              and your card details are never stored.
            </XDSText>
            <XDSDivider />
          </XDSVStack>

          {/* ── Two-column body ── */}
          <div style={{display: 'flex', gap: 64, alignItems: 'flex-start'}}>

            {/* ── Left: form (~60%) ── */}
            <div style={{flex: '1 1 60%', minWidth: 0}}>
              <XDSVStack gap={8}>

                {/* Express checkout */}
                <XDSVStack gap={3}>
                  <div style={{display: 'flex', gap: 12}}>
                    {/* Saved card */}
                    <XDSButton label="Pay with card" variant="secondary" size="lg" style={{flex: 1}} onClick={() => {}} />

                    {/* PayPal */}
                    <XDSButton
                      label="PayPal"
                      variant="secondary"
                      size="lg"
                      style={{flex: 1, backgroundColor: '#FFC439', borderColor: '#FFC439', color: '#003087'}}
                      onClick={() => {}}
                      icon={
                        <svg viewBox="0 0 24 24" style={{width: 18, height: 18}} xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 00-.607-.541c1.379 3.877-.487 6.686-4.761 6.686h-3.275l-1.096 6.956h3.48c.458 0 .847-.332.918-.784l.038-.196.728-4.617.047-.252a.93.93 0 01.918-.784h.578c3.741 0 6.671-1.52 7.527-5.913.36-1.845.174-3.386-.495-4.555z" fill="#009cde"/>
                          <path d="M6.35 6.917a.93.93 0 01.918-.784h5.832c.691 0 1.337.045 1.927.14a7.49 7.49 0 011.132.285 5.17 5.17 0 011.364.68c-.312-1.867-1.006-3.086-2.24-4.07C13.98.978 12.27.5 10.08.5H3.83c-.524 0-.97.382-1.052.9L.054 20.437a.641.641 0 00.633.74h4.606l1.057-14.26z" fill="#003087"/>
                        </svg>
                      }
                    />

                    {/* Google Pay */}
                    <XDSButton
                      label="G Pay"
                      variant="secondary"
                      size="lg"
                      style={{flex: 1, backgroundColor: '#fff', borderColor: '#dadce0', color: '#202124'}}
                      onClick={() => {}}
                      icon={
                        <svg viewBox="0 0 48 20" style={{width: 48, height: 18}} xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.6 10.2c0 3.4-2.6 5.8-5.8 5.8s-5.8-2.5-5.8-5.8 2.6-5.8 5.8-5.8c1.6 0 3 .6 4 1.6l-1.6 1.6c-.6-.6-1.5-1-2.4-1-2 0-3.6 1.7-3.6 3.7s1.6 3.7 3.6 3.7c1.8 0 3-1 3.4-2.4h-3.4V9.2h5.7c.1.3.1.7.1 1z" fill="#4285F4"/>
                          <path d="M33 10c0 3.3-2.5 5.9-5.7 5.9s-5.7-2.6-5.7-5.9 2.5-5.9 5.7-5.9 5.7 2.6 5.7 5.9zm-2.5 0c0-2.1-1.5-3.5-3.2-3.5s-3.2 1.4-3.2 3.5 1.5 3.5 3.2 3.5 3.2-1.4 3.2-3.5z" fill="#EA4335"/>
                          <path d="M43.6 10c0 3.3-2.5 5.9-5.7 5.9s-5.7-2.6-5.7-5.9 2.5-5.9 5.7-5.9 5.7 2.6 5.7 5.9zm-2.5 0c0-2.1-1.5-3.5-3.2-3.5s-3.2 1.4-3.2 3.5 1.5 3.5 3.2 3.5 3.2-1.4 3.2-3.5z" fill="#FBBC05"/>
                          <path d="M48 4.4v11.1c0 4.6-2.7 6.5-5.9 6.5-3 0-4.9-2-5.5-3.7l2.2-.9c.4 1 1.3 2.1 3.3 2.1 2.2 0 3.5-1.3 3.5-3.8v-.9h-.1c-.6.8-1.8 1.4-3.3 1.4-3.2 0-6.1-2.8-6.1-6.3s2.9-6.3 6.1-6.3c1.5 0 2.7.6 3.3 1.4h.1V4.4H48zm-2.3 5.6c0-2-1.4-3.5-3.2-3.5-1.9 0-3.4 1.5-3.4 3.5s1.5 3.4 3.4 3.4c1.8 0 3.2-1.4 3.2-3.4z" fill="#4285F4"/>
                          <path d="M3.5 15.8V4.2H7c1.8 0 3.2 1.2 3.2 3s-1.4 3-3.2 3H5.7v5.6H3.5zm2.2-7.5H7c.7 0 1.1-.5 1.1-1.1S7.7 6.1 7 6.1H5.7v2.2z" fill="#34A853"/>
                        </svg>
                      }
                    />
                  </div>
                  <div {...stylex.props(styles.orDivider)}>
                    <div {...stylex.props(styles.orLine)} />
                    <XDSText type="supporting" color="secondary">OR</XDSText>
                    <div {...stylex.props(styles.orLine)} />
                  </div>
                </XDSVStack>

                {/* Contact */}
                <XDSVStack gap={4}>
                  <div {...stylex.props(styles.sectionHeader)}>
                    <div {...stylex.props(styles.sectionTitle)}>Contact</div>
                    <XDSLink label="Sign in" href="#" type="supporting">Sign in</XDSLink>
                  </div>
                  <XDSTextInput
                    label="Email or phone number" isLabelHidden placeholder="Email or phone number"
                    value={contact} onChange={setContact}
                    status={errors.contact ? {type: 'error', message: errors.contact} : undefined}
                  />
                  <XDSCheckboxInput label="Email me with news and offers" value={false} onChange={() => {}} />
                </XDSVStack>

                <XDSDivider />

                {/* Shipping */}
                <XDSVStack gap={4}>
                  <div {...stylex.props(styles.sectionTitle)}>Shipping</div>
                  <XDSSegmentedControl label="Delivery mode" value={deliveryMode} onChange={setDeliveryMode}>
                    <XDSSegmentedControlItem value="ship" label="Ship" />
                    <XDSSegmentedControlItem value="pickup" label="Pick up" />
                  </XDSSegmentedControl>

                  {deliveryMode === 'ship' && (
                    <XDSVStack gap={3}>
                      <XDSSelector
                        label="Country / Region" placeholder="Country / Region"
                        options={COUNTRIES} value={country} onChange={setCountry}
                        status={errors.country ? {type: 'error', message: errors.country} : undefined}
                      />
                      <div {...stylex.props(styles.inlineGrid)}>
                        <XDSTextInput label="First name (optional)" isLabelHidden placeholder="First name (optional)" value={firstName} onChange={setFirstName} />
                        <XDSTextInput
                          label="Last name" isLabelHidden placeholder="Last name"
                          value={lastName} onChange={setLastName}
                          status={errors.lastName ? {type: 'error', message: errors.lastName} : undefined}
                        />
                      </div>
                      <XDSTextInput
                        label="Address" isLabelHidden placeholder="Address"
                        value={address} onChange={setAddress}
                        status={errors.address ? {type: 'error', message: errors.address} : undefined}
                      />
                      <XDSTextInput label="Apartment, suite, etc. (optional)" isLabelHidden placeholder="Apartment, suite, etc. (optional)" value={apt} onChange={setApt} />
                      <div {...stylex.props(styles.inlineGrid)}>
                        <XDSTextInput
                          label="City" isLabelHidden placeholder="City"
                          value={city} onChange={setCity}
                          status={errors.city ? {type: 'error', message: errors.city} : undefined}
                        />
                        <XDSTextInput
                          label="ZIP code" isLabelHidden placeholder="ZIP code"
                          value={zip} onChange={setZip}
                          status={errors.zip ? {type: 'error', message: errors.zip} : undefined}
                        />
                      </div>
                      <XDSTextInput label="State" isLabelHidden placeholder="State" value={state} onChange={setState} />
                    </XDSVStack>
                  )}

                  {deliveryMode === 'pickup' && (
                    <XDSCard padding={4}>
                      <XDSText type="supporting" color="secondary">
                        Select a pickup location at the next step after entering your ZIP code.
                      </XDSText>
                    </XDSCard>
                  )}

                  <XDSCheckboxInput label="Save my information for next time" value={saveInfo} onChange={setSaveInfo} />
                </XDSVStack>

                <XDSDivider />

                {/* Payment */}
                <XDSVStack gap={4}>
                  <div {...stylex.props(styles.sectionTitle)}>Payment</div>
                  <XDSTextInput
                    label="Card number" isLabelHidden placeholder="Card number"
                    value={cardNumber} onChange={setCardNumber}
                    status={errors.cardNumber ? {type: 'error', message: errors.cardNumber} : undefined}
                  />
                  <XDSTextInput
                    label="Name on card" isLabelHidden placeholder="Name on card"
                    value={cardName} onChange={setCardName}
                    status={errors.cardName ? {type: 'error', message: errors.cardName} : undefined}
                  />
                  <div {...stylex.props(styles.expGrid)}>
                    <XDSSelector
                      label="Expiry month" placeholder="MM"
                      options={MONTHS} value={expMonth} onChange={setExpMonth}
                      status={errors.expMonth ? {type: 'error', message: errors.expMonth} : undefined}
                    />
                    <XDSSelector
                      label="Expiry year" placeholder="YY"
                      options={YEARS} value={expYear} onChange={setExpYear}
                      status={errors.expYear ? {type: 'error', message: errors.expYear} : undefined}
                    />
                    <XDSTextInput
                      label="CVC" isLabelHidden placeholder="CVC"
                      value={cvc} onChange={setCvc}
                      status={errors.cvc ? {type: 'error', message: errors.cvc} : undefined}
                    />
                  </div>
                </XDSVStack>

                <XDSDivider />

                {/* Submit */}
                <XDSVStack gap={3}>
                  <XDSButton label={`Pay now — ${TOTAL}`} variant="primary" size="lg" xstyle={styles.fullWidth} onClick={() => setSubmitted(true)} />
                  <div {...stylex.props(styles.secureNote)}>
                    <XDSText type="supporting" color="secondary">🔒 256-bit SSL · PCI DSS compliant</XDSText>
                  </div>
                  <XDSHStack gap={1} hAlign="center">
                    <XDSText type="supporting" color="secondary">
                      By paying you agree to our{' '}
                      <XDSLink label="Terms" href="#" type="supporting">Terms</XDSLink>
                      {' '}and{' '}
                      <XDSLink label="Privacy Policy" href="#" type="supporting">Privacy Policy</XDSLink>.
                    </XDSText>
                  </XDSHStack>
                </XDSVStack>

              </XDSVStack>
            </div>

            {/* ── Right: order summary (~40%, sticky) ── */}
            <div style={{flex: '1 1 40%', minWidth: 0, position: 'sticky', top: 32}}>
              <XDSCard padding={6}>
                <XDSVStack gap={4}>

                  {ORDER_ITEMS.map(item => (
                    <div key={item.name} {...stylex.props(styles.orderRow)}>
                      <div {...stylex.props(styles.orderThumb)} />
                      <XDSVStack gap={1} style={{flex: 1}}>
                        <XDSText type="body" weight="medium">{item.name}</XDSText>
                        <XDSText type="supporting" color="secondary">{item.variant}</XDSText>
                      </XDSVStack>
                      <XDSVStack gap={0} style={{alignItems: 'flex-end'}}>
                        <XDSText type="supporting" color="secondary">
                          <span {...stylex.props(styles.strikethrough)}>{item.originalPrice}</span>
                        </XDSText>
                        <XDSText type="body" weight="bold">{item.price}</XDSText>
                      </XDSVStack>
                    </div>
                  ))}

                  <XDSDivider />

                  <XDSVStack gap={2}>
                    <div {...stylex.props(styles.summaryRow)}>
                      <XDSText type="supporting" color="secondary">Subtotal</XDSText>
                      <XDSText type="supporting">{TOTAL}</XDSText>
                    </div>
                    <div {...stylex.props(styles.summaryRow)}>
                      <XDSText type="supporting" color="secondary">Shipping</XDSText>
                      <XDSText type="supporting" color="secondary">Calculated at next step</XDSText>
                    </div>
                  </XDSVStack>

                  <XDSDivider />

                  <div {...stylex.props(styles.summaryRow)}>
                    <XDSText type="body" weight="bold">Total</XDSText>
                    <XDSHStack gap={1} vAlign="center">
                      <XDSText type="supporting" color="secondary">USD</XDSText>
                      <XDSText type="large" weight="bold">{TOTAL}</XDSText>
                    </XDSHStack>
                  </div>

                  <XDSText type="supporting" color="secondary">
                    You&apos;re saving {SAVINGS} with ANNUAL10
                  </XDSText>

                </XDSVStack>
              </XDSCard>
            </div>

          </div>
        </div>
      </XDSCenter>
    </XDSAppShell>
  );
}
