import { getOpenCourtApiBase } from "@/lib/opencourt-api";

const base = () => `${getOpenCourtApiBase()}/introduction-requests`;

export type IntroductionStatus = "pending" | "accepted" | "declined";

export type IntroductionRead = {
  id: number;
  firm_profile_id: number;
  candidate_profile_id: number;
  status: IntroductionStatus;
  firm_name: string;
  role_title: string;
  role_location: string;
  practice_area: string;
  employment_type: string;
  work_arrangement: string;
  sponsorship_qualification: string;
  salary_band: string;
  firm_message: string;
  revealed_firm_name: string | null;
  revealed_compensation: string | null;
  revealed_role_description: string | null;
  created_at: string;
  updated_at: string;
};

export type IntroductionCreateBody = {
  firm_user_id: number;
  candidate_profile_id: number;
  role_title: string;
  role_location: string;
  practice_area: string;
  employment_type: string;
  work_arrangement: string;
  sponsorship_qualification: string;
  salary_band: string;
  firm_message: string;
  revealed_firm_name?: string | null;
  revealed_compensation?: string | null;
  revealed_role_description?: string | null;
};

export class IntroductionApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "IntroductionApiError";
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
      else if (Array.isArray(j.detail)) {
        message = j.detail
          .map((x: { msg?: string }) => x.msg)
          .filter(Boolean)
          .join("; ");
      }
    } catch {
      if (text) message = text.slice(0, 200);
    }
    throw new IntroductionApiError(message, res.status, detail);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

export async function createIntroductionRequest(
  body: IntroductionCreateBody,
): Promise<IntroductionRead> {
  const res = await fetch(base(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<IntroductionRead>(res);
}

export async function listIntroductionsForCandidate(
  userId: number,
): Promise<IntroductionRead[]> {
  const res = await fetch(`${base()}/for-candidate/${userId}`, {
    method: "GET",
  });
  return parseJson<IntroductionRead[]>(res);
}

export async function patchIntroductionStatus(
  introId: number,
  body: { candidate_user_id: number; status: "accepted" | "declined" },
): Promise<IntroductionRead> {
  const res = await fetch(`${base()}/${introId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<IntroductionRead>(res);
}
