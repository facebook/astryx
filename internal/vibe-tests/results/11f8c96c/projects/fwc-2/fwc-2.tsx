import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Text} from '@astryxdesign/core/Text';
import {Stack} from '@astryxdesign/core/Stack';

interface NotificationBadgeProps {
  count: number;
}

export default function NotificationBadge({count}: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <Card padding={3} width={300}>
      <Stack gap={2}>
        <Text type="label" weight="semibold">Notifications</Text>
        <Badge variant="info">{count} unread</Badge>
      </Stack>
    </Card>
  );
}
