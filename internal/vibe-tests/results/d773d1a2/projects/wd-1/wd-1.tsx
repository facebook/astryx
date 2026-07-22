import {Card, Button, Heading, Text, VStack, HStack, TextInput, RadioList, RadioListItem} from '@astryxdesign/core';
import {useState} from 'react';

type Step = 'cart' | 'shipping' | 'payment' | 'confirmation';

export default function CheckoutFlow() {
  const [step, setStep] = useState<Step>('cart');
  const [shippingMethod, setShippingMethod] = useState('standard');

  return (
    <VStack gap={4}>
      <Heading level={2}>Checkout</Heading>
      <HStack gap={2}>
        {(['cart', 'shipping', 'payment', 'confirmation'] as Step[]).map((s, i) => (
          <Text key={s} weight={step === s ? 'bold' : 'normal'} color={step === s ? 'accent' : 'secondary'}>
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </Text>
        ))}
      </HStack>

      {step === 'cart' && (
        <Card padding={4}>
          <VStack gap={3}>
            <Heading level={3}>Cart Summary</Heading>
            <Text>Widget Pro x2 - $49.98</Text>
            <Text>Gadget Lite x1 - $24.99</Text>
            <Text weight="bold">Total: $74.97</Text>
            <Button label="Continue to Shipping" variant="primary" onPress={() => setStep('shipping')} />
          </VStack>
        </Card>
      )}

      {step === 'shipping' && (
        <Card padding={4}>
          <VStack gap={3}>
            <Heading level={3}>Shipping</Heading>
            <TextInput label="Full Name" value="" onChange={() => {}} />
            <TextInput label="Address" value="" onChange={() => {}} />
            <RadioList label="Shipping Method" value={shippingMethod} onChange={setShippingMethod}>
              <RadioListItem label="Standard (5-7 days) - Free" value="standard" />
              <RadioListItem label="Express (2-3 days) - $9.99" value="express" />
            </RadioList>
            <HStack gap={2}>
              <Button label="Back" variant="secondary" onPress={() => setStep('cart')} />
              <Button label="Continue to Payment" variant="primary" onPress={() => setStep('payment')} />
            </HStack>
          </VStack>
        </Card>
      )}

      {step === 'payment' && (
        <Card padding={4}>
          <VStack gap={3}>
            <Heading level={3}>Payment</Heading>
            <TextInput label="Card Number" value="" onChange={() => {}} />
            <HStack gap={2}>
              <Button label="Back" variant="secondary" onPress={() => setStep('shipping')} />
              <Button label="Place Order" variant="primary" onPress={() => setStep('confirmation')} />
            </HStack>
          </VStack>
        </Card>
      )}

      {step === 'confirmation' && (
        <Card padding={4}>
          <VStack gap={3}>
            <Heading level={3}>Order Confirmed!</Heading>
            <Text>Thank you for your purchase.</Text>
          </VStack>
        </Card>
      )}
    </VStack>
  );
}
