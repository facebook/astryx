// Copyright (c) Meta Platforms, Inc. and affiliates.

// Docs command JSON response types are colocated with the API — the source of
// truth is `api/docs/docs.type.mjs`. This barrel re-exports them so existing
// consumers (types/index.d.ts) keep importing from 'types/docs'.
export type {
  DocsListResponse,
  DocsListEntry,
  DocsDetailResponse,
  DocsDetailSectionResponse,
} from '../api/docs/docs.type.mjs';
