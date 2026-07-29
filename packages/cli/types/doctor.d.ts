// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Doctor command JSON responses.
 *
 * NOTE: These types are colocated with the command implementation — the source
 * of truth now lives in `../api/doctor/doctor.type.mjs` (JSDoc typedefs). This
 * file re-exports them so the public `./types/doctor` entrypoint and the
 * `types/index.d.ts` barrel keep working unchanged.
 */

export type {
  DoctorStatus,
  DoctorCheck,
  DoctorSummary,
  DoctorResponse,
} from '../api/doctor/doctor.type.mjs';
