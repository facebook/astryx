// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  XDSVStack,
  XDSHStack,
  XDSStack,
  XDSStackItem,
  XDSLayout,
  XDSLayoutContent,
} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSLink} from '@xds/core/Link';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSDivider} from '@xds/core/Divider';
import {XDSBanner} from '@xds/core/Banner';
import {XDSCard} from '@xds/core/Card';
import {XDSCollapsible} from '@xds/core/Collapsible';
import {XDSBadge} from '@xds/core/Badge';
import {XDSNumberInput} from '@xds/core/NumberInput';
import {useMediaQuery} from '@xds/core/hooks';
import {XDSSection} from '@xds/core/Section';
import {XDSCenter} from '@xds/core/Center';
import {XDSThumbnail} from '@xds/core/Thumbnail';
import {XDSIcon} from '@xds/core/Icon';
import {ShieldCheckIcon} from '@heroicons/react/24/outline';
import {LockClosedIcon} from '@heroicons/react/24/outline';
import {CheckCircleIcon} from '@heroicons/react/24/outline';
import {TruckIcon} from '@heroicons/react/24/outline';
import {
  colorVars,
  spacingVars,
  radiusVars,
  borderVars,
} from '@xds/core/theme/tokens.stylex';

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTHS = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
];
const YEARS = Array.from({length: 12}, (_, i) => String(2025 + i));

const US_STATES = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

// Optional basePath. Empty in end-user projects and the docsite (served at
// root). In the sandbox preview it picks up `/sandbox` so /template-assets/*
// resolves under the GH Pages basePath. The CLI swaps these paths for an
// inline placeholder on scaffold, so end users never see them.
const BP = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const ITEM_IMAGES: Record<string, {src: string}> = {
  '1': {src: BP + '/template-assets/light-product-1.png'},
  '2': {src: BP + '/template-assets/light-product-4.png'},
  '3': {src: BP + '/template-assets/light-product-5.png'},
};

const ORDER_ITEMS = [
  {
    id: '1',
    name: 'Speckled Stoneware Mug',
    variant: 'Hand-thrown · 12 oz',
    price: 78,
    qty: 1,
    limited: false,
  },
  {
    id: '2',
    name: 'Stoneware Dinner Plate',
    variant: 'Reactive glaze · 10 in',
    price: 72,
    qty: 1,
    limited: false,
  },
  {
    id: '3',
    name: 'Cereal Bowl',
    variant: 'Speckled clay · 6 in',
    price: 80,
    qty: 1,
    limited: true,
  },
];

