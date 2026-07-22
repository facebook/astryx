import {Breadcrumbs, BreadcrumbItem, Heading, Text, Button, VStack, HStack, Card} from '@astryxdesign/core';

export default function ProductDetailPage() {
  return (
    <VStack gap={4}>
      <Breadcrumbs label="Navigation">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/electronics">Electronics</BreadcrumbItem>
        <BreadcrumbItem href="/electronics/audio">Audio</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Wireless Headphones Pro</BreadcrumbItem>
      </Breadcrumbs>

      <Heading level={1}>Wireless Headphones Pro</Heading>

      <Card padding={4}>
        <VStack gap={3}>
          <Text type="large" weight="semibold">$299.99</Text>
          <Text color="secondary">Premium noise-cancelling wireless headphones with 30-hour battery life.</Text>
          <HStack gap={2}>
            <Button label="Add to Cart" variant="primary" />
            <Button label="Back" variant="secondary" onPress={() => history.back()} />
          </HStack>
        </VStack>
      </Card>
    </VStack>
  );
}
