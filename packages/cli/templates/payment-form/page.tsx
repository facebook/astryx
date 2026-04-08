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
import pinkTeddyImg from './pink-teddy.png';
import redHeartImg from './red-heart.png';
import beagleImg from './beagle.png';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {XDSNumberInput} from '@xds/core/NumberInput';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSCenter} from '@xds/core/Center';
import {
  colorVars, spacingVars, radiusVars, typeScaleVars, fontWeightVars,
} from '@xds/core/theme/tokens.stylex';

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const YEARS = Array.from({length: 12}, (_, i) => String(2025 + i));

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];


const ITEM_IMAGES: Record<string, {src: string}> = {'1': pinkTeddyImg, '2': redHeartImg, '3': beagleImg};

const ORDER_ITEMS = [
  {id: '1', name: 'Pink Teddy Keychain', variant: 'Soft plush keychain · One size', price: 75, qty: 1, limited: false},
  {id: '2', name: 'Red Heart Keychain', variant: 'Velvet finish · One size', price: 75, qty: 1, limited: false},
  {id: '3', name: 'Beagle Keychain', variant: 'Hand-painted resin · One size', price: 80, qty: 1, limited: true},
];

const SUBTOTAL = 230;
// SHIPPING is now computed from deliveryMethod state
const TAX = 18.40;
// TOTAL is computed dynamically based on delivery selection
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
    backgroundColor: colorVars['--color-background-blue'],
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
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const [billingState, setBillingState] = useState('');
  const [addGiftMessage, setAddGiftMessage] = useState(false);
  const [giftTo, setGiftTo] = useState('');
  const [giftFrom, setGiftFrom] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [promo, setPromo] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({'1': 1, '2': 1, '3': 1});
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

                  <XDSCheckboxInput label="Save my information for a faster checkout" value={saveInfo} onChange={setSaveInfo} />
                </XDSVStack>
              </XDSCard>

              <XDSCard padding={5}>
                <XDSVStack gap={5}>
                  <div {...stylex.props(styles.sectionTitle)}>Payment Method</div>
                  <XDSText type="supporting" color="secondary">All transactions are secure and encrypted.</XDSText>

                  {/* Express checkout */}
                  <XDSVStack gap={3}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12}}>
                      <button onClick={() => {}} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFC439', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '0 16px', height: 36}}>
                        <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" alt="PayPal" style={{height: 20, width: 'auto'}} />
                      </button>
                      <button onClick={() => {}} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '0 16px', height: 36}}>
                        <img src="https://pay.google.com/about/static_kcs/images/logos/google-pay-logo.svg" alt="Google Pay" style={{height: 22, width: 'auto', filter: 'brightness(0) invert(1)'}} />
                      </button>
                      <button onClick={() => {}} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#008CFF', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '0 16px', height: 36}}>
                        <svg viewBox="0 0 111 28" xmlns="http://www.w3.org/2000/svg" style={{height: 16, width: "auto"}}><path d="M15.2.5c1 1.7 1.5 3.4 1.5 5.6 0 7-6 16.1-10.9 22.5H0L-2.4 1.2l8.7-.8 1.3 10.5c1.2-2 2.7-5.1 2.7-7.2 0-1.2-.2-2-.5-2.7L15.2.5zm16.6 0c2.6 0 5.3 1.3 5.3 5.5 0 5.4-3.6 11-6.1 14.2l-1.3-13.6c-.2-2.1.3-5.6-5.5-5.6l8.1-4.5z" fill="white" transform="translate(5,2)"/><text x="38" y="22" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700" fill="white" letterSpacing="0.5">venmo</text></svg>
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
                    <div style={{display: 'flex', gap: 6, alignItems: 'center'}}>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" style={{height: 10, width: 'auto', border: '1px solid var(--color-border)', borderRadius: 4, padding: '5px 8px', backgroundColor: '#1A1F71', boxSizing: 'content-box'}} />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" style={{height: 20, width: 'auto', border: '1px solid var(--color-border)', borderRadius: 4, padding: '2px 6px', backgroundColor: '#fff', boxSizing: 'content-box'}} />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png" alt="Amex" style={{height: 20, width: 'auto', border: '1px solid var(--color-border)', borderRadius: 4, padding: '2px 6px', backgroundColor: '#016FD0', boxSizing: 'content-box'}} />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Discover_Card_logo.svg/200px-Discover_Card_logo.svg.png" alt="Discover" style={{height: 20, width: 'auto', border: '1px solid var(--color-border)', borderRadius: 4, padding: '2px 6px', backgroundColor: '#fff', boxSizing: 'content-box'}} />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/JCB_logo.svg/200px-JCB_logo.svg.png" alt="JCB" style={{height: 20, width: 'auto', border: '1px solid var(--color-border)', borderRadius: 4, padding: '2px 6px', backgroundColor: '#fff', boxSizing: 'content-box'}} />
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
                    {!billingMatchesShipping && (
                      <XDSVStack gap={3}>
                        <XDSTextInput size="lg" label="Address" placeholder="123 Main Street" value={billingAddress} onChange={setBillingAddress} />
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12}}>
                          <XDSTextInput size="lg" label="City" placeholder="New York" value={billingCity} onChange={setBillingCity} />
                          <XDSTextInput size="lg" label="ZIP Code" placeholder="10001" value={billingZip} onChange={setBillingZip} />
                          <XDSSelector size="lg" label="State" placeholder="Select state" options={US_STATES} value={billingState} onChange={setBillingState} />
                        </div>
                      </XDSVStack>
                    )}
                  </XDSVStack>

                </XDSVStack>
              </XDSCard>

              <XDSCard padding={5}>
                <XDSVStack gap={5}>

                  {/* Promo Code */}
                  <XDSVStack gap={3}>
                    <div {...stylex.props(styles.sectionTitle)}>Promo Code</div>
                    <XDSHStack gap={2} vAlign="center">
                      <XDSTextInput size="lg" label="Promo code" isLabelHidden placeholder="Enter promo code" value={promo} onChange={setPromo} xstyle={styles.fullWidth} />
                      <XDSButton label="Apply" variant="secondary" size="lg" onClick={() => {}} />
                    </XDSHStack>
                  </XDSVStack>

                  <XDSDivider />

                  {/* Gift Options */}
                  <XDSVStack gap={3}>
                    <div {...stylex.props(styles.sectionTitle)}>Gift Options</div>
                    <XDSCheckboxInput
                      label="Add a gift message"
                      value={addGiftMessage}
                      onChange={setAddGiftMessage}
                    />
                    {addGiftMessage && (
                      <XDSVStack gap={3}>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
                          <XDSTextInput size="lg" label="To" isLabelHidden placeholder="To" value={giftTo} onChange={setGiftTo} />
                          <XDSTextInput size="lg" label="From" isLabelHidden placeholder="From" value={giftFrom} onChange={setGiftFrom} />
                        </div>
                        <XDSTextArea
                          label="Gift message"
                          isLabelHidden
                          placeholder="Write something here"
                          value={giftMessage}
                          onChange={setGiftMessage}
                        />
                      </XDSVStack>
                    )}
                  </XDSVStack>

                </XDSVStack>
              </XDSCard>

              {/* Policy links */}
              <XDSHStack gap={4} vAlign="center">
                <XDSLink label="Refund policy" href="#" type="supporting">Refund policy</XDSLink>
                <XDSLink label="Privacy policy" href="#" type="supporting">Privacy policy</XDSLink>
                <XDSLink label="Terms of service" href="#" type="supporting">Terms of service</XDSLink>
                <XDSLink label="Cancellations" href="#" type="supporting">Cancellations</XDSLink>
              </XDSHStack>

            </div>

            <div style={{flex: '1 1 45%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 16, alignSelf: 'flex-start'}}>

              <XDSCard padding={5}>
                <XDSVStack gap={4}>
                  <div {...stylex.props(styles.sectionTitle)}>Order Summary</div>

                  {/* Line items */}
                  {ORDER_ITEMS.map(item => (
                    <XDSVStack key={item.id} gap={3}>
                      <XDSHStack gap={3} vAlign="start">
                        {/* Placeholder thumbnail */}
                        <div {...stylex.props(styles.orderThumb)} style={{overflow: 'hidden'}}>
                          <img src={(ITEM_IMAGES[item.id] as {src: string}).src} alt={item.name} style={{width: 64, height: 64, objectFit: "cover", borderRadius: 8}} />
                        </div>
                        <XDSVStack gap={1} style={{flex: 1}}>
                          <XDSHStack gap={2} hAlign="between" vAlign="start">
                            <XDSHStack gap={2} vAlign="center">
                              <XDSText type="body" weight="medium">{item.name}</XDSText>
                              {item.limited && <XDSBadge variant="green" label="LIMITED EDITION" />}
                            </XDSHStack>
                            <XDSText type="body" weight="bold">{fmt(item.price)}</XDSText>
                          </XDSHStack>
                          <XDSText type="supporting" color="secondary">{item.variant}</XDSText>
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

                  {/* Order total subsection */}
                  <XDSVStack gap={3}>
                    <div {...stylex.props(styles.sectionTitle)}>Order Total</div>
                    <XDSVStack gap={2}>
                      <div {...stylex.props(styles.summaryRow)}><XDSText type="body" color="secondary">Subtotal</XDSText><XDSText type="body">{fmt(SUBTOTAL)}</XDSText></div>
                      <div {...stylex.props(styles.summaryRow)}><XDSText type="body" color="secondary">Shipping</XDSText><XDSText type="body">{fmt(deliveryMethod === 'expedited' ? 9.95 : 4.95)}</XDSText></div>
                      <div {...stylex.props(styles.summaryRow)}><XDSText type="body" color="secondary">Tax</XDSText><XDSText type="body">{fmt(TAX)}</XDSText></div>
                    </XDSVStack>
                    <XDSDivider />
                    <div {...stylex.props(styles.summaryRow)}>
                      <XDSText type="large" weight="bold">Total</XDSText>
                      <XDSText type="large" weight="bold">{fmt(SUBTOTAL + (deliveryMethod === 'expedited' ? 9.95 : 4.95) + TAX)}</XDSText>
                    </div>
                    <div {...stylex.props(styles.freeBanner)}>
                      <svg viewBox="0 0 24 24" style={{width: 16, height: 16, flexShrink: 0}} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13" rx="1"/>
                        <path d="M16 8h4l3 5v4h-7V8z"/>
                        <circle cx="5.5" cy="18.5" r="2.5"/>
                        <circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                      <XDSText type="supporting">Free shipping on orders over $300</XDSText>
                    </div>
                  </XDSVStack>

                  <XDSDivider />
                  <div {...stylex.props(styles.trustBar)}>
                    <XDSHStack gap={1} vAlign="center">
                      <svg viewBox="0 0 24 24" style={{width: 14, height: 14}} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <XDSText type="supporting" color="secondary">Secure Payment</XDSText>
                    </XDSHStack>
                    <XDSHStack gap={1} vAlign="center">
                      <svg viewBox="0 0 24 24" style={{width: 14, height: 14}} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                      <XDSText type="supporting" color="secondary">SSL Encrypted</XDSText>
                    </XDSHStack>
                    <XDSHStack gap={1} vAlign="center"><svg viewBox="0 0 24 24" style={{width: 14, height: 14}} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg><XDSText type="supporting" color="secondary">Free Returns</XDSText></XDSHStack>
                  </div>
                  <XDSVStack gap={2}>
                    <XDSButton
                      label="Place Order"
                      variant="primary"
                      size="lg"
                      xstyle={styles.fullWidth}
                      onClick={() => setSubmitted(true)}
                      endContent={<svg viewBox="0 0 24 24" style={{width: 16, height: 16}} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                    />
                    <XDSButton
                      label="Continue Shopping"
                      variant="secondary"
                      size="lg"
                      xstyle={styles.fullWidth}
                      onClick={() => {}}
                      icon={<svg viewBox="0 0 24 24" style={{width: 16, height: 16}} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>}
                    />
                  </XDSVStack>
                </XDSVStack>
              </XDSCard>

            </div>
          </div>
        </div>
      </XDSCenter>
    </XDSAppShell>
  );
}
