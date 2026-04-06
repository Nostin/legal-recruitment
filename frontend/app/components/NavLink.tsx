"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type NavLinkProps = React.ComponentPropsWithoutRef<typeof Link> & {
  activeClassName?: string;
};

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, href, ...props }, ref) => {
    const pathname = usePathname();
    const path = typeof href === "string" ? href : href.pathname ?? "";
    const isActive =
      pathname === path ||
      (path !== "/" && path.length > 0 && pathname.startsWith(`${path}/`));

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
