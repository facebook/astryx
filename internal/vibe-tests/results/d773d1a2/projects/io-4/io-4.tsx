import {Stepper, Card, VStack, Text} from '@astryxdesign/core';
import {useState} from 'react';

export default function QuantitySelector() {
  const [quantity, setQuantity] = useState<number | null>(1);

  const handleChange = async (value: number) => {
    setQuantity(value);
    try {
      await fetch('/api/cart/update', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({quantity: value}),
      });
    } catch (e) {
      console.error('Failed to update quantity', e);
    }
  };

  return (
    <Card padding={3} width={200}>
      <VStack gap={2}>
        <Text weight="semibold">Quantity</Text>
        <Stepper label="Quantity" value={quantity} onChange={handleChange} min={1} max={99} step={1} isIntegerOnly />
      </VStack>
    </Card>
  );
}
