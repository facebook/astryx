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
import {XDSNumberInput} from '@xds/core/NumberInput';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSCenter} from '@xds/core/Center';
import {XDSIcon} from '@xds/core/Icon';
import {
  colorVars, spacingVars, radiusVars, typeScaleVars, fontWeightVars,
} from '@xds/core/theme/tokens.stylex';

// ── Constants ─────────────────────────────────────────────────────────────────

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'France', 'Germany', 'Australia', 'Japan', 'Other'];
const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const YEARS = Array.from({length: 12}, (_, i) => String(2025 + i));

const ORDER_ITEMS = [
  {id: '1', name: 'iPhone 15 Pro Max', variant: 'Natural Titanium · 256GB', price: 1199, qty: 1, inStock: true},
  {id: '2', name: 'AirPods Pro 3', variant: 'White', price: 249, qty: 2, inStock: true},
  {id: '3', name: 'Apple Watch Series 11', variant: 'Midnight · 45mm', price: 399, qty: 1, inStock: false},
];

const SUBTOTAL = 2096;
const SHIPPING = 15;
const TAX = 167.68;
const TOTAL = SUBTOTAL + SHIPPING + TAX;
const fmt = (n: number) => `$${n.toFixed(2)}`;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = stylex.create({
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
  fullWidth: {width: '100%'},
  orderThumb: {
    width: 64,
    height: 64,
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-neutral'],
    flexShrink: 0,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trustBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: spacingVars['--spacing-5'],
    flexWrap: 'wrap',
  },
  freeBanner: {
    backgroundColor: colorVars['--color-background-muted'],
    borderRadius: radiusVars['--radius-element'],
    padding: spacingVars['--spacing-3'],
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
});


export default function PaymentFormPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [saveInfo, setSaveInfo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [promo, setPromo] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({'1': 1, '2': 2, '3': 1});
  const [submitted, setSubmitted] = useState(false);

  const errors = submitted ? {
    firstName: !firstName.trim() ? 'Required' : undefined,
    lastName: !lastName.trim() ? 'Required' : undefined,
    address: !address.trim() ? 'Required' : undefined,
    city: !city.trim() ? 'Required' : undefined,
    zip: !zip.trim() ? 'Required' : undefined,
    cardNumber: paymentMethod === 'card' && !cardNumber.trim() ? 'Required' : undefined,
    cardName: paymentMethod === 'card' && !cardName.trim() ? 'Required' : undefined,
  } : {};

  return (
    <XDSAppShell height="auto" contentPadding={0} variant="surface">
      <XDSCenter axis="horizontal">
        <div style={{maxWidth: 1100, width: '100%', padding: '32px 24px'}}>

          {/* Page header */}
          <div style={{marginBottom: 32}}>
            <div style={{fontSize: 56, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 8px'}}>Payment Request</div>
            <XDSText type="body" color="secondary">
              Review your order and complete your purchase. All transactions are secured with 256-bit SSL encryption.
            </XDSText>
            <div style={{marginTop: 24}}><XDSDivider /></div>
          </div>

          <div style={{display: 'flex', gap: 32, alignItems: 'flex-start'}}>

            <div style={{flex: '1 1 55%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16}}>

              <XDSCard padding={5}>
                <XDSVStack gap={1}>
                  <XDSHStack gap={2} hAlign="between" vAlign="center">
                    <div {...stylex.props(styles.sectionTitle)}>Checkout as Guest</div>
                    <XDSButton label="Sign In" variant="secondary" size="sm" onClick={() => {}} />
                  </XDSHStack>
                  <XDSText type="supporting" color="secondary">Sign in to track your order and save your information for faster checkout.</XDSText>
                </XDSVStack>
              </XDSCard>

              <XDSCard padding={5}>
                <XDSVStack gap={4}>
                  <div {...stylex.props(styles.sectionTitle)}>Shipping Information</div>
                  <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
                    <XDSTextInput label="First Name" placeholder="John" value={firstName} onChange={setFirstName} status={errors.firstName ? {type: 'error', message: errors.firstName} : undefined} />
                    <XDSTextInput label="Last Name" placeholder="Doe" value={lastName} onChange={setLastName} status={errors.lastName ? {type: 'error', message: errors.lastName} : undefined} />
                  </div>
                  <XDSTextInput label="Address" placeholder="123 Main Street" value={address} onChange={setAddress} status={errors.address ? {type: 'error', message: errors.address} : undefined} />
                  <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12}}>
                    <XDSTextInput label="City" placeholder="New York" value={city} onChange={setCity} status={errors.city ? {type: 'error', message: errors.city} : undefined} />
                    <XDSTextInput label="ZIP Code" placeholder="10001" value={zip} onChange={setZip} status={errors.zip ? {type: 'error', message: errors.zip} : undefined} />
                    <XDSSelector label="State" placeholder="Select state" options={US_STATES} value={state} onChange={setState} />
                  </div>
                  <XDSTextInput label="Phone Number" placeholder="+1 (555) 123-4567" value={phone} onChange={setPhone} labelTooltip="We use your phone number to provide shipping updates and contact you about your delivery if needed." />
                  <XDSCheckboxInput label="Save this information for next time" value={saveInfo} onChange={setSaveInfo} />
                </XDSVStack>
              </XDSCard>

              <XDSCard padding={5}>
                <XDSVStack gap={5}>
                  <div {...stylex.props(styles.sectionTitle)}>Payment Method</div>

                  {/* Express checkout */}
                  <XDSVStack gap={3}>
                    <XDSText type="supporting" color="secondary" style={{textAlign: 'center'}}>Express checkout</XDSText>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12}}>
                      <button onClick={() => {}} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFC439', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '10px 16px', height: 48}}>
                        <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" alt="PayPal" style={{height: 20, width: 'auto'}} />
                      </button>
                      <button onClick={() => {}} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '10px 16px', height: 48}}>
                        <img src="https://pay.google.com/about/static_kcs/images/logos/google-pay-logo.svg" alt="Google Pay" style={{height: 22, width: 'auto', filter: 'brightness(0) invert(1)'}} />
                      </button>
                      <button onClick={() => {}} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#008CFF', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '10px 16px', height: 48}}>
                        <svg viewBox="0 0 90 24" style={{height: 16, width: 'auto'}} xmlns="http://www.w3.org/2000/svg">
                          <text x="0" y="20" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold" fill="white">venmo</text>
                        </svg>
                      </button>
                    </div>
                  </XDSVStack>

                  {/* OR divider */}
                  <XDSHStack gap={3} vAlign="center">
                    <div style={{flex: 1, height: 1, backgroundColor: 'var(--color-border)'}} />
                    <XDSText type="supporting" color="secondary">OR</XDSText>
                    <div style={{flex: 1, height: 1, backgroundColor: 'var(--color-border)'}} />
                  </XDSHStack>

                  {/* Credit card fields */}
                  <XDSVStack gap={3}>
                    <XDSText type="label">Credit card information</XDSText>
                    <XDSTextInput label="Card Number" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={setCardNumber} status={errors.cardNumber ? {type: 'error', message: errors.cardNumber} : undefined} />
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12}}>
                      <XDSSelector label="Expiry Month" placeholder="MM" options={MONTHS} value={expiry} onChange={setExpiry} />
                      <XDSSelector label="Expiry Year" placeholder="YY" options={YEARS} value={expYear} onChange={setExpYear} />
                      <XDSTextInput label="CVC" placeholder="123" value={cvc} onChange={setCvc} />
                    </div>
                    <XDSTextInput label="Name on Card" placeholder="John Doe" value={cardName} onChange={setCardName} status={errors.cardName ? {type: 'error', message: errors.cardName} : undefined} />
                  </XDSVStack>

                </XDSVStack>
              </XDSCard>

              <XDSCard padding={5}>
                <XDSVStack gap={3}>
                  <div {...stylex.props(styles.sectionTitle)}>Promo Code</div>
                  <XDSHStack gap={2} vAlign="center">
                    <XDSTextInput label="Promo code" isLabelHidden placeholder="Enter promo code" value={promo} onChange={setPromo} xstyle={styles.fullWidth} />
                    <XDSButton label="Apply" variant="secondary" onClick={() => {}} />
                  </XDSHStack>
                </XDSVStack>
              </XDSCard>

            </div>

            <div style={{flex: '1 1 45%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 16, alignSelf: 'flex-start'}}>

              <XDSCard padding={5}>
                <XDSVStack gap={4}>
                  <div {...stylex.props(styles.sectionTitle)}>Order Summary</div>
                  {ORDER_ITEMS.map(item => (
                    <XDSVStack key={item.id} gap={3}>
                      <XDSHStack gap={3} vAlign="start">
                        <div {...stylex.props(styles.orderThumb)} />
                        <XDSVStack gap={1} style={{flex: 1}}>
                          <XDSHStack gap={2} hAlign="between" vAlign="start">
                            <XDSText type="body" weight="medium">{item.name}</XDSText>
                            <XDSText type="body" weight="bold">{fmt(item.price)}</XDSText>
                          </XDSHStack>
                          <XDSText type="supporting" color="secondary">{item.variant}</XDSText>
                          {!item.inStock && <XDSBadge variant="error" label="Out of Stock" />}
                          <XDSHStack gap={2} vAlign="center">
                            <XDSNumberInput label="Qty" isLabelHidden value={quantities[item.id] ?? item.qty} onChange={v => setQuantities(q => ({...q, [item.id]: v}))} min={1} max={10} isIntegerOnly />
                            <XDSLink label="Remove" href="#" type="supporting">Remove</XDSLink>
                            <XDSLink label="Save" href="#" type="supporting">Save</XDSLink>
                          </XDSHStack>
                        </XDSVStack>
                      </XDSHStack>
                      <XDSDivider />
                    </XDSVStack>
                  ))}
                </XDSVStack>
              </XDSCard>

              <XDSCard padding={5}>
                <XDSVStack gap={4}>
                  <div {...stylex.props(styles.sectionTitle)}>Order Total</div>
                  <XDSVStack gap={2}>
                    <div {...stylex.props(styles.summaryRow)}><XDSText type="body" color="secondary">Subtotal</XDSText><XDSText type="body">{fmt(SUBTOTAL)}</XDSText></div>
                    <div {...stylex.props(styles.summaryRow)}><XDSText type="body" color="secondary">Shipping</XDSText><XDSText type="body">{fmt(SHIPPING)}</XDSText></div>
                    <div {...stylex.props(styles.summaryRow)}><XDSText type="body" color="secondary">Tax</XDSText><XDSText type="body">{fmt(TAX)}</XDSText></div>
                  </XDSVStack>
                  <XDSDivider />
                  <div {...stylex.props(styles.summaryRow)}>
                    <XDSText type="large" weight="bold">Total</XDSText>
                    <XDSText type="large" weight="bold">{fmt(TOTAL)}</XDSText>
                  </div>
                  <div {...stylex.props(styles.freeBanner)}>
                    <XDSIcon icon="checkCircle" size="sm" />
                    <XDSText type="supporting">Free shipping on orders over $500</XDSText>
                  </div>
                  <XDSDivider />
                  <div {...stylex.props(styles.trustBar)}>
                    <XDSHStack gap={1} vAlign="center"><XDSIcon icon="checkCircle" size="sm" /><XDSText type="supporting" color="secondary">Secure Payment</XDSText></XDSHStack>
                    <XDSHStack gap={1} vAlign="center"><XDSIcon icon="checkCircle" size="sm" /><XDSText type="supporting" color="secondary">SSL Encrypted</XDSText></XDSHStack>
                    <XDSHStack gap={1} vAlign="center"><XDSIcon icon="checkCircle" size="sm" /><XDSText type="supporting" color="secondary">Free Returns</XDSText></XDSHStack>
                  </div>
                  <XDSButton label="Place Order" variant="primary" size="lg" xstyle={styles.fullWidth} onClick={() => setSubmitted(true)} />
                  <XDSButton label="Continue Shopping" variant="secondary" size="lg" xstyle={styles.fullWidth} onClick={() => {}} />
                </XDSVStack>
              </XDSCard>

            </div>
          </div>
        </div>
      </XDSCenter>
    </XDSAppShell>
  );
}
