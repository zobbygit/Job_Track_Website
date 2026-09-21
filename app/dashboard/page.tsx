import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { cacheTag } from "next/cache";
import { serialize } from "@/lib/utils";
import KanbanBoard from "@/components/kanban-board";

/* -------------------------------------------------------------------------- */
/*                                   ICONS                                    */
/*                          (inline SVG — zero deps)                          */
/* -------------------------------------------------------------------------- */

type IconName =
  | "briefcase"
  | "layers"
  | "trophy"
  | "activity"
  | "inbox"
  | "logout";

function Icon({
  name,
  className = "h-4 w-4",
}: {
  name: IconName;
  className?: string;
}) {
  const base = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
    focusable: false,
  };

  switch (name) {
    case "briefcase":
      return (
        <svg {...base}>
          <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
          <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" />
          <path d="M3 12.5h18" />
        </svg>
      );
    case "layers":
      return (
        <svg {...base}>
          <path d="m12 3 8.5 4.7L12 12.4 3.5 7.7 12 3Z" />
          <path d="m3.5 12.2 8.5 4.7 8.5-4.7" />
        </svg>
      );
    case "trophy":
      return (
        <svg {...base}>
          <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
          <path d="M8 5.5H5.5V7A3.5 3.5 0 0 0 8 10.4" />
          <path d="M16 5.5h2.5V7A3.5 3.5 0 0 1 16 10.4" />
          <path d="M12 13v3.5" />
          <path d="M9.5 20h5" />
        </svg>
      );
    case "activity":
      return (
        <svg {...base}>
          <path d="M3 12h4l2.5-6 4 12 2.5-6h5" />
        </svg>
      );
    case "inbox":
      return (
        <svg {...base}>
          <path d="M3 13h4.5l1.5 2.5h6L16.5 13H21" />
          <path d="M5.5 4.5h13l2.5 8.5v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4l2.5-8.5Z" />
        </svg>
      );
    case "logout":
      return (
        <svg {...base}>
          <path d="m15.5 16.5 4.5-4.5-4.5-4.5" />
          <path d="M20 12H9" />
          <path d="M12 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H12" />
        </svg>
      );
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                              DATA FETCHING                                 */
/* -------------------------------------------------------------------------- */
async function getBoard(userId: string) {
  "use cache";

  // Anchors invalidation — every server action calls revalidateTag(`board-${userId}`)
  cacheTag(`board-${userId}`);

  await connectDB();

  const boardDoc = await Board.findOne({
    userId,
    name: "Job Hunt",
  }).populate({
    path: "columns",
    populate: {
      path: "jobApplications",
    },
  });

  if (!boardDoc) return null;

  return serialize(boardDoc);
}

/* -------------------------------------------------------------------------- */
/*                              STAT CARD                                      */
/* -------------------------------------------------------------------------- */
function StatCard({
  icon,
  label,
  value,
  hint,
  compact = false,
  accent = "indigo",
}: {
  icon: IconName;
  label: string;
  value: string;
  hint: string;
  compact?: boolean;
  accent?: "indigo" | "violet" | "emerald" | "amber";
}) {
  const accents: Record<string, string> = {
    indigo:
      "group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:ring-indigo-100",
    violet:
      "group-hover:text-violet-600 group-hover:bg-violet-50 group-hover:ring-violet-100",
    emerald:
      "group-hover:text-emerald-600 group-hover:bg-emerald-50 group-hover:ring-emerald-100",
    amber:
      "group-hover:text-amber-600 group-hover:bg-amber-50 group-hover:ring-amber-100",
  };

  const bars: Record<string, string> = {
    indigo: "from-indigo-500 via-violet-500 to-transparent",
    violet: "from-violet-500 via-fuchsia-500 to-transparent",
    emerald: "from-emerald-500 via-teal-500 to-transparent",
    amber: "from-amber-500 via-orange-500 to-transparent",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_28px_-14px_rgba(15,23,42,0.22)] sm:p-5">
      {/* top accent revealed on hover */}
      <span
        className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${bars[accent]}`}
      />

      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:text-[11px]">
          {label}
        </span>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200/70 transition-colors duration-300 sm:h-8 sm:w-8 ${accents[accent]}`}
        >
          <Icon name={icon} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </span>
      </div>

      <p
        className={
          compact
            ? "mt-3 truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg"
            : "mt-2.5 text-xl font-semibold tracking-tight text-slate-900 tabular-nums sm:mt-3 sm:text-3xl"
        }
        title={value}
      >
        {value}
      </p>

      <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:mt-1 sm:text-xs">
        {hint}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            LOADING SKELETON                                */
/* -------------------------------------------------------------------------- */
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 sm:pt-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="h-3 w-16 animate-pulse rounded bg-slate-100 sm:w-20" />
                <div className="h-7 w-7 animate-pulse rounded-lg bg-slate-100 sm:h-8 sm:w-8" />
              </div>
              <div className="mt-3 h-6 w-14 animate-pulse rounded bg-slate-200 sm:h-8 sm:w-20" />
              <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-100 sm:w-28" />
            </div>
          ))}
        </div>

        {/* Board */}
        <div className="mt-6 sm:mt-8">
          <div className="mb-3 space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="flex gap-3 overflow-hidden pb-2 sm:gap-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[78vw] max-w-[300px] shrink-0 space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 sm:w-[300px]"
              >
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-20 animate-pulse rounded-xl bg-white" />
                <div className="h-20 animate-pulse rounded-xl bg-white" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            DASHBOARD CONTENT                               */
