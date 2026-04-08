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
const SUBTOTAL = '$299.00';
const TOTAL = '$299.00';
const SAVINGS = '$60.00';

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = stylex.create({
  page: {
    minHeight: '100svh',
    backgroundColor: colorVars['--color-background-surface'],
  },
  inner: {
    maxWidth: 560,
    margin: '0 auto',
    paddingTop: spacingVars['--spacing-10'],
    paddingBottom: spacingVars['--spacing-10'],
    paddingLeft: spacingVars['--spacing-6'],
    paddingRight: spacingVars['--spacing-6'],
  },
  displayHeading: {
    fontSize: '40px',
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
 * Payment Form — single-column checkout template.
 *
 * Sections (top to bottom):
 *   1. Header: title + description + divider
 *   2. Order summary card
 *   3. Express checkout + OR divider
 *   4. Contact
 *   5. Shipping (with Ship/Pickup toggle)
 *   6. Payment
 *   7. Submit + legal
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
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.inner)}>
        <XDSVStack gap={8}>

          {/* ── 1. Header ── */}
          <XDSVStack gap={2}>
            <div {...stylex.props(styles.displayHeading)}>Payment Request</div>
            <XDSText type="body" color="secondary">
              Complete your purchase securely. All transactions are encrypted
              and your card details are never stored.
            </XDSText>
          </XDSVStack>

          <XDSDivider />

          {/* ── 2. Order summary ── */}
          <XDSCard padding={5}>
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
                  <XDSText type="supporting">{SUBTOTAL}</XDSText>
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

              <XDSHStack gap={1} vAlign="center">
                <XDSText type="supporting" color="secondary">
                  You&apos;re saving {SAVINGS} with ANNUAL10
                </XDSText>
              </XDSHStack>
            </XDSVStack>
          </XDSCard>

          {/* ── 3. Express checkout ── */}
          <XDSVStack gap={3}>
            <XDSButton
              label="Pay with saved card"
              variant="secondary"
              size="lg"
              xstyle={styles.fullWidth}
              onClick={() => {}}
            />
            <div {...stylex.props(styles.orDivider)}>
              <div {...stylex.props(styles.orLine)} />
              <XDSText type="supporting" color="secondary">OR</XDSText>
              <div {...stylex.props(styles.orLine)} />
            </div>
          </XDSVStack>

          {/* ── 4. Contact ── */}
          <XDSVStack gap={4}>
            <div {...stylex.props(styles.sectionHeader)}>
              <div {...stylex.props(styles.sectionTitle)}>Contact</div>
              <XDSLink label="Sign in" href="#" type="supporting">Sign in</XDSLink>
            </div>
            <XDSTextInput
              label="Email or phone number"
              isLabelHidden
              placeholder="Email or phone number"
              value={contact}
              onChange={setContact}
              status={errors.contact ? {type: 'error', message: errors.contact} : undefined}
            />
            <XDSCheckboxInput
              label="Email me with news and offers"
              value={false}
              onChange={() => {}}
            />
          </XDSVStack>

          <XDSDivider />

          {/* ── 5. Shipping ── */}
          <XDSVStack gap={4}>
            <div {...stylex.props(styles.sectionTitle)}>Shipping</div>
            <XDSSegmentedControl
              label="Delivery mode"
              value={deliveryMode}
              onChange={setDeliveryMode}>
              <XDSSegmentedControlItem value="ship" label="Ship" />
              <XDSSegmentedControlItem value="pickup" label="Pick up" />
            </XDSSegmentedControl>

            {deliveryMode === 'ship' && (
              <XDSVStack gap={3}>
                <XDSSelector
                  label="Country / Region"
                  placeholder="Country / Region"
                  options={COUNTRIES}
                  value={country}
                  onChange={setCountry}
                  status={errors.country ? {type: 'error', message: errors.country} : undefined}
                />
                <div {...stylex.props(styles.inlineGrid)}>
                  <XDSTextInput
                    label="First name (optional)"
                    isLabelHidden
                    placeholder="First name (optional)"
                    value={firstName}
                    onChange={setFirstName}
                  />
                  <XDSTextInput
                    label="Last name"
                    isLabelHidden
                    placeholder="Last name"
                    value={lastName}
                    onChange={setLastName}
                    status={errors.lastName ? {type: 'error', message: errors.lastName} : undefined}
                  />
                </div>
                <XDSTextInput
                  label="Address"
                  isLabelHidden
                  placeholder="Address"
                  value={address}
                  onChange={setAddress}
                  status={errors.address ? {type: 'error', message: errors.address} : undefined}
                />
                <XDSTextInput
                  label="Apartment, suite, etc. (optional)"
                  isLabelHidden
                  placeholder="Apartment, suite, etc. (optional)"
                  value={apt}
                  onChange={setApt}
                />
                <div {...stylex.props(styles.inlineGrid)}>
                  <XDSTextInput
                    label="ZIP code"
                    isLabelHidden
                    placeholder="ZIP code"
                    value={zip}
                    onChange={setZip}
                    status={errors.zip ? {type: 'error', message: errors.zip} : undefined}
                  />
                  <XDSTextInput
                    label="City"
                    isLabelHidden
                    placeholder="City"
                    value={city}
                    onChange={setCity}
                    status={errors.city ? {type: 'error', message: errors.city} : undefined}
                  />
                </div>
                <XDSTextInput
                  label="State"
                  isLabelHidden
                  placeholder="State"
                  value={state}
                  onChange={setState}
                />
              </XDSVStack>
            )}

            {deliveryMode === 'pickup' && (
              <XDSCard padding={4}>
                <XDSText type="supporting" color="secondary">
                  Select a pickup location at the next step after entering your ZIP code.
                </XDSText>
              </XDSCard>
            )}

            <XDSCheckboxInput
              label="Save my information for next time"
              value={saveInfo}
              onChange={setSaveInfo}
            />
          </XDSVStack>

          <XDSDivider />

          {/* ── 6. Payment ── */}
          <XDSVStack gap={4}>
            <div {...stylex.props(styles.sectionTitle)}>Payment</div>
            <XDSTextInput
              label="Card number"
              isLabelHidden
              placeholder="Card number"
              value={cardNumber}
              onChange={setCardNumber}
              status={errors.cardNumber ? {type: 'error', message: errors.cardNumber} : undefined}
            />
            <XDSTextInput
              label="Name on card"
              isLabelHidden
              placeholder="Name on card"
              value={cardName}
              onChange={setCardName}
              status={errors.cardName ? {type: 'error', message: errors.cardName} : undefined}
            />
            <div {...stylex.props(styles.expGrid)}>
              <XDSSelector
                label="Expiry month"
                placeholder="MM"
                options={MONTHS}
                value={expMonth}
                onChange={setExpMonth}
                status={errors.expMonth ? {type: 'error', message: errors.expMonth} : undefined}
              />
              <XDSSelector
                label="Expiry year"
                placeholder="YY"
                options={YEARS}
                value={expYear}
                onChange={setExpYear}
                status={errors.expYear ? {type: 'error', message: errors.expYear} : undefined}
              />
              <XDSTextInput
                label="CVC"
                isLabelHidden
                placeholder="CVC"
                value={cvc}
                onChange={setCvc}
                status={errors.cvc ? {type: 'error', message: errors.cvc} : undefined}
              />
            </div>
          </XDSVStack>

          <XDSDivider />

          {/* ── 7. Submit ── */}
          <XDSVStack gap={3}>
            <XDSButton
              label={`Pay now — ${TOTAL}`}
              variant="primary"
              size="lg"
              xstyle={styles.fullWidth}
              onClick={() => setSubmitted(true)}
            />
            <div {...stylex.props(styles.secureNote)}>
              <XDSText type="supporting" color="secondary">
                🔒 256-bit SSL · PCI DSS compliant
              </XDSText>
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
    </div>
  );
}