const SUBTOTAL = 230;
// SHIPPING is now computed from deliveryMethod state
const TAX = 18.4;
// TOTAL is computed dynamically based on delivery selection
const fmt = (n: number) => `$${n.toFixed(2)}`;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = stylex.create({
  fullWidth: {width: '100%'},
  // XDSLayoutContent clips overflow by default, which traps position:sticky
  // children (the sticky order summary). With height="auto" the page scrolls
  // at the window, so let overflow be visible here so sticky can pin.
  visibleOverflow: {overflow: 'visible'},
  // Form column flex-basis so the two checkout columns share width evenly.
  formColBasis: {flexBasis: 0},
  // Space the Order Summary content below its collapsible trigger title.
  summaryContent: {paddingBlockStart: spacingVars['--spacing-2']},
  // Order-summary column: sticky beside the form on desktop.
  summarySticky: {
    flexBasis: 0,
    position: 'sticky',
    top: spacingVars['--spacing-4'],
    alignSelf: 'flex-start',
  },
  // On mobile the summary moves above the form.
  summaryMobileOrder: {order: -1},
  // Express-checkout brand buttons (fixed brand colors).
  paypalButton: {backgroundColor: '#FFC439', borderColor: '#FFC439'},
  // Official Google Pay dark button: black background with the unaltered
  // dark-variant mark (white "Google Pay" text + full-color G), per the
  // Google Pay brand guidelines.
  gpayButton: {backgroundColor: '#000', borderColor: '#000'},
  // Brand logos inside the express-checkout buttons.
  paypalLogo: {height: spacingVars['--spacing-5'], width: 'auto'},
  // Unaltered Google Pay mark (no filter/recolor — brand requirement),
  // sized so it keeps comfortable clear space inside the lg button.
  gpayLogo: {
    height: spacingVars['--spacing-5'],
    width: 'auto',
  },
  // Accepted card-network marks (Visa/Mastercard/Amex), shared style.
  cardLogo: {
    height: spacingVars['--spacing-7'],
    width: 'auto',
    borderRadius: radiusVars['--radius-element'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    backgroundColor: colorVars['--color-background-surface'],
  },
});

export default function PaymentFormPage() {
  const isMobile = useMediaQuery('(max-width: 767px)');
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
  const [paymentMethod, _setPaymentMethod] = useState('card');
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
  const [quantities, setQuantities] = useState<Record<string, number>>({
    '1': 1,
    '2': 1,
    '3': 1,
  });
  const [submitted, setSubmitted] = useState(false);

  const errors = submitted
    ? {
        firstName: !firstName.trim() ? 'Required' : undefined,
        lastName: !lastName.trim() ? 'Required' : undefined,
        address: !address.trim() ? 'Required' : undefined,
        city: !city.trim() ? 'Required' : undefined,
        zip: !zip.trim() ? 'Required' : undefined,
        state: !state ? 'Required' : undefined,
        email: !email.trim() ? 'Required' : undefined,
        phone: !phone.trim() ? 'Required' : undefined,
        expiry: !expiry ? 'Required' : undefined,
        expYear: !expYear ? 'Required' : undefined,
        cvc: !cvc.trim() ? 'Required' : undefined,
        cardNumber:
          paymentMethod === 'card' && !cardNumber.trim()
            ? 'Required'
            : undefined,
        cardName:
          paymentMethod === 'card' && !cardName.trim() ? 'Required' : undefined,
        billingAddress:
          !billingMatchesShipping && !billingAddress.trim()
            ? 'Required'
            : undefined,
        billingCity:
          !billingMatchesShipping && !billingCity.trim()
            ? 'Required'
            : undefined,
        billingZip:
          !billingMatchesShipping && !billingZip.trim()
            ? 'Required'
            : undefined,
        billingState:
          !billingMatchesShipping && !billingState ? 'Required' : undefined,
      }
    : {};

  return (
    <XDSLayout
      height="auto"
      content={
        <XDSLayoutContent padding={0} xstyle={styles.visibleOverflow}>
          <XDSCenter axis="horizontal">
            <XDSSection
              variant="transparent"
              maxWidth={1100}
              width="100%"
              padding={6}>
              <XDSVStack gap={5}>
                {/* Page header */}
                <XDSVStack gap={6}>
                  <XDSVStack gap={2}>
                    <XDSText type="display-1" as="h1">
                      Payment Request
                    </XDSText>
                    <XDSText type="body" color="secondary">
                      Review your order and complete your purchase. All
                      transactions are secured with 256-bit SSL encryption.
                    </XDSText>
                  </XDSVStack>
                  <XDSDivider />
                </XDSVStack>

                <XDSStack
                  direction={isMobile ? 'vertical' : 'horizontal'}
                  gap={8}
                  vAlign="start">
                  <XDSStackItem
                    size="fill"
                    xstyle={isMobile ? undefined : styles.formColBasis}>
                    <XDSVStack gap={8}>
                      {/* Sign in */}
                      <XDSVStack gap={1}>
                        <XDSHStack gap={2} hAlign="between" vAlign="center">
                          <XDSText type="large" weight="bold">
                            Sign in to check out
                          </XDSText>
                          <XDSButton
                            label="Sign In"
                            variant="secondary"
                            size="sm"
                            onClick={() => {}}
                          />
                        </XDSHStack>
                        <XDSText type="supporting" color="secondary">
                          Sign in to track your order and save your information
                          for faster checkout.
                        </XDSText>
                      </XDSVStack>

                      {/* Contact Information */}
                      <XDSVStack gap={3}>
                        <XDSText type="large" weight="bold">
                          Contact Information
                        </XDSText>
                        <XDSTextInput
                          size="lg"
                          label="Email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={setEmail}
                          status={
                            errors.email
                              ? {type: 'error', message: errors.email}
                              : undefined
                          }
                        />
                        <XDSCheckboxInput
                          label="Email me with news and offers"
                          value={emailOffers}
                          onChange={setEmailOffers}
                        />
                      </XDSVStack>

                      {/* Shipping Information */}
                      <XDSVStack gap={3}>
                        <XDSText type="large" weight="bold">
                          Shipping Information
                        </XDSText>
                        <XDSGrid columns={2} gap={3}>
                          <XDSTextInput
                            size="lg"
                            label="First Name"
                            placeholder="John"
                            value={firstName}
                            onChange={setFirstName}
                            status={
                              errors.firstName
                                ? {type: 'error', message: errors.firstName}
                                : undefined
                            }
                          />
                          <XDSTextInput
                            size="lg"
                            label="Last Name"
                            placeholder="Doe"
                            value={lastName}
                            onChange={setLastName}
                            status={
                              errors.lastName
                                ? {type: 'error', message: errors.lastName}
                                : undefined
                            }
                          />
                        </XDSGrid>
                        <XDSTextInput
                          size="lg"
                          label="Address"
                          placeholder="123 Main Street"
                          value={address}
                          onChange={setAddress}
                          status={
                            errors.address
                              ? {type: 'error', message: errors.address}
                              : undefined
                          }
                        />
                        <XDSGrid columns={2} gap={3}>
                          <XDSTextInput
                            size="lg"
                            label="City"
                            placeholder="New York"
                            value={city}
                            onChange={setCity}
                            status={
                              errors.city
                                ? {type: 'error', message: errors.city}
                                : undefined
                            }
                          />
                          <XDSTextInput
                            size="lg"
                            label="ZIP Code"
                            placeholder="10001"
                            value={zip}
                            onChange={setZip}
                            status={
                              errors.zip
                                ? {type: 'error', message: errors.zip}
                                : undefined
                            }
                          />
                        </XDSGrid>
                        <XDSSelector
                          size="lg"
                          label="State"
                          placeholder="Select state"
                          options={US_STATES}
                          value={state}
                          onChange={setState}
                          status={
                            errors.state
                              ? {type: 'error', message: errors.state}
                              : undefined
                          }
                        />
                        <XDSTextInput
                          size="lg"
                          label="Phone Number"
                          placeholder="+1 (555) 123-4567"
                          value={phone}
                          onChange={setPhone}
                          labelTooltip="We use your phone number to provide shipping updates and contact you about your delivery if needed."
                          status={
                            errors.phone
                              ? {type: 'error', message: errors.phone}
                              : undefined
                          }
                        />
                        <XDSCheckboxInput
                          label="Save my information for a faster checkout"
                          value={saveInfo}
                          onChange={setSaveInfo}
                        />
                      </XDSVStack>

                      {/* Delivery */}
                      <XDSVStack gap={3}>
                        <XDSVStack gap={1}>
                          <XDSText type="large" weight="bold">
                            Delivery
                          </XDSText>
                          <XDSText type="supporting" color="secondary">
                            Please allow 1–3 business days processing time
                            before your order ships.
                          </XDSText>
                        </XDSVStack>
                        <XDSRadioList
                          label="Delivery method"
                          value={deliveryMethod}
                          onChange={setDeliveryMethod}>
                          <XDSRadioListItem
                            value="standard"
                            label="Standard (3–7 business days)"
                            endContent={
                              <XDSText type="body" weight="medium">
                                $4.95
                              </XDSText>
                            }
                          />
                          <XDSRadioListItem
                            value="expedited"
                            label="Expedited (1–2 business days)"
                            endContent={
                              <XDSText type="body" weight="medium">
                                $9.95
                              </XDSText>
                            }
                          />
                        </XDSRadioList>
                      </XDSVStack>

                      {/* Payment Method */}
                      <XDSVStack gap={3}>
                        <XDSVStack gap={1}>
                          <XDSText type="large" weight="bold">
                            Payment Method
                          </XDSText>
                          <XDSText type="supporting" color="secondary">
                            All transactions are secure and encrypted.
                          </XDSText>
                        </XDSVStack>

                        {/* Express checkout */}
                        <XDSVStack gap={3}>
                          <XDSGrid columns={2} gap={3}>
                            {/* PayPal */}
                            <XDSButton
                              label="PayPal"
                              variant="primary"
                              size="lg"
                              onClick={() => {}}
                              xstyle={styles.paypalButton}>
                              <img
                                src={BP + '/template-assets/paypal-logo.png'}
                                alt="PayPal"
                                {...stylex.props(styles.paypalLogo)}
                              />
                            </XDSButton>
                            {/* Google Pay */}
                            <XDSButton
                              label="Google Pay"
                              variant="primary"
                              size="lg"
                              onClick={() => {}}
                              xstyle={styles.gpayButton}>
                              <img
                                src={
                                  BP +
                                  '/template-assets/google-pay-logo-dark.svg'
                                }
                                alt="Google Pay"
                                {...stylex.props(styles.gpayLogo)}
                              />
                            </XDSButton>
                          </XDSGrid>
                        </XDSVStack>

                        {/* OR divider */}
                        <XDSHStack gap={3} vAlign="center">
                          <XDSStackItem size="fill">
                            <XDSDivider />
                          </XDSStackItem>
                          <XDSText type="supporting" color="secondary">
                            OR
                          </XDSText>
                          <XDSStackItem size="fill">
                            <XDSDivider />
                          </XDSStackItem>
                        </XDSHStack>

                        {/* Credit card fields */}
                        <XDSVStack gap={3}>
                          {/* Card type icons */}
                          <XDSHStack gap={1.5} vAlign="center">
                            <img
                              src={BP + '/template-assets/visa.svg'}
                              alt="Visa"
                              {...stylex.props(styles.cardLogo)}
                            />
                            <img
                              src={BP + '/template-assets/mastercard.svg'}
                              alt="Mastercard"
                              {...stylex.props(styles.cardLogo)}
                            />
                            <img
                              src={BP + '/template-assets/amex.svg'}
                              alt="Amex"
                              {...stylex.props(styles.cardLogo)}
                            />
                          </XDSHStack>
                          <XDSTextInput
                            size="lg"
                            label="Card Number"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={setCardNumber}
                            status={
                              errors.cardNumber
                                ? {type: 'error', message: errors.cardNumber}
                                : undefined
                            }
                          />
                          <XDSGrid columns={3} gap={3}>
                            <XDSSelector
                              size="lg"
                              label="Expiry Month"
                              placeholder="MM"
                              options={MONTHS}
                              value={expiry}
                              onChange={setExpiry}
                              status={
                                errors.expiry
                                  ? {type: 'error', message: errors.expiry}
                                  : undefined
                              }
                            />
                            <XDSSelector
                              size="lg"
                              label="Expiry Year"
                              placeholder="YY"
                              options={YEARS}
                              value={expYear}
                              onChange={setExpYear}
                              status={
                                errors.expYear
                                  ? {type: 'error', message: errors.expYear}
                                  : undefined
                              }
                            />
                            <XDSTextInput
                              size="lg"
                              label="CVC"
                              placeholder="123"
                              value={cvc}
                              onChange={setCvc}
                              labelTooltip="3-digit security code usually found on the back of your card. American Express cards have a 4-digit code located on the front."
                              status={
                                errors.cvc
                                  ? {type: 'error', message: errors.cvc}
                                  : undefined
                              }
                            />
                          </XDSGrid>
                          <XDSTextInput
                            size="lg"
                            label="Name on Card"
                            placeholder="John Doe"
                            value={cardName}
                            onChange={setCardName}
                            status={
                              errors.cardName
                                ? {type: 'error', message: errors.cardName}
                                : undefined
                            }
                          />
                          <XDSCheckboxInput
                            label="Use shipping address as billing address"
                            value={billingMatchesShipping}
                            onChange={setBillingMatchesShipping}
                          />
                          {!billingMatchesShipping && (
                            <XDSVStack gap={3}>
                              <XDSTextInput
                                size="lg"
                                label="Address"
                                placeholder="123 Main Street"
                                value={billingAddress}
                                onChange={setBillingAddress}
                                status={
                                  errors.billingAddress
                                    ? {
                                        type: 'error',
                                        message: errors.billingAddress,
                                      }
                                    : undefined
                                }
                              />
                              <XDSGrid columns={2} gap={3}>
                                <XDSTextInput
                                  size="lg"
                                  label="City"
                                  placeholder="New York"
                                  value={billingCity}
                                  onChange={setBillingCity}
                                  status={
                                    errors.billingCity
                                      ? {
                                          type: 'error',
                                          message: errors.billingCity,
                                        }
                                      : undefined
                                  }
                                />
                                <XDSTextInput
                                  size="lg"
                                  label="ZIP Code"
                                  placeholder="10001"
                                  value={billingZip}
                                  onChange={setBillingZip}
                                  status={
                                    errors.billingZip
                                      ? {
                                          type: 'error',
                                          message: errors.billingZip,
                                        }
                                      : undefined
                                  }
                                />
                              </XDSGrid>
                              <XDSSelector
                                size="lg"
                                label="State"
                                placeholder="Select state"
                                options={US_STATES}
                                value={billingState}
                                onChange={setBillingState}
                                status={
                                  errors.billingState
                                    ? {
                                        type: 'error',
                                        message: errors.billingState,
                                      }
                                    : undefined
                                }
                              />
                            </XDSVStack>
                          )}
                        </XDSVStack>
                      </XDSVStack>

                      {/* Promo Code */}
                      <XDSVStack gap={3}>
                        <XDSText type="large" weight="bold">
                          Promo Code
                        </XDSText>
                        <XDSHStack gap={2} vAlign="center">
                          <XDSStackItem size="fill">
                            <XDSTextInput
                              size="lg"
                              label="Promo code"
                              isLabelHidden
                              placeholder="Enter promo code"
                              value={promo}
                              onChange={setPromo}
                              xstyle={styles.fullWidth}
                            />
                          </XDSStackItem>
                          <XDSButton
                            label="Apply"
                            variant="secondary"
                            size="lg"
                            onClick={() => {}}
                          />
                        </XDSHStack>
                      </XDSVStack>

                      {/* Gift Options */}
                      <XDSVStack gap={3}>
                        <XDSText type="large" weight="bold">
                          Gift Options
                        </XDSText>
                        <XDSCheckboxInput
                          label="Add a gift message"
                          value={addGiftMessage}
                          onChange={setAddGiftMessage}
                        />
                        {addGiftMessage && (
                          <XDSVStack gap={3}>
                            <XDSGrid columns={2} gap={3}>
                              <XDSTextInput
                                size="lg"
                                label="To"
                                isLabelHidden
                                placeholder="To"
                                value={giftTo}
                                onChange={setGiftTo}
                              />
                              <XDSTextInput
                                size="lg"
                                label="From"
                                isLabelHidden
                                placeholder="From"
                                value={giftFrom}
                                onChange={setGiftFrom}
                              />
                            </XDSGrid>
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

                      {/* Trust bar + CTAs + policy links */}
                      <XDSVStack gap={4}>
                        <XDSHStack gap={5} hAlign="center" wrap="wrap">
                          <XDSHStack gap={1} vAlign="center">
                            <XDSIcon
                              icon={ShieldCheckIcon}
                              size="sm"
                              color="secondary"
                            />
                            <XDSText type="supporting" color="secondary">
                              Secure Payment
                            </XDSText>
                          </XDSHStack>
                          <XDSHStack gap={1} vAlign="center">
                            <XDSIcon
                              icon={LockClosedIcon}
                              size="sm"
                              color="secondary"
                            />
                            <XDSText type="supporting" color="secondary">
                              SSL Encrypted
                            </XDSText>
                          </XDSHStack>
                          <XDSHStack gap={1} vAlign="center">
                            <XDSIcon
                              icon={CheckCircleIcon}
                              size="sm"
                              color="secondary"
                            />
                            <XDSText type="supporting" color="secondary">
                              Free Returns
                            </XDSText>
                          </XDSHStack>
                        </XDSHStack>
                        <XDSVStack gap={2}>
                          <XDSButton
                            label="Place Order"
                            variant="primary"
                            size="lg"
                            xstyle={styles.fullWidth}
                            onClick={() => setSubmitted(true)}
                          />
                          <XDSButton
                            label="Continue Shopping"
                            variant="secondary"
                            size="lg"
                            xstyle={styles.fullWidth}
                            onClick={() => {}}
                          />
                        </XDSVStack>
                        <XDSDivider />
                        <XDSHStack gap={4} vAlign="center">
                          <XDSLink href="#" type="supporting">
                            Refund policy
                          </XDSLink>
                          <XDSLink href="#" type="supporting">
                            Privacy policy
                          </XDSLink>
                          <XDSLink href="#" type="supporting">
                            Terms of service
                          </XDSLink>
                          <XDSLink href="#" type="supporting">
                            Cancellations
                          </XDSLink>
                        </XDSHStack>
                      </XDSVStack>
                    </XDSVStack>
                  </XDSStackItem>

                  <XDSStackItem
                    size="fill"
                    xstyle={
                      isMobile
                        ? styles.summaryMobileOrder
                        : styles.summarySticky
                    }>
                    <XDSCard padding={5}>
                      <XDSVStack gap={4}>
                        {/* Accordion header — clickable on mobile only */}
                        <XDSCollapsible
                          trigger="Order Summary"
                          defaultIsOpen={true}>
                          <XDSVStack gap={4} xstyle={styles.summaryContent}>
                            {/* Line items */}
                            {ORDER_ITEMS.map(item => (
                              <XDSVStack key={item.id} gap={3}>
                                <XDSHStack gap={3} vAlign="start">
                                  <XDSThumbnail
                                    src={ITEM_IMAGES[item.id].src}
                                    alt={item.name}
                                  />
                                  <XDSStackItem size="fill">
                                    <XDSVStack gap={1}>
                                      <XDSHStack
                                        gap={2}
                                        hAlign="between"
                                        vAlign="start">
                                        <XDSHStack gap={2} vAlign="center">
                                          <XDSText type="body" weight="medium">
                                            {item.name}
                                          </XDSText>
                                          {item.limited && (
                                            <XDSBadge
                                              variant="green"
                                              label="LIMITED EDITION"
                                            />
                                          )}
                                        </XDSHStack>
                                        <XDSText type="body" weight="bold">
                                          {fmt(item.price)}
                                        </XDSText>
                                      </XDSHStack>
                                      <XDSText
                                        type="supporting"
                                        color="secondary">
                                        {item.variant}
                                      </XDSText>
                                      <XDSHStack gap={2} vAlign="center">
                                        <XDSNumberInput
                                          label="Qty"
                                          isLabelHidden
                                          value={
                                            quantities[item.id] ?? item.qty
                                          }
                                          onChange={v =>
                                            setQuantities(q => ({
                                              ...q,
                                              [item.id]: v,
                                            }))
                                          }
                                          min={1}
                                          max={10}
                                          isIntegerOnly
                                        />
                                        <XDSLink href="#" type="supporting">
                                          Remove
                                        </XDSLink>
                                        <XDSLink href="#" type="supporting">
                                          Save
                                        </XDSLink>
                                      </XDSHStack>
                                    </XDSVStack>
                                  </XDSStackItem>
                                </XDSHStack>
                                <XDSDivider />
                              </XDSVStack>
                            ))}

                            {/* Order total subsection */}
                            <XDSVStack gap={3}>
                              <XDSText type="large" weight="bold">
                                Order Total
                              </XDSText>
                              <XDSVStack gap={2}>
                                <XDSHStack hAlign="between" vAlign="center">
                                  <XDSText type="body" color="secondary">
                                    Subtotal
                                  </XDSText>
                                  <XDSText type="body">{fmt(SUBTOTAL)}</XDSText>
                                </XDSHStack>
                                <XDSHStack hAlign="between" vAlign="center">
                                  <XDSText type="body" color="secondary">
                                    Shipping
                                  </XDSText>
                                  <XDSText type="body">
                                    {fmt(
                                      deliveryMethod === 'expedited'
                                        ? 9.95
                                        : 4.95,
                                    )}
                                  </XDSText>
                                </XDSHStack>
                                <XDSHStack hAlign="between" vAlign="center">
                                  <XDSText type="body" color="secondary">
                                    Tax
                                  </XDSText>
                                  <XDSText type="body">{fmt(TAX)}</XDSText>
                                </XDSHStack>
                              </XDSVStack>
                              <XDSDivider />
                              <XDSHStack hAlign="between" vAlign="center">
                                <XDSText type="large" weight="bold">
                                  Total
                                </XDSText>
                                <XDSText type="large" weight="bold">
                                  {fmt(
                                    SUBTOTAL +
                                      (deliveryMethod === 'expedited'
                                        ? 9.95
                                        : 4.95) +
                                      TAX,
                                  )}
                                </XDSText>
                              </XDSHStack>
                              <XDSBanner
                                status="info"
                                icon={<XDSIcon icon={TruckIcon} size="sm" />}
                                title="Free shipping on orders over $300"
                              />
                            </XDSVStack>
                          </XDSVStack>
                        </XDSCollapsible>
                      </XDSVStack>
                      {/* end outer card XDSVStack gap={4} */}
                    </XDSCard>
                  </XDSStackItem>
                </XDSStack>
              </XDSVStack>
            </XDSSection>
          </XDSCenter>
        </XDSLayoutContent>
      }
    />
  );
}
