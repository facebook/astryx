// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {BottomSheet, BottomSheetStack} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';

const ORDERS = [
  {id: '1042', title: 'Trail runners', status: 'Shipped'},
  {id: '1043', title: 'Rain shell', status: 'Processing'},
  {id: '1044', title: 'Wool socks ×3', status: 'Delivered'},
];

/**
 * A drill-in: the list opens an order, the order opens an editor. Each level
 * is a standalone BottomSheet with its own open state; the stack orders them
 * in tree order and keeps only the top one interactive. Close all closes
 * every level in one update.
 */
export default function BottomSheetStackShowcase() {
  const [isListOpen, setIsListOpen] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState('Leave at the side door');
  const order = ORDERS.find(entry => entry.id === orderId) ?? null;

  const closeAll = () => {
    setIsListOpen(false);
    setOrderId(null);
    setIsEditing(false);
  };

  return (
    <>
      <Button label="Open orders" onClick={() => setIsListOpen(true)} />
      <BottomSheetStack>
        <BottomSheet
          isOpen={isListOpen}
          onOpenChange={setIsListOpen}
          label="Orders"
          height="hug">
          <Section padding={4}>
            <VStack gap={3}>
              <Heading level={3}>Your orders</Heading>
              <Divider />
              {ORDERS.map(entry => (
                <HStack key={entry.id} gap={2} vAlign="center">
                  <VStack gap={0.5}>
                    <Text type="label">#{entry.id}</Text>
                    <Text type="supporting" color="secondary">
                      {entry.title} · {entry.status}
                    </Text>
                  </VStack>
                  <Button
                    label="View"
                    variant="secondary"
                    size="sm"
                    onClick={() => setOrderId(entry.id)}
                  />
                </HStack>
              ))}
              <HStack gap={2} hAlign="end">
                <Button
                  label="Done"
                  variant="secondary"
                  onClick={() => setIsListOpen(false)}
                />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
        <BottomSheet
          isOpen={order != null}
          onOpenChange={open => {
            if (!open) {
              setOrderId(null);
            }
          }}
          label={order == null ? 'Order' : `Order ${order.id}`}
          height="hug">
          <Section padding={4}>
            <VStack gap={3}>
              <Heading level={3}>Order #{order?.id ?? ''}</Heading>
              <Text type="supporting" color="secondary">
                {order?.title} · {order?.status}
              </Text>
              <Divider />
              <Text type="body">Delivery note: {note}</Text>
              <HStack gap={2} hAlign="end">
                <Button label="Close all" variant="ghost" onClick={closeAll} />
                <Button label="Edit note" onClick={() => setIsEditing(true)} />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
        <BottomSheet
          isOpen={isEditing}
          onOpenChange={setIsEditing}
          label="Edit delivery note"
          height="hug"
          purpose="form">
          <Section padding={4}>
            <VStack gap={3}>
              <Heading level={3}>Edit delivery note</Heading>
              <TextInput
                label="Delivery note"
                value={note}
                onChange={setNote}
                data-autofocus
              />
              <HStack gap={2} hAlign="end">
                <Button label="Close all" variant="ghost" onClick={closeAll} />
                <Button label="Save" onClick={() => setIsEditing(false)} />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
      </BottomSheetStack>
    </>
  );
}
