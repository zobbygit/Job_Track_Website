"use client";

import { Briefcase, LayoutDashboard, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import SignOutButton from "./sign-out-btn";
import { useSession } from "@/lib/auth/auth-client";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      {/* Subtle top gradient accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"
      />

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        {/* ------------------------------ BRAND ------------------------------ */}
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 rounded-xl outline-none transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_6px_16px_-6px_rgba(79,70,229,0.7)] transition-transform duration-300 group-hover:scale-[1.04] sm:h-10 sm:w-10">
            <Briefcase className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </span>
          <span className="min-w-0 truncate text-[15px] font-semibold tracking-tight text-slate-900 sm:text-base">
            Job Tracker
          </span>
        </Link>

        {/* ------------------------------ ACTIONS ---------------------------- */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {session?.user ? (
            <>
              {/* Dashboard link — with active pill state */}
              <Button
                variant="ghost"
                asChild
                className={`hidden h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors duration-200 sm:inline-flex ${
                  isDashboard
                    ? "bg-slate-100 text-slate-900 hover:bg-slate-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>

              {/* Mobile: icon-only dashboard link */}
              <Link
                href="/dashboard"
                aria-label="Dashboard"
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200 sm:hidden ${
                  isDashboard
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 shrink-0 rounded-full p-0 ring-1 ring-slate-200/80 transition-all duration-200 hover:ring-slate-300 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 data-[state=open]:ring-indigo-300 sm:h-9 sm:w-9"
                    aria-label="Open user menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
                        {session.user.name?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-64 rounded-2xl border-slate-200/80 p-1.5 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.25)]"
                  align="end"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="p-2.5 font-normal">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
                          {session.user.name?.[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <p className="truncate text-sm font-medium leading-tight text-slate-900">
                          {session.user.name}
                        </p>
                        <p className="truncate text-xs leading-tight text-slate-500">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <div className="my-1 h-px bg-slate-100" />

                  <SignOutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className="hidden h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-900 sm:inline-flex"
              >
                <Link href="/sign-in">
                  <LogIn className="h-4 w-4" />
                  Log in
                </Link>
              </Button>

              {/* Mobile: compact sign-in */}
              <Link
                href="/sign-in"
                aria-label="Log in"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-900 sm:hidden"
              >
                <LogIn className="h-4 w-4" />
              </Link>

              <Button
                asChild
                className="h-9 rounded-xl bg-slate-900 px-3.5 text-sm font-medium text-white shadow-[0_6px_16px_-8px_rgba(15,23,42,0.6)] transition-all duration-200 hover:bg-slate-800 hover:shadow-[0_8px_20px_-8px_rgba(15,23,42,0.7)] focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 active:scale-[0.98] sm:px-4"
              >
                <Link href="/sign-up" className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Start for free</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}