import { getOpenCourtApiBase } from "@/lib/opencourt-api";

const base = () => `${getOpenCourtApiBase()}/firms`;

export type HiringPartnersBand = "1-3" | "4-10" | "11+";

export type FirmRead = {
  id: number;
  user_id: number;
  firm_name: string;
  office_locations: string[] | null;
  hiring_practice_areas: string[] | null;
  hiring_partners_band: string | null;
  created_at: string;
  updated_at: string;
};

export type FirmCreateBody = {
  user_id: number;
  firm_name: string;
  office_locations?: string[] | null;
  hiring_practice_areas?: string[] | null;
  hiring_partners_band?: HiringPartnersBand | null;
};

export type FirmUpdateBody = {
  firm_name?: string;
  office_locations?: string[] | null;
  hiring_practice_areas?: string[] | null;
  hiring_partners_band?: HiringPartnersBand | null;
};

export class FirmsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "FirmsApiError";
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
    throw new FirmsApiError(message, res.status, detail);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

export async function getFirm(id: number): Promise<FirmRead> {
  const res = await fetch(`${base()}/${id}`, { method: "GET" });
  return parseJson<FirmRead>(res);
}

export async function listFirms(): Promise<FirmRead[]> {
  const res = await fetch(base(), { method: "GET" });
  return parseJson<FirmRead[]>(res);
}

/** Returns null when this user has no firm profile (HTTP 404). */
export async function fetchFirmForUser(
  userId: number,
): Promise<FirmRead | null> {
  const res = await fetch(`${base()}/by-user/${userId}`, { method: "GET" });
  if (res.status === 404) return null;
  return parseJson<FirmRead>(res);
}

export async function createFirm(body: FirmCreateBody): Promise<FirmRead> {
  const res = await fetch(base(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<FirmRead>(res);
}

export async function updateFirm(
  id: number,
  body: FirmUpdateBody,
): Promise<FirmRead> {
  const res = await fetch(`${base()}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<FirmRead>(res);
}
