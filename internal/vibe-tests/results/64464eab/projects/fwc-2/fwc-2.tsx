import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';

interface NotificationBadgeProps {
  count: number;
}

export default function NotificationBadge({count}: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <Card className="w-72">
      <CardContent className="flex items-center gap-2 pt-4">
        <span className="font-medium">Notifications</span>
        <Badge variant="secondary">{count} unread</Badge>
      </CardContent>
    </Card>
  );
}
