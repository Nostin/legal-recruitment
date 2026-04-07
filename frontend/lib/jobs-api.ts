import { getOpenCourtApiBase } from "@/lib/opencourt-api";

const base = () => `${getOpenCourtApiBase()}/jobs`;

export type JobStatus = "open" | "closed" | "removed";
export type WorkArrangement = "remote" | "hybrid" | "onsite";

export type JobRead = {
  id: number;
  firm_profile_id: number;
  role_title: string;
  location: string;
  practice_area: string;
  description: string;
  salary_min_k: number | null;
  salary_max_k: number | null;
  work_arrangement: WorkArrangement;
  close_reason: string | null;
  status: JobStatus;
  posted_at: string;
  created_at: string;
  updated_at: string;
};

export type JobCreateBody = {
  firm_user_id: number;
  role_title: string;
  location: string;
  practice_area: string;
  description: string;
  salary_min_k?: number | null;
  salary_max_k?: number | null;
  work_arrangement: WorkArrangement;
};

export type JobUpdateBody = JobCreateBody;

export class JobsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "JobsApiError";
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
    throw new JobsApiError(message, res.status, detail);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

export async function listJobsForFirmUser(
  firmUserId: number,
): Promise<JobRead[]> {
  const u = new URL(base());
  u.searchParams.set("firm_user_id", String(firmUserId));
  const res = await fetch(u.toString(), { method: "GET" });
  return parseJson<JobRead[]>(res);
}

export async function listOpenJobs(): Promise<JobRead[]> {
  const u = new URL(base());
  u.searchParams.set("status", "open");
  const res = await fetch(u.toString(), { method: "GET" });
  return parseJson<JobRead[]>(res);
}

export async function createJob(body: JobCreateBody): Promise<JobRead> {
  const res = await fetch(base(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<JobRead>(res);
}

export async function updateJob(
  jobId: number,
  body: JobUpdateBody,
): Promise<JobRead> {
  const res = await fetch(`${base()}/${jobId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<JobRead>(res);
}

export async function patchJobStatus(
  jobId: number,
  body: {
    firm_user_id: number;
    status: "open" | "closed" | "removed";
    close_reason?: string;
  },
): Promise<JobRead> {
  const res = await fetch(`${base()}/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<JobRead>(res);
}
