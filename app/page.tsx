import ImageTabs from "@/components/image-tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  GripVertical,
  Layers,
  Zap,
} from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    n: "01",
    title: "Start your board",
    body: "One click. Your Job Hunt board arrives with stages that actually match how hiring works.",
  },
  {
    n: "02",
    title: "Capture every role",
    body: "Company, title, salary, link, notes. Everything lives on a single card — no more spreadsheets.",
  },
  {
    n: "03",
    title: "Drag through stages",
    body: "Move cards from Applied to Interview to Offer as things progress. Your board, your process.",
  },
];

const FEATURES = [
  {
    icon: Layers,
    title: "Stages that match your search",
    body: "Applied, Interview, Offer — rename, reorder, and add columns that fit the way you actually work.",
  },
  {
    icon: GripVertical,
    title: "Drag-and-drop that feels right",
    body: "Move a card and it's saved instantly. No confirm buttons, no reloading, no lost state.",
  },
  {
    icon: Briefcase,
    title: "One card, all the context",
    body: "Company, title, salary range, job link, and notes — together, so nothing gets lost between tabs.",
  },
  {
    icon: Zap,
    title: "Instant, always",
    body: "Built on server caching so the board loads in a blink. No spinners between you and your pipeline.",
  },
];

const PRINCIPLES = [
  {
    title: "Free, and staying that way",
    body: "No trials, no paywalls, no surprise upgrade nudge. Make an account and use the whole thing.",
  },
  {
    title: "Private by default",
    body: "Your board belongs to you. We don't sell it, share it, or train models on it.",
  },
  {
    title: "Fast on first paint",
    body: "Server-cached and streamed. Open the tab, it's already there — even on a slow connection.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5] text-[#1A1714] antialiased">
      <main className="flex-1">
        {/* ------------------------------ HERO ------------------------------ */}
        <section className="relative overflow-hidden">
          {/* Subtle editorial grid, masked to fade out — no blobs, no orbs */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #1A1714 1px, transparent 1px), linear-gradient(to bottom, #1A1714 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage:
                "radial-gradient(ellipse 80% 55% at 50% 0%, #000 40%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 80% 55% at 50% 0%, #000 40%, transparent 100%)",
            }}
          />

          <div className="relative mx-auto max-w-5xl px-5 pb-8 pt-20 sm:px-6 sm:pt-28 lg:pt-32">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center gap-2 text-[13px] font-medium tracking-wide text-[#6B6660]">
                <span className="h-1 w-1 rounded-full bg-[#B4451F]" />
                A job tracker that respects your attention
              </p>

              <h1 className="mt-6 text-balance text-[40px] font-semibold leading-[1.04] tracking-[-0.03em] text-[#1A1714] sm:text-[56px] lg:text-[68px]">
                Every application,
                <br />
                in one calm place.
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-pretty text-[16px] leading-relaxed text-[#6B6660] sm:text-[17px]">
                A Kanban board for your job search. Capture roles, move them
                through stages, and stop losing track in a spreadsheet.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3">
                <Link href="/sign-up" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="h-12 w-full rounded-full bg-[#B4451F] px-7 text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(26,23,20,0.18)] transition-all duration-200 hover:bg-[#9A3412] hover:shadow-[0_8px_22px_-8px_rgba(180,69,31,0.65)] active:scale-[0.985] sm:w-auto"
                  >
                    Start for free
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-12 w-full rounded-full px-6 text-[15px] font-medium text-[#1A1714] hover:bg-[#1A1714]/5 sm:w-auto"
                  >
                    I already have an account
                  </Button>
                </Link>
              </div>

              <p className="mt-5 text-[13px] text-[#8A857E]">
                Free forever · No credit card · Set up in 30 seconds
              </p>
            </div>
          </div>
        </section>

        {/* -------------------------- PRODUCT SHOWCASE ---------------------- */}
        <ImageTabs />

        {/* --------------------------- HOW IT WORKS ------------------------- */}
        <section className="border-t border-[#E8E3DC]/70 bg-[#FAF8F5] py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="max-w-2xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#B4451F]">
                How it works
              </p>
              <h2 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.022em] text-[#1A1714] sm:text-[40px]">
                Three steps from scattered to signed.
              </h2>
            </div>

            <ol className="mt-14 grid gap-10 sm:gap-12 md:grid-cols-3 md:gap-8">
              {STEPS.map((s) => (
                <li key={s.n}>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[13px] tabular-nums text-[#B4451F]">
                      {s.n}
                    </span>
                    <span className="h-px flex-1 bg-[#E8E3DC]" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-[19px] font-semibold tracking-[-0.01em] text-[#1A1714] sm:text-[20px]">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-[#6B6660]">
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------ FEATURES -------------------------- */}
        <section className="border-t border-[#E8E3DC]/70 bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#B4451F]">
                  What&apos;s inside
                </p>
                <h2 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.022em] text-[#1A1714] sm:text-[40px]">
                  Small details, thought through.
                </h2>
              </div>
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-[#1A1714] transition-colors hover:text-[#B4451F]"
              >
                Try it yourself
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-14 grid gap-x-14 gap-y-10 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] text-[#B4451F]">
                    <f.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold tracking-[-0.005em] text-[#1A1714]">
                      {f.title}
                    </h3>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#6B6660]">
                      {f.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------- PRINCIPLES ------------------------- */}
        <section className="border-t border-[#E8E3DC]/70 bg-[#FAF8F5] py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#B4451F]">
              What we won&apos;t do
            </p>
            <h2 className="mt-3 max-w-2xl text-[30px] font-semibold leading-[1.1] tracking-[-0.022em] text-[#1A1714] sm:text-[40px]">
              A short list of promises.
            </h2>

            <div className="mt-14 grid gap-10 sm:gap-8 md:grid-cols-3">
              {PRINCIPLES.map((p) => (
                <div key={p.title} className="border-t border-[#1A1714]/10 pt-6">
                  <h3 className="text-[17px] font-semibold tracking-[-0.005em] text-[#1A1714]">
                    {p.title}
                  </h3>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#6B6660]">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------- FINAL CTA -------------------------- */}
        <section className="bg-[#1A1714] text-[#FAF8F5]">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
            <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#E8A87C]">
                  Ready when you are
                </p>
                <h2 className="mt-4 text-[34px] font-semibold leading-[1.05] tracking-[-0.025em] text-[#FAF8F5] sm:text-[52px]">
                  Start your job hunt
                  <br />
                  board in seconds.
                </h2>
                <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-[#FAF8F5]/65">
                  Sign up, open the dashboard, and drop your first application
                  in. It takes less time than reading this sentence.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Link href="/sign-up" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="h-12 w-full rounded-full bg-[#FAF8F5] px-7 text-[15px] font-medium text-[#1A1714] transition-all duration-200 hover:bg-white active:scale-[0.985] sm:w-auto"
                  >
                    Start for free
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-12 w-full rounded-full px-6 text-[15px] font-medium text-[#FAF8F5] hover:bg-white/10 hover:text-[#FAF8F5] sm:w-auto"
                  >
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-[13px] text-[#FAF8F5]/50 sm:flex-row sm:items-center">
              <p className="inline-flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Job Tracker
              </p>
              <p>A quiet tool for a loud process.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}