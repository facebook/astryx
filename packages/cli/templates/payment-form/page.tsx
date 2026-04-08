'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
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
  const [email, setEmail] = useState('');
  const [emailOffers, setEmailOffers] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [expYear, setExpYear] = useState('');
  const [billingMatchesShipping, setBillingMatchesShipping] = useState(true);
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
                  {/* Contact information */}
                  <div {...stylex.props(styles.sectionTitle)}>Contact Information</div>
                  <XDSTextInput size="lg" label="Email" placeholder="you@example.com" value={email} onChange={setEmail} />
                  <XDSCheckboxInput label="Email me with news and offers" value={emailOffers} onChange={setEmailOffers} />

                  <XDSDivider />

                  <div {...stylex.props(styles.sectionTitle)}>Shipping Information</div>
                  <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
                    <XDSTextInput size="lg" label="First Name" placeholder="John" value={firstName} onChange={setFirstName} status={errors.firstName ? {type: 'error', message: errors.firstName} : undefined} />
                    <XDSTextInput size="lg" label="Last Name" placeholder="Doe" value={lastName} onChange={setLastName} status={errors.lastName ? {type: 'error', message: errors.lastName} : undefined} />
                  </div>
                  <XDSTextInput size="lg" label="Address" placeholder="123 Main Street" value={address} onChange={setAddress} status={errors.address ? {type: 'error', message: errors.address} : undefined} />
                  <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12}}>
                    <XDSTextInput size="lg" label="City" placeholder="New York" value={city} onChange={setCity} status={errors.city ? {type: 'error', message: errors.city} : undefined} />
                    <XDSTextInput size="lg" label="ZIP Code" placeholder="10001" value={zip} onChange={setZip} status={errors.zip ? {type: 'error', message: errors.zip} : undefined} />
                    <XDSSelector size="lg" label="State" placeholder="Select state" options={US_STATES} value={state} onChange={setState} />
                  </div>
                  <XDSTextInput size="lg" label="Phone Number" placeholder="+1 (555) 123-4567" value={phone} onChange={setPhone} labelTooltip="We use your phone number to provide shipping updates and contact you about your delivery if needed." />
                  <XDSDivider />

                  {/* Delivery */}
                  <div {...stylex.props(styles.sectionTitle)}>Delivery</div>
                  <XDSText type="supporting" color="secondary">
                    Please allow 1–3 business days processing time before your order ships. Thank you for your patience.
                  </XDSText>
                  <XDSRadioList label="Delivery method" value={deliveryMethod} onChange={setDeliveryMethod}>
                    <XDSRadioListItem value="standard" label="Standard (3–7 business days)" endContent={<XDSText type="body" weight="medium">$4.95</XDSText>} />
                    <XDSRadioListItem value="expedited" label="Expedited (1–2 business days)" endContent={<XDSText type="body" weight="medium">$9.95</XDSText>} />
                  </XDSRadioList>

                  <XDSDivider />

                  <XDSCheckboxInput label="Save this information for next time" value={saveInfo} onChange={setSaveInfo} />
                </XDSVStack>
              </XDSCard>

              <XDSCard padding={5}>
                <XDSVStack gap={5}>
                  <div {...stylex.props(styles.sectionTitle)}>Payment Method</div>
                  <XDSText type="supporting" color="secondary">All transactions are secure and encrypted.</XDSText>

                  {/* Express checkout */}
                  <XDSVStack gap={3}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12}}>
                      <button onClick={() => {}} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFC439', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '10px 16px', height: 48}}>
                        <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" alt="PayPal" style={{height: 20, width: 'auto'}} />
                      </button>
                      <button onClick={() => {}} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '10px 16px', height: 48}}>
                        <img src="https://pay.google.com/about/static_kcs/images/logos/google-pay-logo.svg" alt="Google Pay" style={{height: 22, width: 'auto', filter: 'brightness(0) invert(1)'}} />
                      </button>
                      <button onClick={() => {}} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#008CFF', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '10px 16px', height: 48}}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Venmo_logo_2021.svg/320px-Venmo_logo_2021.svg.png" alt="Venmo" style={{height: 20, width: 'auto', filter: 'brightness(0) invert(1)'}} />
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
                    {/* Card type icons */}
                    <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                      {/* Visa */}
                      <div style={{border: '1px solid var(--color-border)', borderRadius: 6, padding: '4px 8px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, minWidth: 48}}>
                        <svg viewBox="0 0 780 500" style={{height: 16, width: 'auto'}} xmlns="http://www.w3.org/2000/svg">
                          <path d="M293.2 348.7l33.4-195.7h53.4l-33.4 195.7h-53.4zm246.7-191c-10.6-3.9-27.1-8.1-47.8-8.1-52.7 0-89.8 26.5-90.1 64.4-.3 28 26.6 43.6 46.9 52.9 20.8 9.6 27.8 15.7 27.7 24.2-.1 13.1-16.6 19.1-32 19.1-21.4 0-32.7-2.9-50.3-10.1l-6.9-3.1-7.5 43.6c12.5 5.4 35.6 10.2 59.6 10.4 56.3 0 92.7-26.2 93.1-66.8.2-22.2-14.1-39.2-44.9-53.1-18.7-9-30.2-15-30.1-24.1 0-8.1 9.7-16.7 30.7-16.7 17.5-.3 30.2 3.5 40.1 7.4l4.8 2.3 7.7-44.3zm138.2-4.7h-41.1c-12.7 0-22.3 3.5-27.8 16.1l-79 179.6h55.8l11.2-29.2 68.1.1 6.3 29.1h49.2l-42.7-195.7zm-65.5 128.7l20.8-53.6c-.3.5 4.3-11.1 6.9-18.3l3.5 16.5 12 55.4h-43.2zm-368.3-128.7l-52.3 133.5-5.6-27c-9.7-31.1-40-64.8-73.8-81.6l47.8 171.5 56.5-.1 84-196.3h-56.6z" fill="#1A1F71"/>
                          <path d="M153.2 152.9H67.5l-.6 4.1c66.7 16.1 110.8 54.9 129.1 101.6l-18.6-89.3c-3.2-12.3-12.6-16-24.2-16.4z" fill="#F9A533"/>
                        </svg>
                      </div>
                      {/* Mastercard */}
                      <div style={{border: '1px solid var(--color-border)', borderRadius: 6, padding: '4px 8px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, minWidth: 48}}>
                        <svg viewBox="0 0 38 24" style={{height: 18, width: 'auto'}} xmlns="http://www.w3.org/2000/svg">
                          <circle cx="15" cy="12" r="9" fill="#EB001B"/>
                          <circle cx="23" cy="12" r="9" fill="#F79E1B"/>
                          <path d="M19 5.9A9 9 0 0123 12a9 9 0 01-4 6.1A9 9 0 0115 12a9 9 0 014-6.1z" fill="#FF5F00"/>
                        </svg>
                      </div>
                      {/* Amex */}
                      <div style={{border: '1px solid var(--color-border)', borderRadius: 6, padding: '4px 8px', backgroundColor: '#2E77BC', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, minWidth: 48}}>
                        <svg viewBox="0 0 50 16" style={{height: 12, width: 'auto'}} xmlns="http://www.w3.org/2000/svg">
                          <text x="0" y="13" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="bold" fill="white" letterSpacing="1">AMEX</text>
                        </svg>
                      </div>
                      {/* Discover */}
                      <div style={{border: '1px solid var(--color-border)', borderRadius: 6, padding: '4px 8px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, minWidth: 48}}>
                        <svg viewBox="0 0 780 500" style={{height: 16, width: 'auto'}} xmlns="http://www.w3.org/2000/svg">
                          <path d="M535 250c0 79.9-64.9 144.7-145 144.7S245 329.9 245 250s64.9-144.7 145-144.7S535 170.1 535 250z" fill="#F76F20"/>
                          <path d="M780 433.7c0 36.6-29.7 66.3-66.3 66.3H66.3C29.7 500 0 470.3 0 433.7V66.3C0 29.7 29.7 0 66.3 0h647.4C750.3 0 780 29.7 780 66.3v367.4z" fill="none"/>
                          <text x="140" y="295" fontFamily="Arial" fontSize="120" fontWeight="bold" fill="#231F20">D</text>
                        </svg>
                      </div>
                      {/* JCB */}
                      <div style={{border: '1px solid var(--color-border)', borderRadius: 6, padding: '4px 8px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, minWidth: 48}}>
                        <svg viewBox="0 0 50 16" style={{height: 12, width: 'auto'}} xmlns="http://www.w3.org/2000/svg">
                          <text x="2" y="13" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="bold" fill="#003087">JCB</text>
                        </svg>
                      </div>
                    </div>
                    <div style={{position: 'relative'}}>
                      <XDSTextInput size="lg" label="Card Number" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={setCardNumber} status={errors.cardNumber ? {type: 'error', message: errors.cardNumber} : undefined} />
                      <div style={{position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center'}}>
                        <svg viewBox="0 0 24 24" style={{width: 16, height: 16, color: 'var(--color-icon-secondary)'}} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                      </div>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12}}>
                      <XDSSelector size="lg" label="Expiry Month" placeholder="MM" options={MONTHS} value={expiry} onChange={setExpiry} />
                      <XDSSelector size="lg" label="Expiry Year" placeholder="YY" options={YEARS} value={expYear} onChange={setExpYear} />
                      <XDSTextInput size="lg" label="CVC" placeholder="123" value={cvc} onChange={setCvc} labelTooltip="3-digit security code usually found on the back of your card. American Express cards have a 4-digit code located on the front." />
                    </div>
                    <XDSTextInput size="lg" label="Name on Card" placeholder="John Doe" value={cardName} onChange={setCardName} status={errors.cardName ? {type: 'error', message: errors.cardName} : undefined} />
                    <XDSCheckboxInput label="Use shipping address as billing address" value={billingMatchesShipping} onChange={setBillingMatchesShipping} />
                  </XDSVStack>

                </XDSVStack>
              </XDSCard>

              <XDSCard padding={5}>
                <XDSVStack gap={3}>
                  <div {...stylex.props(styles.sectionTitle)}>Promo Code</div>
                  <XDSHStack gap={2} vAlign="center">
                    <XDSTextInput size="lg" label="Promo code" isLabelHidden placeholder="Enter promo code" value={promo} onChange={setPromo} xstyle={styles.fullWidth} />
                    <XDSButton label="Apply" variant="secondary" size="lg" onClick={() => {}} />
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
