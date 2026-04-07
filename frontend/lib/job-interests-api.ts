import { getOpenCourtApiBase } from "@/lib/opencourt-api";

const base = () => `${getOpenCourtApiBase()}/job-interests`;

export type JobInterestRead = {
  id: number;
  job_id: number;
  candidate_profile_id: number;
  created_at: string;
};

export class JobInterestsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "JobInterestsApiError";
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
    throw new JobInterestsApiError(message, res.status, detail);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

export async function listJobInterestsForCandidate(
  candidateUserId: number,
): Promise<JobInterestRead[]> {
  const res = await fetch(`${base()}/for-candidate/${candidateUserId}`, {
    method: "GET",
  });
  return parseJson<JobInterestRead[]>(res);
}

export async function createJobInterest(body: {
  candidate_user_id: number;
  job_id: number;
}): Promise<JobInterestRead> {
  const res = await fetch(base(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<JobInterestRead>(res);
}
