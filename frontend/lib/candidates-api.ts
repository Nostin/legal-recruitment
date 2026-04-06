import { getOpenCourtApiBase } from "@/lib/opencourt-api";

const base = () => `${getOpenCourtApiBase()}/candidates`;

/** Mirrors backend `CandidateRead` / OpenAPI. */
export type CandidateRead = {
  id: number;
  user_id: number;
  practice_area: string | null;
  years_post_qualification: number | null;
  pqe_is_range: boolean;
  pqe_range_min: number | null;
  pqe_range_max: number | null;
  firm_tier: string | null;
  university: string | null;
  preferred_locations: string[] | null;
  title: string | null;
  current_firm: string | null;
  former_firms: string | null;
  trainee_firm: string | null;
  primary_admission: string | null;
  admission_year: number | null;
  source_profile_url: string | null;
  profile_summary: string | null;
  salary_min_k: number | null;
  salary_max_k: number | null;
  salary_disclosed: boolean;
  languages: string[] | null;
  employment_types: string[] | null;
  work_arrangements: string[] | null;
  excluded_firms: string[] | null;
  preferred_destinations: string[] | null;
  specific_firm_preference: string | null;
  verification_professional_email: string | null;
  linkedin_url: string | null;
  open_to_roles: boolean;
  profile_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type CandidateCreateBody = {
  user_id: number;
  practice_area?: string | null;
  years_post_qualification?: number | null;
  pqe_is_range?: boolean;
  pqe_range_min?: number | null;
  pqe_range_max?: number | null;
  firm_tier?: string | null;
  university?: string | null;
  preferred_locations?: string[] | null;
  title?: string | null;
  current_firm?: string | null;
  former_firms?: string | null;
  trainee_firm?: string | null;
  primary_admission?: string | null;
  admission_year?: number | null;
  source_profile_url?: string | null;
  profile_summary?: string | null;
  salary_min_k?: number | null;
  salary_max_k?: number | null;
  salary_disclosed?: boolean;
  languages?: string[] | null;
  employment_types?: string[] | null;
  work_arrangements?: string[] | null;
  excluded_firms?: string[] | null;
  preferred_destinations?: string[] | null;
  specific_firm_preference?: string | null;
  verification_professional_email?: string | null;
  linkedin_url?: string | null;
  open_to_roles?: boolean;
  profile_verified?: boolean;
};

export type CandidateUpdateBody = Partial<
  Omit<CandidateCreateBody, "user_id">
>;

export class CandidatesApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "CandidatesApiError";
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
    throw new CandidatesApiError(message, res.status, detail);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

export async function listCandidates(): Promise<CandidateRead[]> {
  const res = await fetch(base(), { method: "GET" });
  return parseJson<CandidateRead[]>(res);
}

export async function getCandidate(id: number): Promise<CandidateRead> {
  const res = await fetch(`${base()}/${id}`, { method: "GET" });
  return parseJson<CandidateRead>(res);
}

export async function createCandidate(
  body: CandidateCreateBody,
): Promise<CandidateRead> {
  const res = await fetch(base(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<CandidateRead>(res);
}

export async function updateCandidate(
  id: number,
  body: CandidateUpdateBody,
): Promise<CandidateRead> {
  const res = await fetch(`${base()}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<CandidateRead>(res);
}

export async function fetchCandidateForUser(
  userId: number,
): Promise<CandidateRead | null> {
  const rows = await listCandidates();
  return rows.find((r) => r.user_id === userId) ?? null;
}

/** Structured fields for firm search cards (no parsing of profile_summary). */
export type SearchListCandidate = {
  id: number;
  area: string;
  title: string;
  pqeLabel: string;
  tier: string;
  currentFirm: string | null;
  uni: string | null;
  locationLabel: string;
  preferredLocations: string[];
  primaryAdmission: string | null;
  admissionYear: number | null;
  formerFirms: string | null;
  traineeFirm: string | null;
  notes: string | null;
  showCurrentFirm: boolean;
  showUniversity: boolean;
  showFormerFirms: boolean;
  showTraineeFirm: boolean;
  showAdmission: boolean;
  verified: boolean;
  preferredDestinations: string[];
  /** When false, profile is omitted from firm search. */
  openToRoles: boolean;
};

/** Maps profile-builder wizard state + optional existing row to API body (create or update). */
export function wizardStateToCandidateBody(
  w: {
    practiceArea: string;
    pqeIsRange: boolean;
    pqe: number[];
    pqeRange: number[];
    firmTier: string;
    university: string;
    selectedLocations: string[];
    notes: string;
    salarySet: boolean;
    salaryRange: [number, number];
    selectedEmploymentTypes: string[];
    selectedWorkArrangements: string[];
    languages: string[];
    verificationEmail: string;
    linkedInUrl: string;
    excludedFirms: string[];
    preferredDestinations: string[];
    specificFirmPreference: string;
    openToRoles: boolean;
  },
  preserved: CandidateRead | null,
): Omit<CandidateCreateBody, "user_id"> {
  return {
    practice_area: w.practiceArea.trim() || null,
    years_post_qualification: w.pqeIsRange ? null : w.pqe[0] ?? null,
    pqe_is_range: w.pqeIsRange,
    pqe_range_min: w.pqeIsRange ? (w.pqeRange[0] ?? null) : null,
    pqe_range_max: w.pqeIsRange ? (w.pqeRange[1] ?? null) : null,
    firm_tier: w.firmTier.trim() || null,
    university: w.university.trim() || null,
    preferred_locations:
      w.selectedLocations.length > 0 ? w.selectedLocations : null,
    title: preserved?.title ?? null,
    current_firm: preserved?.current_firm ?? null,
    former_firms: preserved?.former_firms ?? null,
    trainee_firm: preserved?.trainee_firm ?? null,
    primary_admission: preserved?.primary_admission ?? null,
    admission_year: preserved?.admission_year ?? null,
    source_profile_url: preserved?.source_profile_url ?? null,
    profile_summary: w.notes.trim() || null,
    salary_min_k: w.salarySet ? w.salaryRange[0] : null,
    salary_max_k: w.salarySet ? w.salaryRange[1] : null,
    salary_disclosed: w.salarySet,
    languages: w.languages.length > 0 ? w.languages : null,
    employment_types:
      w.selectedEmploymentTypes.length > 0
        ? w.selectedEmploymentTypes
        : null,
    work_arrangements:
      w.selectedWorkArrangements.length > 0
        ? w.selectedWorkArrangements
        : null,
    excluded_firms: w.excludedFirms.length > 0 ? w.excludedFirms : null,
    preferred_destinations:
      w.preferredDestinations.length > 0 ? w.preferredDestinations : null,
    specific_firm_preference: w.specificFirmPreference.trim() || null,
    verification_professional_email: w.verificationEmail.trim() || null,
    linkedin_url: w.linkedInUrl.trim() || null,
    open_to_roles: w.openToRoles,
    profile_verified: preserved?.profile_verified ?? false,
  };
}

export function mapCandidateToSearchList(r: CandidateRead): SearchListCandidate {
  const area = r.practice_area?.trim() || "—";
  const pqeLabel = r.pqe_is_range
    ? `${r.pqe_range_min ?? "?"}–${r.pqe_range_max ?? "?"}`
    : String(r.years_post_qualification ?? "—");
  const locs = r.preferred_locations ?? [];
  const locationLabel =
    locs.length > 0 ? locs.join(", ") : "—";
  return {
    id: r.id,
    area,
    title: r.title?.trim() || "Lawyer",
    pqeLabel,
    tier: r.firm_tier?.trim() || "—",
    currentFirm: r.current_firm,
    uni: r.university,
    locationLabel,
    preferredLocations: locs,
    primaryAdmission: r.primary_admission,
    admissionYear: r.admission_year,
    formerFirms: r.former_firms,
    traineeFirm: r.trainee_firm,
    notes: r.profile_summary,
    showCurrentFirm: Boolean(r.current_firm?.trim()),
    showUniversity: Boolean(r.university?.trim()),
    showFormerFirms: Boolean(r.former_firms?.trim()),
    showTraineeFirm: Boolean(r.trainee_firm?.trim()),
    showAdmission: Boolean(r.primary_admission?.trim()),
    verified: r.profile_verified,
    preferredDestinations: r.preferred_destinations ?? [],
    openToRoles: r.open_to_roles,
  };
}
