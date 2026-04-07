"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getOpenCourtApiBase } from "@/lib/opencourt-api";

export type OpenCourtLocalUser = {
  id: number;
  clerk_user_id: string;
  email: string;
  account_type: "candidate" | "firm" | null;
};

type LocalUserContextValue = {
  localUser: OpenCourtLocalUser | null;
  bootstrapLoading: boolean;
  bootstrapError: boolean;
  /** Signed-in Clerk user has no email on file (bootstrap skipped). */
  emailMissing: boolean;
  setAccountType: (t: "candidate" | "firm") => Promise<boolean>;
  refreshLocalUser: () => Promise<void>;
};

const LocalUserContext = createContext<LocalUserContextValue | null>(null);

const PROTECTED_PATHS = new Set([
  "/profile-builder",
  "/firm-onboarding",
  "/search",
  "/firm-dashboard",
  "/notifications",
  "/lawyer-settings",
]);

export function useOpenCourtUser(): LocalUserContextValue {
  const ctx = useContext(LocalUserContext);
  if (!ctx) {
    throw new Error("useOpenCourtUser must be used within LocalUserProvider");
  }
  return ctx;
}

export function LocalUserProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [localUser, setLocalUser] = useState<OpenCourtLocalUser | null>(null);
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [bootstrapError, setBootstrapError] = useState(false);

  const api = getOpenCourtApiBase();

  const displayLocalUser = user ? localUser : null;

  const clerkEmail = useMemo(() => {
    if (!user) return null;
    return (
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses[0]?.emailAddress ??
      null
    );
  }, [user]);

  const emailMissing = Boolean(isLoaded && user && !clerkEmail);

  const refreshLocalUser = useCallback(async () => {
    if (!user?.id) return;
    const res = await fetch(
      `${api}/users/by-clerk/${encodeURIComponent(user.id)}`,
    );
    if (res.ok) {
      setLocalUser(await res.json());
    }
  }, [api, user]);

  useEffect(() => {
    if (!isLoaded || !user || !clerkEmail) return;

    let cancelled = false;

    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setBootstrapLoading(true);
      try {
        const res = await fetch(`${api}/users/bootstrap`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerk_user_id: user.id, email: clerkEmail }),
        });
        if (!res.ok) throw new Error("bootstrap failed");
        const data = (await res.json()) as OpenCourtLocalUser;
        if (!cancelled) {
          setLocalUser(data);
          setBootstrapError(false);
        }
      } catch {
        if (!cancelled) {
          setBootstrapError(true);
          setLocalUser(null);
        }
      } finally {
        if (!cancelled) setBootstrapLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [api, clerkEmail, isLoaded, user]);

  const setAccountType = useCallback(
    async (t: "candidate" | "firm") => {
      if (!user?.id) return false;
      const res = await fetch(`${api}/users/account-type`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_user_id: user.id, account_type: t }),
      });
      if (res.ok) {
        setLocalUser(await res.json());
        return true;
      }
      return false;
    },
    [api, user],
  );

  useEffect(() => {
    if (
      !isLoaded ||
      !user ||
      emailMissing ||
      bootstrapLoading ||
      bootstrapError
    )
      return;
    if (!displayLocalUser) return;
    if (!PROTECTED_PATHS.has(pathname)) return;
    if (displayLocalUser.account_type == null) {
      router.replace("/join");
    }
  }, [
    bootstrapError,
    bootstrapLoading,
    displayLocalUser,
    emailMissing,
    isLoaded,
    pathname,
    router,
    user,
  ]);

  useEffect(() => {
    if (!isLoaded || bootstrapLoading || bootstrapError) return;
    if (!displayLocalUser) return;
    if (!pathname.startsWith("/sign-in")) return;
    if (displayLocalUser.account_type === "firm") {
      router.replace("/search");
    }
  }, [
    bootstrapError,
    bootstrapLoading,
    displayLocalUser,
    isLoaded,
    pathname,
    router,
  ]);

  const value = useMemo(
    () => ({
      localUser: displayLocalUser,
      bootstrapLoading: !!user && !!clerkEmail && bootstrapLoading,
      bootstrapError,
      emailMissing,
      setAccountType,
      refreshLocalUser,
    }),
    [
      clerkEmail,
      displayLocalUser,
      user,
      bootstrapLoading,
      bootstrapError,
      emailMissing,
      setAccountType,
      refreshLocalUser,
    ],
  );

  return (
    <LocalUserContext.Provider value={value}>
      {children}
    </LocalUserContext.Provider>
  );
}
