# RSC Utilities (Future)

> ⚠️ **Status: Not implemented.** The components described below — `XDSLazy`, `XDSStream`, and `XDSIntersectionTrigger` — are *proposed designs only*. None of them exist in XDS today. Only `XDSSkeleton` and `XDSSpinner` are implemented and available for use.

## Overview

| Component | Purpose | Status |
|-----------|---------|--------|
| `XDSSkeleton` | Shimmer placeholder | ✅ Implemented |
| `XDSSpinner` | Spinning indicator | ✅ Implemented |
| `XDSIntersectionTrigger` | Fires callback on viewport entry | 🔮 Proposed |
| `XDSLazy` | Lazy data fetch + client render | 🔮 Proposed |
| `XDSStream` | RSC flight response streaming | 🔮 Proposed |

---

## Implemented Components

### XDSSkeleton

```tsx
<XDSSkeleton />                    // Full width
<XDSSkeleton width={100} />        // Fixed width
<XDSSkeleton shape="circle" />     // Avatar placeholder
```

### XDSSpinner

```tsx
<XDSSpinner />
<XDSSpinner size="small" />
```

---

## Proposed Components

### XDSIntersectionTrigger

Fires a callback when element enters viewport:

```tsx
<XDSIntersectionTrigger onIntersect={loadMore} rootMargin="200px" disabled={!hasMore}>
  {isLoading && <XDSSpinner />}
</XDSIntersectionTrigger>
```

### XDSLazy

Lazy load wrapper — fetches data on intersection, renders client-side:

```tsx
<XDSLazy fetch={() => fetchScore(user.id)} fallback={<XDSSkeleton width={60} />}>
  {score => <span>{score}</span>}
</XDSLazy>
```

### XDSStream

Fetches RSC flight response on intersection — for server component pagination:

```tsx
<XDSStream endpoint="/api/users" params={{cursor: nextCursor}} loading={<XDSSpinner />} />
```

The recursive pattern creates infinite scroll: each server response includes content + next `XDSStream` sentinel.

---

## Usage: Infinite Scroll

```tsx
async function UserListPage() {
  const {users, nextCursor, hasMore} = await fetchUsers({limit: 20});
  return (
    <XDSList>
      {users.map(user => <XDSListItem key={user.id}>{user.name}</XDSListItem>)}
      {hasMore && <XDSStream endpoint="/api/users" params={{cursor: nextCursor}} loading={<XDSSpinner />} />}
    </XDSList>
  );
}
```

## Considerations

- **Framework coupling**: Flight response parsing varies (Next.js, Waku, etc.)
- **Error handling**: Needs error boundary or error state
- **Deduplication**: Prevent double-fetches on rapid scroll
