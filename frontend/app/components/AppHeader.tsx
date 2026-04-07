"use client";

import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { Bell, Briefcase, ChevronDown, Settings } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useOpenCourtUser } from "@/app/components/LocalUserProvider";

export function AppHeader() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const { localUser } = useOpenCourtUser();

  const signedIn = Boolean(user);
  const isFirm = localUser?.account_type === "firm";
  const isCandidate = localUser?.account_type === "candidate";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-foreground"
        >
          Open Court
        </Link>

        <div className="flex min-h-9 items-center gap-2 sm:gap-3">
          {!clerkLoaded ? null : !signedIn ? (
            <Button size="sm" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          ) : isFirm ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/firm-dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/search">Search Talent</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/firm-opportunities">Add Opportunity</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  void signOut({ redirectUrl: "/" }).catch(() =>
                    toast.error("Could not sign out"),
                  )
                }
                className="cursor-pointer"
              >
                Sign out
              </Button>
            </>
          ) : isCandidate ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/opportunities">Opportunities</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/notifications">
                  <Bell className="mr-1.5 h-4 w-4 sm:inline" />
                  <span className="hidden sm:inline">Notifications</span>
                  <span className="sm:hidden">Alerts</span>
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
                    Account
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/lawyer-settings"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Settings className="h-3.5 w-3.5" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile-builder"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Briefcase className="h-3.5 w-3.5" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      void signOut({ redirectUrl: "/" }).catch(() =>
                        toast.error("Could not sign out"),
                      )
                    }
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                void signOut({ redirectUrl: "/" }).catch(() =>
                  toast.error("Could not sign out"),
                )
              }
            >
              Sign out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
