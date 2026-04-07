import { getOpenCourtApiBase } from "@/lib/opencourt-api";

const base = () => `${getOpenCourtApiBase()}/saved-candidates`;

export type SavedCandidateRead = {
  id: number;
  candidate_profile_id: number;
  created_at: string;
  practice_area: string | null;
  title: string | null;
  years_post_qualification: number | null;
  pqe_is_range: boolean;
  pqe_range_min: number | null;
  pqe_range_max: number | null;
  firm_tier: string | null;
  preferred_locations: string[] | null;
};

export class SavedCandidatesApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "SavedCandidatesApiError";
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let message = res.statusText || "Request failed";
    let detail: unknown;
    try {
      const j = JSON.parse(text) as { detail?: unknown };
      detail = j.detail;
      if (typeof j.detail === "string") message = j.detail;
    } catch {
      if (text) message = text.slice(0, 200);
    }
    throw new SavedCandidatesApiError(message, res.status, detail);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

export async function listSavedCandidatesForFirm(
  firmUserId: number,
): Promise<SavedCandidateRead[]> {
  const res = await fetch(`${base()}/for-firm/${firmUserId}`, { method: "GET" });
  return parseJson<SavedCandidateRead[]>(res);
}

export async function saveCandidate(body: {
  firm_user_id: number;
  candidate_profile_id: number;
}): Promise<SavedCandidateRead> {
  const res = await fetch(base(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<SavedCandidateRead>(res);
}

export async function unsaveCandidate(
  candidateProfileId: number,
  firmUserId: number,
): Promise<void> {
  const res = await fetch(`${base()}/${candidateProfileId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firm_user_id: firmUserId }),
  });
  await parseJson<unknown>(res);
}
