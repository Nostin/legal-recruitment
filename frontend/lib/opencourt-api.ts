/** Backend base URL for OpenCourt API (bootstrap; no auth verification in Phase 4). */
export function getOpenCourtApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
}
