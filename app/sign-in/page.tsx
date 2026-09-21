"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/auth-client";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  /**
   * The React controlled-input trap:
   *
   * React only writes to input.value when the `value` prop it tracks
   * changes. If Chrome (or a password manager) sets input.value directly,
   * React has no idea — the DOM shows the injected value, but React state
   * is still "". Calling setEmail("") on a value that's already "" is a
   * no-op, so the DOM never gets cleared.
   *
   * The only reliable fix is to (a) clear the DOM value directly via ref,
   * and (b) dispatch a real `input` event so React's internal tracker
   * syncs up. Run it multiple times to beat late autofill injections.
   */
  useEffect(() => {
    const forceClear = () => {
      const e = emailRef.current;
      const p = passwordRef.current;

      if (e && e.value !== "") {
        e.value = "";
        e.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (p && p.value !== "") {
        p.value = "";
        p.dispatchEvent(new Event("input", { bubbles: true }));
      }

      // Also reset React state in case a fill happened via React itself
      setEmail("");
      setPassword("");
    };

    // Clear at several points — Chrome injects at unpredictable times
    forceClear();
    const raf = requestAnimationFrame(forceClear);
    const t1 = setTimeout(forceClear, 60);
    const t2 = setTimeout(forceClear, 250);
    const t3 = setTimeout(forceClear, 600);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Failed to sign in");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 px-3 py-6 sm:px-6 sm:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl"
      />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .delay-75  { animation-delay: 75ms; }
        .delay-150 { animation-delay: 150ms; }
        .delay-225 { animation-delay: 225ms; }
        .delay-300 { animation-delay: 300ms; }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #0f172a !important;
          caret-color: #0f172a !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }
      `}</style>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:grid-cols-2">
        <div className="relative h-36 overflow-hidden sm:h-44 lg:hidden">
          <IllustrationPanel compact />
        </div>

        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div className="animate-fade-up">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Hello Again!
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-[15px]">
              Sign in to continue to your job tracker.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="mt-8 space-y-5 sm:mt-10"
          >
            {error && (
              <div
                role="alert"
                className="animate-fade-up rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="animate-fade-up delay-75 space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email
              </Label>
              <Input
                id="email"
                ref={emailRef}
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onAnimationStart={(
                  e: React.AnimationEvent<HTMLInputElement>,
                ) => {
                  if (e.animationName === "onAutoFillStart") {
                    e.currentTarget.value = "";
                    e.currentTarget.dispatchEvent(
                      new Event("input", { bubbles: true }),
                    );
                    setEmail("");
                  }
                }}
                placeholder="you@example.com"
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="h-11 rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="animate-fade-up delay-150 space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onAnimationStart={(
                    e: React.AnimationEvent<HTMLInputElement>,
                  ) => {
                    if (e.animationName === "onAutoFillStart") {
                      e.currentTarget.value = "";
                      e.currentTarget.dispatchEvent(
                        new Event("input", { bubbles: true }),
                      );
                      setPassword("");
                    }
                  }}
                  placeholder="Enter your password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="h-11 rounded-xl border-slate-200 bg-white pr-11 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="animate-fade-up delay-225 pt-1">
              <Button
                type="submit"
                disabled={loading}
                className="group relative h-11 w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(79,70,229,0.8)] transition-all duration-300 hover:shadow-[0_14px_30px_-10px_rgba(79,70,229,0.9)] hover:brightness-110 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative inline-flex items-center gap-2">
                  {loading && (
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeOpacity="0.25"
                      />
                      <path
                        d="M22 12a10 10 0 0 0-10-10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                  {loading ? "Signing in..." : "Sign In"}
                </span>
              </Button>
            </div>

            <p className="animate-fade-up delay-300 pt-1 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-indigo-600 underline-offset-4 transition-colors hover:text-indigo-700 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>

        <div className="relative hidden lg:block">
          <IllustrationPanel />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          ILLUSTRATION PANEL                                */
/* -------------------------------------------------------------------------- */

function IllustrationPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="relative h-full min-h-[560px] w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #3D2B5C 0%, #6B3F70 20%, #A85C7A 42%, #D98E76 62%, #F0B87F 80%, #FBE3B8 100%)",
      }}
    >
      <div
        aria-hidden
        className="absolute left-1/2 top-[38%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,244,214,0.9) 0%, rgba(251,211,141,0.5) 28%, transparent 62%)",
        }}
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-[38%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFF7E0] shadow-[0_0_80px_30px_rgba(255,247,224,0.55)]"
      />

      <svg
        aria-hidden
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 h-[28%] w-full"
      >
        <g fill="#FFFFFF" opacity="0.7">
          <circle cx="60" cy="40" r="1.5" />
          <circle cx="140" cy="22" r="1" />
          <circle cx="220" cy="55" r="1.2" />
          <circle cx="340" cy="30" r="1" />
          <circle cx="440" cy="65" r="1.4" />
          <circle cx="520" cy="35" r="1" />
          <circle cx="580" cy="80" r="1.1" />
        </g>
      </svg>

      <svg
        aria-hidden
        viewBox="0 0 200 100"
        className="absolute left-[8%] top-[16%] h-10 w-24 opacity-70"
      >
        <g stroke="#2A2145" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M20 40 q8 -8 16 0 q8 -8 16 0" />
          <path d="M60 30 q6 -6 12 0 q6 -6 12 0" />
        </g>
      </svg>

      <svg
        aria-hidden
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-[72%] w-full"
      >
        <path
          d="M0 220 L90 150 L170 195 L250 130 L340 185 L430 125 L520 180 L600 145 L600 400 L0 400 Z"
          fill="#6E5580"
          opacity="0.85"
        />
        <path
          d="M0 280 L110 205 L210 255 L320 175 L430 240 L550 190 L600 225 L600 400 L0 400 Z"
          fill="#4B3A64"
        />
        <path
          d="M0 330 Q150 280 300 315 T600 290 L600 400 L0 400 Z"
          fill="#2A2145"
        />
        <path
          d="M0 370 Q140 320 300 355 T600 340 L600 400 L0 400 Z"
          fill="#16112A"
        />
        <g
          stroke="#B6A8D6"
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
          strokeLinecap="round"
        >
          <path d="M100 350 q40 -14 80 -2" />
          <path d="M330 340 q50 -12 100 0" />
        </g>
        <g fill="#0D0820">
          <PineTree x={70} y={395} scale={0.9} />
          <PineTree x={120} y={400} scale={0.65} />
          <PineTree x={185} y={385} scale={1} />
          <PineTree x={265} y={398} scale={0.8} />
          <PineTree x={340} y={390} scale={0.95} />
          <PineTree x={420} y={400} scale={0.7} />
          <PineTree x={490} y={390} scale={0.9} />
          <PineTree x={555} y={398} scale={0.75} />
        </g>
      </svg>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/65 via-black/25 to-transparent"
      />

      {!compact && (
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <div className="max-w-sm rounded-2xl border border-white/15 bg-white/[0.08] p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75">
                Job Tracker
              </span>
            </div>

            <p className="mt-3 text-2xl font-semibold leading-[1.15] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              Finally, in your{" "}
              <span className="bg-gradient-to-r from-amber-200 via-rose-200 to-violet-200 bg-clip-text italic text-transparent">
                dream
              </span>{" "}
              workspace.
            </p>

            <p className="mt-2 text-[13px] leading-relaxed text-white/70">
              Organize every application, first touch to signed offer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PineTree({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 -75 L10 -52 L-10 -52 Z" />
      <path d="M0 -60 L15 -32 L-15 -32 Z" />
      <path d="M0 -42 L20 -12 L-20 -12 Z" />
      <rect x="-2" y="-12" width="4" height="20" />
    </g>
  );
}