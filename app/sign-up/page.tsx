"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth/auth-client";
import { Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/*                          PASSWORD STRENGTH LOGIC                           */
/* -------------------------------------------------------------------------- */

type Strength = {
  score: 0 | 1 | 2 | 3;      // 0 = empty, 1 = weak, 2 = medium, 3 = strong
  label: "Weak" | "Medium" | "Strong" | "";
  color: string;             // text color class
  bar: string;               // filled bar color class
  checks: { label: string; passed: boolean }[];
};

function evaluatePassword(pw: string): Strength {
  const checks = [
    { label: "8+ characters", passed: pw.length >= 8 },
    { label: "Upper & lowercase", passed: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { label: "A number", passed: /\d/.test(pw) },
    { label: "A symbol", passed: /[^A-Za-z0-9]/.test(pw) },
  ];

  const passedCount = checks.filter((c) => c.passed).length;

  if (pw.length === 0) {
    return {
      score: 0,
      label: "",
      color: "text-slate-400",
      bar: "bg-slate-200",
      checks,
    };
  }

  // Weak: < 8 chars, or only 1 rule satisfied
  if (pw.length < 8 || passedCount <= 1) {
    return {
      score: 1,
      label: "Weak",
      color: "text-rose-600",
      bar: "bg-rose-500",
      checks,
    };
  }

  // Strong: 12+ chars AND all 4 rules passed
  if (pw.length >= 12 && passedCount === 4) {
    return {
      score: 3,
      label: "Strong",
      color: "text-emerald-600",
      bar: "bg-emerald-500",
      checks,
    };
  }

  // Medium: 8+ chars and at least 2 rules
  return {
    score: 2,
    label: "Medium",
    color: "text-amber-600",
    bar: "bg-amber-500",
    checks,
  };
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = useMemo(() => evaluatePassword(password), [password]);

  // Segments fill left-to-right up to `score`
  const segmentActive = (i: number) => strength.score > i;

  const segmentColor = (i: number) => {
    if (!segmentActive(i)) return "bg-slate-200";
    return strength.bar;
  };

  return (
    <div className="space-y-2 pt-1" aria-live="polite">
      {/* Segmented bar */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ease-out ${segmentColor(
                i,
              )}`}
            />
          ))}
        </div>
        <span
          className={`min-w-[52px] text-right text-[11px] font-semibold tabular-nums transition-colors duration-200 ${strength.color}`}
        >
          {strength.label || "\u00A0"}
        </span>
      </div>

      {/* Requirement checklist — only when the user has typed something */}
      {password.length > 0 && (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
          {strength.checks.map((c) => (
            <li
              key={c.label}
              className={`flex items-center gap-1.5 text-[11px] leading-tight transition-colors duration-200 ${
                c.passed ? "text-slate-600" : "text-slate-400"
              }`}
            >
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                  c.passed
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 bg-transparent"
                }`}
              >
                {c.passed && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
              </span>
              <span className="truncate">{c.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SIGN UP PAGE                                  */
/* -------------------------------------------------------------------------- */

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  /**
   * Same anti-autofill trap fix as the sign-in page: React's controlled
   * inputs don't notice when the browser writes to input.value directly,
   * so we clear via ref + dispatch a real `input` event to resync React's
   * internal tracker. Runs at several timings to catch late injections.
   */
  useEffect(() => {
    const forceClear = () => {
      for (const ref of [nameRef, emailRef, passwordRef]) {
        const el = ref.current;
        if (el && el.value !== "") {
          el.value = "";
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
      setName("");
      setEmail("");
      setPassword("");
    };

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
      const result = await signUp.email({ name, email, password });

      if (result.error) {
        setError(result.error.message ?? "Failed to sign up");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  // Block submit until password meets minimum bar (>= 8 chars)
  const passwordTooShort = password.length > 0 && password.length < 8;

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
        .delay-375 { animation-delay: 375ms; }

        /* Chrome autofill detection + cosmetic override */
        @keyframes onAutoFillStart { from { opacity: 1; } to { opacity: 1; } }
        @keyframes onAutoFillCancel { from { opacity: 1; } to { opacity: 1; } }
        input:-webkit-autofill {
          animation-name: onAutoFillStart !important;
          animation-duration: 0.001s !important;
        }
        input:not(:-webkit-autofill) {
          animation-name: onAutoFillCancel !important;
          animation-duration: 0.001s !important;
        }
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
        {/* Mobile top illustration strip */}
        <div className="relative h-36 overflow-hidden sm:h-44 lg:hidden">
          <IllustrationPanel compact />
        </div>

        {/* Form column */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div className="animate-fade-up">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Create account
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-[15px]">
              Let&apos;s get started — build your job tracker in seconds.
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

            {/* Name */}
            <div className="animate-fade-up delay-75 space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-slate-700"
              >
                Name
              </Label>
              <Input
                id="name"
                ref={nameRef}
                type="text"
                name="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onAnimationStart={(
                  e: React.AnimationEvent<HTMLInputElement>,
                ) => {
                  if (e.animationName === "onAutoFillStart") {
                    e.currentTarget.value = "";
                    e.currentTarget.dispatchEvent(
                      new Event("input", { bubbles: true }),
                    );
                    setName("");
                  }
                }}
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="h-11 rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Email */}
            <div className="animate-fade-up delay-150 space-y-2">
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
                placeholder="you@example.com"
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
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="h-11 rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Password + strength meter */}
            <div className="animate-fade-up delay-225 space-y-2">
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
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  aria-invalid={passwordTooShort}
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

              <PasswordStrengthMeter password={password} />
            </div>

            {/* Submit */}
            <div className="animate-fade-up delay-300 pt-1">
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
                  {loading ? "Creating account..." : "Create account"}
                </span>
              </Button>
            </div>

            {/* Footer link */}
            <p className="animate-fade-up delay-375 pt-1 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-indigo-600 underline-offset-4 transition-colors hover:text-indigo-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>

        {/* Desktop illustration */}
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
      {/* Sun glow */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[38%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,244,214,0.9) 0%, rgba(251,211,141,0.5) 28%, transparent 62%)",
        }}
      />
      {/* Sun core */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[38%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFF7E0] shadow-[0_0_80px_30px_rgba(255,247,224,0.55)]"
      />

      {/* Stars */}
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

      {/* Birds */}
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

      {/* Landscape */}
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

      {/* Bottom vignette for caption readability */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/65 via-black/25 to-transparent"
      />

      {/* Premium glass caption — desktop only */}
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
              Organize every application, from first touch to signed offer.
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