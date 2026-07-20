interface NotificationBadgeProps { count: number; }

export default function NotificationBadge({count}: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <div style={{border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, width: 280}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{fontWeight: 600}}>Notifications</span>
        <span style={{background: '#e3f2fd', color: '#1565c0', padding: '2px 8px', borderRadius: 12, fontSize: 12}}>{count} unread</span>
      </div>
    </div>
  );
}
