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
                    <XDSButton label="Pay with saved card" variant="secondary" size="lg" style={{flex: 1}} onClick={() => {}} />

                    {/* PayPal — yellow brand button, logo only as icon */}
                    <button
                      onClick={() => {}}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#FFC439',
                        border: '1px solid #FFC439',
                        borderRadius: 'var(--radius-element)',
                        cursor: 'pointer',
                        padding: '0 16px',
                        height: 36,
                      }}>
                      {/* PayPal wordmark SVG */}
                      <svg viewBox="0 0 100 27" style={{height: 18, width: 'auto'}} xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.237 2.9H6.404C6.05 2.9 5.75 3.16 5.7 3.51L3.2 19.41c-.04.26.16.5.42.5h2.74c.35 0 .65-.26.7-.61l.67-4.24c.05-.35.35-.61.7-.61h1.84c3.84 0 6.06-1.86 6.64-5.54.26-1.61.01-2.87-.74-3.75-.82-.98-2.28-1.26-3.91-1.26zm.67 5.46c-.32 2.09-1.92 2.09-3.47 2.09h-.88l.62-3.91c.04-.21.22-.37.44-.37h.4c1.06 0 2.05 0 2.57.6.31.36.4.89.32 1.59z" fill="#003087"/>
                        <path d="M31.457 8.28h-2.75c-.22 0-.4.16-.44.37l-.11.72-.18-.26c-.56-.81-1.8-1.08-3.05-1.08-2.86 0-5.3 2.17-5.78 5.21-.25 1.52.1 2.97.96 3.98.79.93 1.91 1.31 3.25 1.31 2.31 0 3.59-1.48 3.59-1.48l-.11.71c-.04.26.16.5.42.5h2.48c.35 0 .65-.26.7-.61l1.49-9.43c.04-.27-.16-.44-.47-.44zm-3.84 5.04c-.25 1.48-1.42 2.47-2.92 2.47-.75 0-1.35-.24-1.74-.69-.38-.45-.53-1.09-.41-1.8.23-1.47 1.42-2.49 2.9-2.49.73 0 1.33.24 1.73.7.4.46.56 1.1.44 1.81z" fill="#003087"/>
                        <path d="M46.857 8.28h-2.76c-.25 0-.48.12-.62.33l-3.58 5.27-1.52-5.07c-.1-.32-.39-.53-.72-.53h-2.71c-.29 0-.5.29-.4.56l2.86 8.4-2.69 3.79c-.2.28.01.66.35.66h2.75c.25 0 .47-.12.62-.32l8.64-12.48c.2-.27-.01-.66-.32-.61z" fill="#003087"/>
                        <path d="M56.637 2.9h-5.83c-.35 0-.65.26-.7.61l-2.5 15.9c-.04.26.16.5.42.5h2.94c.24 0 .45-.18.49-.42l.71-4.43c.05-.35.35-.61.7-.61h1.84c3.84 0 6.06-1.86 6.64-5.54.26-1.61.01-2.87-.74-3.75-.82-.97-2.27-1.26-3.97-1.26zm.67 5.46c-.32 2.09-1.92 2.09-3.47 2.09h-.88l.62-3.91c.04-.21.22-.37.44-.37h.4c1.06 0 2.05 0 2.57.6.31.36.41.89.32 1.59z" fill="#009cde"/>
                        <path d="M75.857 8.28h-2.75c-.22 0-.4.16-.44.37l-.11.72-.18-.26c-.56-.81-1.8-1.08-3.05-1.08-2.86 0-5.3 2.17-5.78 5.21-.25 1.52.1 2.97.96 3.98.79.93 1.91 1.31 3.25 1.31 2.31 0 3.59-1.48 3.59-1.48l-.11.71c-.04.26.16.5.42.5h2.48c.35 0 .65-.26.7-.61l1.49-9.43c.04-.27-.16-.44-.47-.44zm-3.84 5.04c-.25 1.48-1.42 2.47-2.92 2.47-.75 0-1.35-.24-1.74-.69-.38-.45-.53-1.09-.41-1.8.23-1.47 1.42-2.49 2.9-2.49.73 0 1.33.24 1.73.7.4.46.56 1.1.44 1.81z" fill="#009cde"/>
                        <path d="M80.337 3.22l-2.54 16.19c-.04.26.16.5.42.5h2.37c.35 0 .65-.26.7-.61l2.5-15.9c.04-.26-.16-.5-.42-.5h-2.61c-.21.01-.38.14-.42.32z" fill="#009cde"/>
                      </svg>
                    </button>

                    {/* Google Pay — white button, official GPay logo */}
                    <button
                      onClick={() => {}}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        border: '1px solid #dadce0',
                        borderRadius: 'var(--radius-element)',
                        cursor: 'pointer',
                        padding: '0 16px',
                        height: 36,
                      }}>
                      {/* Google Pay wordmark */}
                      <svg viewBox="0 0 41 17" style={{height: 17, width: 'auto'}} xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.Mobile" fill="none"/>
                        <g>
                          <path d="M.434 14.463V2.537h4.316c1.16 0 2.145.39 2.955 1.17.825.78 1.238 1.73 1.238 2.848 0 1.133-.413 2.09-1.238 2.87-.81.764-1.796 1.146-2.955 1.146H2.003v3.892H.434zM2.003 3.97v5.166h2.78c.725 0 1.33-.252 1.813-.757.483-.504.725-1.1.725-1.786 0-.672-.242-1.26-.725-1.764-.483-.505-1.088-.758-1.813-.758H2.003z" fill="#4285F4"/>
                          <path d="M14.237 6.205c1.269 0 2.27.34 3.005 1.02.735.68 1.102 1.61 1.102 2.788v5.45h-1.49v-1.228h-.072c-.71 1.012-1.655 1.518-2.836 1.518-.734 0-1.437-.218-2.107-.653a2.61 2.61 0 01-1.006-2.133c0-.9.34-1.617 1.02-2.15.68-.533 1.586-.8 2.716-.8 1.066 0 1.943.193 2.63.58v-.41c0-.62-.247-1.15-.74-1.59-.494-.44-1.076-.66-1.747-.66-.997 0-1.788.42-2.374 1.26l-1.37-.866c.83-1.19 2.067-1.786 3.71-1.786zm-2.182 6.82c0 .412.178.75.532 1.013.354.264.762.396 1.222.396.663 0 1.25-.245 1.764-.734.515-.49.772-1.064.772-1.724-.49-.386-1.172-.58-2.047-.58-.637 0-1.168.153-1.593.46-.425.306-.65.698-.65 1.17z" fill="#4285F4"/>
                          <path d="M26.896 6.494l-4.944 11.372H20.34l1.835-3.964-3.25-7.408h1.69l2.35 5.675h.033l2.29-5.675h1.607z" fill="#4285F4"/>
                          <path d="M10.256 8.386a5.463 5.463 0 00-.087-.997H5.307v1.887h2.779a2.376 2.376 0 01-1.02 1.558v1.295h1.65c.967-.89 1.54-2.202 1.54-3.743z" fill="#4285F4"/>
                          <path d="M5.307 14.463c1.392 0 2.562-.46 3.416-1.247l-1.65-1.295c-.461.31-1.05.492-1.766.492-1.358 0-2.509-.917-2.922-2.15H.682v1.337a5.157 5.157 0 004.625 2.863z" fill="#34A853"/>
                          <path d="M2.385 10.263a3.1 3.1 0 010-1.982V6.944H.682a5.17 5.17 0 000 4.656l1.703-1.337z" fill="#FBBC05"/>
                          <path d="M5.307 6.131c.765 0 1.451.263 1.991.778l1.492-1.492C7.862 4.538 6.7 4.05 5.307 4.05A5.157 5.157 0 00.682 6.944L2.385 8.28c.413-1.233 1.564-2.15 2.922-2.15z" fill="#EA4335"/>
                        </g>
                      </svg>
                    </button>
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