/* -------------------------------------------------------------------------- */
async function DashboardContent() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const board = await getBoard(session.user.id);

  /* ----------------------------- EMPTY STATE ----------------------------- */
  if (!board) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-[0_8px_30px_-16px_rgba(15,23,42,0.2)] sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-200/70">
            <Icon name="inbox" className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
            No board found
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            We couldn’t find your board. This usually means the initial setup
            didn’t complete.
          </p>
          <a
            href="/api/auth/sign-out"
            className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <Icon name="logout" className="h-4 w-4" />
            Sign out and try again
          </a>
        </div>
      </div>
    );
  }

  /* --------------------------- DERIVED STATS ----------------------------- */
  const boardAny = board as unknown as {
    name?: string;
    columns?: unknown;
  };

  type StageLike = { name?: string; jobApplications?: unknown[] };

  const columns = (
    Array.isArray(boardAny.columns) ? boardAny.columns : []
  ) as StageLike[];

  const stageCounts = columns.map((c) => ({
    name:
      typeof c?.name === "string" && c.name.trim().length > 0
        ? c.name.trim()
        : "Untitled",
    count: Array.isArray(c?.jobApplications) ? c.jobApplications.length : 0,
  }));

  const totalApplications = stageCounts.reduce((sum, s) => sum + s.count, 0);
  const activeStages = stageCounts.filter((s) => s.count > 0).length;
  const emptyStages = stageCounts.length - activeStages;

  const topStage = stageCounts.reduce<{ name: string; count: number } | null>(
    (best, s) => (!best || s.count > best.count ? s : best),
    null,
  );

  const topStageLabel = topStage && topStage.count > 0 ? topStage.name : "—";
  const topStageHint =
    topStage && topStage.count > 0
      ? `${topStage.count} application${topStage.count === 1 ? "" : "s"}`
      : "Nothing here yet";

  const avgPerStage = stageCounts.length
    ? Math.round((totalApplications / stageCounts.length) * 10) / 10
    : 0;

  /* ------------------------------- RENDER -------------------------------- */
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* Ambient wash — purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(99,102,241,0.07),transparent_70%)]"
      />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
        {/* ------------------------------ PAGE TITLE ------------------------ */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 sm:mb-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500 sm:text-xs">
                Command Center
              </span>
            </div>
            <h1 className="mt-1.5 truncate text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {board.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-[15px]">
              Track every application, from first touch to offer.
            </p>
          </div>
        </header>

        {/* ------------------------------ STATS ----------------------------- */}
        <section aria-label="Application statistics">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              icon="briefcase"
              label="Total"
              value={String(totalApplications)}
              hint={`across ${stageCounts.length} stage${
                stageCounts.length === 1 ? "" : "s"
              }`}
              accent="indigo"
            />
            <StatCard
              icon="layers"
              label="Active stages"
              value={String(activeStages)}
              hint={`of ${stageCounts.length} total`}
              accent="violet"
            />
            <StatCard
              icon="trophy"
              label="Top stage"
              value={topStageLabel}
              hint={topStageHint}
              compact
              accent="amber"
            />
            <StatCard
              icon="activity"
              label="Avg / stage"
              value={String(avgPerStage)}
              hint={
                emptyStages > 0
                  ? `${emptyStages} stage${emptyStages === 1 ? "" : "s"} empty`
                  : "All stages active"
              }
              accent="emerald"
            />
          </div>
        </section>

        {/* ------------------------------ BOARD ----------------------------- */}
        <section aria-label="Application pipeline" className="mt-8 sm:mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-2 sm:mb-5">
            <div className="min-w-0">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500 sm:text-xs">
                Pipeline
              </h2>
              <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                Drag cards between stages to update progress.
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              {totalApplications} application
              {totalApplications === 1 ? "" : "s"}
            </span>
          </div>

          <KanbanBoard board={board} userId={session.user.id} />
        </section>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PAGE EXPORT                                   */
/* -------------------------------------------------------------------------- */
export default async function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}