# RSC Utilities

Generic primitives for lazy loading, intersection observation, and React Server Component streaming.

## Overview

| Component                | Fetches     | Renders             | Use Case                    |
| ------------------------ | ----------- | ------------------- | --------------------------- |
| `XDSSkeleton`            | —           | Shimmer placeholder | Loading states              |
| `XDSSpinner`             | —           | Spinning indicator  | In-progress states          |
| `XDSIntersectionTrigger` | —           | Fires callback      | Custom intersection logic   |
| `XDSLazy`                | Data (JSON) | Client-side         | Lazy cell/field values      |
| `XDSStream`              | RSC flight  | Server components   | Infinite scroll, pagination |

## XDSSkeleton

Loading placeholder with shimmer animation:

```tsx
<XDSSkeleton />                    // Full width
<XDSSkeleton width={100} />        // Fixed width
<XDSSkeleton width="50%" />        // Percentage
<XDSSkeleton height={20} />        // Custom height
<XDSSkeleton shape="circle" />     // Avatar placeholder
<XDSSkeleton animate={false} />    // No animation
```

## XDSSpinner

Loading spinner for in-progress states:

```tsx
<XDSSpinner />
<XDSSpinner size="small" />
<XDSSpinner size="large" />
```

## XDSIntersectionTrigger

Fires a callback when element enters viewport. For client-side pagination with callbacks:

```tsx
<XDSIntersectionTrigger
  onIntersect={loadMore}
  rootMargin="200px"
  disabled={!hasMore}>
  {isLoading && <XDSSpinner />}
</XDSIntersectionTrigger>
```

### Props

```tsx
interface XDSIntersectionTriggerProps {
  onIntersect: () => void; // Callback when visible
  rootMargin?: string; // Intersection margin (default: '100px')
  threshold?: number; // Visibility threshold (default: 0)
  disabled?: boolean; // Disable observation
  children?: ReactNode; // Content to render
}
```

### Implementation

```tsx
'use client';

function XDSIntersectionTrigger({
  onIntersect,
  rootMargin = '100px',
  threshold = 0,
  disabled = false,
  children,
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      {rootMargin, threshold},
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [disabled, onIntersect, rootMargin, threshold]);

  return <div ref={ref}>{children}</div>;
}
```

## XDSLazy

Lazy load wrapper that fetches data on intersection and renders client-side:

```tsx
<XDSLazy
  fetch={() => fetchScore(user.id)}
  fallback={<XDSSkeleton width={60} />}>
  {score => <span>{score}</span>}
</XDSLazy>
```

### Props

```tsx
interface XDSLazyProps<T> {
  fetch: () => Promise<T>; // Data fetcher
  fallback: ReactNode; // Loading placeholder
  children: (data: T) => ReactNode; // Render function
  rootMargin?: string; // Intersection margin (default: '100px')
}
```

### Implementation

```tsx
'use client';

function XDSLazy<T>({
  fetch,
  fallback,
  children,
  rootMargin = '100px',
}: XDSLazyProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (triggered || !ref.current) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          setLoading(true);
          observer.disconnect();

          try {
            const result = await fetch();
            setData(result);
          } finally {
            setLoading(false);
          }
        }
      },
      {rootMargin},
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [triggered, fetch, rootMargin]);

  if (data !== null) {
    return <>{children(data)}</>;
  }

  return <div ref={ref}>{loading || triggered ? fallback : null}</div>;
}
```

## XDSStream

Fetches RSC flight response on intersection and renders server components. For React Server Component pagination:

```tsx
<XDSStream
  endpoint="/api/users"
  params={{cursor: nextCursor}}
  loading={<XDSSpinner />}
/>
```

### Props

```tsx
interface XDSStreamProps {
  endpoint: string; // RSC endpoint URL
  params?: Record<string, string>; // Query params (cursor, limit, etc.)
  rootMargin?: string; // Intersection margin (default: '200px')
  loading?: ReactNode; // Loading indicator
  disabled?: boolean; // Disable fetching
}
```

### Implementation

```tsx
'use client';

function XDSStream({
  endpoint,
  params,
  rootMargin = '200px',
  loading,
  disabled = false,
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<ReactNode>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (disabled || fetching || content) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting) {
          setFetching(true);
          observer.disconnect();

          const url = params
            ? `${endpoint}?${new URLSearchParams(params)}`
            : endpoint;

          const response = await fetch(url, {
            headers: {RSC: '1'},
          });

          // Framework-specific flight response handling
          const serverContent = await createFromReadableStream(response.body);
          setContent(serverContent);
          setFetching(false);
        }
      },
      {rootMargin},
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [disabled, fetching, content, endpoint, params, rootMargin]);

  // Already fetched - render server content
  if (content) return <>{content}</>;

  // Disabled - render nothing
  if (disabled) return null;

  // Sentinel + loading state
  return <div ref={ref}>{fetching && loading}</div>;
}
```

### Recursive Pattern

The server endpoint returns content + next trigger, creating a chain:

```tsx
// /api/users endpoint (server)
async function UsersEndpoint({searchParams}) {
  const cursor = searchParams.cursor;
  const {items, nextCursor, hasMore} = await fetchUsers({
    after: cursor,
    limit: 20,
  });

  return (
    <>
      {items.map(item => (
        <Item key={item.id} data={item} />
      ))}

      {hasMore && (
        <XDSStream endpoint="/api/users" params={{cursor: nextCursor}} />
      )}
    </>
  );
}
```

Each fetch returns:

1. New content
2. Next `XDSStream` sentinel (if more data exists)

This creates infinite scroll without client-side state management.

### Considerations

- **Framework coupling**: Flight response parsing varies (Next.js, Waku, etc.)
- **Error handling**: Consider adding error boundary or error state
- **Retry**: Could add retry logic on fetch failure
- **Deduplication**: Prevent double-fetches on rapid scroll

## Usage Examples

### List with Infinite Scroll

```tsx
async function UserListPage() {
  const {users, nextCursor, hasMore} = await fetchUsers({limit: 20});

  return (
    <XDSList>
      {users.map(user => (
        <XDSListItem key={user.id}>{user.name}</XDSListItem>
      ))}

      {hasMore && (
        <XDSStream
          endpoint="/api/users"
          params={{cursor: nextCursor}}
          loading={<XDSSpinner />}
        />
      )}
    </XDSList>
  );
}
```

### Card Grid with Lazy Images

```tsx
<div className="grid">
  {items.map(item => (
    <Card key={item.id}>
      <XDSLazy
        fetch={() => fetchThumbnail(item.id)}
        fallback={<XDSSkeleton shape="rectangle" height={200} />}>
        {src => <img src={src} alt={item.title} />}
      </XDSLazy>
      <h3>{item.title}</h3>
    </Card>
  ))}
</div>
```

### Client-Side Pagination

```tsx
function ClientPaginatedList() {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    setLoading(true);
    const {items: newItems, nextCursor} = await fetchItems({after: cursor});
    setItems(prev => [...prev, ...newItems]);
    setCursor(nextCursor);
    setHasMore(!!nextCursor);
    setLoading(false);
  };

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}

      <XDSIntersectionTrigger
        onIntersect={loadMore}
        disabled={!hasMore || loading}>
        {loading && <XDSSpinner />}
      </XDSIntersectionTrigger>
    </ul>
  );
}
```
