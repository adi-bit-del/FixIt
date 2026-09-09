import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import FixItLogo from "../../components/FixItLogo";
import { forgotPassword } from "./authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);
    setResetUrl(null);

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await forgotPassword({
        email: normalizedEmail,
      });

      setSuccess(true);

      if (response.reset_url) {
        setResetUrl(response.reset_url);
      }
    } catch (requestError: any) {
      const detail = requestError?.response?.data?.detail;

      if (Array.isArray(detail) && detail.length > 0) {
        setError(
          detail[0]?.msg ||
            "Please enter a valid email address.",
        );
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(
          "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--fixit-background)]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(360px,0.85fr)_1.15fr]">
        <aside className="relative hidden overflow-hidden bg-[var(--fixit-primary)] lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,0,127,0.22),transparent_32%)]" />

          <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
            <FixItLogo
              variant="horizontal-white"
              size="sm"
              className="w-auto max-w-[155px]"
              alt="FixIt"
            />

            <div className="max-w-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-white ring-1 ring-white/15">
                <KeyRound size={23} />
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-white xl:text-5xl">
                Secure your FixIt
                <br />
                account.
              </h1>

              <p className="mt-5 max-w-sm text-base leading-7 text-white/75">
                Reset your password securely and get
                back to managing your services without
                unnecessary friction.
              </p>

              <div className="mt-8 flex items-start gap-3 text-sm text-white/72">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span>
                  Your password reset token is temporary
                  and can only be used once.
                </span>
              </div>
            </div>

            <p className="text-xs text-white/55">
              © {new Date().getFullYear()} FixIt. All
              rights reserved.
            </p>
          </div>
        </aside>

        <main className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <FixItLogo
                variant="horizontal"
                size="sm"
                className="w-auto max-w-[145px]"
                alt="FixIt"
              />
            </div>

            <Link
              to="/login"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--fixit-muted)] transition hover:text-[var(--fixit-primary)]"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>

            {!success ? (
              <>
                <div className="mb-8">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                    <Mail size={21} />
                  </div>

                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--fixit-text)]">
                    Forgot your password?
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[var(--fixit-muted)]">
                    Enter the email address associated with
                    your FixIt account and we'll help you
                    reset your password.
                  </p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mb-5 rounded-xl border border-[color:rgb(239_68_68_/_0.18)] bg-[color:rgb(239_68_68_/_0.06)] px-4 py-3 text-sm text-[var(--fixit-error)]"
                  >
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="mb-2 block text-sm font-medium text-[var(--fixit-text)]"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fixit-muted)]"
                      />

                      <input
                        id="forgot-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="you@example.com"
                        disabled={isSubmitting}
                        className="h-12 w-full rounded-xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] pl-11 pr-4 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-disabled)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)] disabled:cursor-not-allowed disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fixit-primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--fixit-primary-ring)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Generating reset link...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-[var(--fixit-muted)]">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-[var(--fixit-primary)] transition hover:text-[var(--fixit-primary-hover)]"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            ) : (
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[color:rgb(16_185_129_/_0.1)] text-[var(--fixit-success)]">
                  <CheckCircle2 size={24} />
                </div>

                <h2 className="text-3xl font-semibold tracking-tight text-[var(--fixit-text)]">
                  Check your reset link
                </h2>

                <p className="mt-3 text-sm leading-6 text-[var(--fixit-muted)]">
                  {resetUrl
                    ? "Your password reset link has been generated successfully."
                    : "If an account exists for this email, a password reset link has been generated."}
                </p>

                {resetUrl && (
                  <div className="mt-6 rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fixit-muted)]">
                      Development reset link
                    </p>

                    <p className="mt-2 break-all text-sm leading-6 text-[var(--fixit-text)]">
                      {resetUrl}
                    </p>

                    <Link
                      to={resetUrl}
                      className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--fixit-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)]"
                    >
                      Open reset page
                    </Link>
                  </div>
                )}

                <div className="mt-6 rounded-xl bg-[var(--fixit-primary-soft)] px-4 py-3 text-sm leading-6 text-[var(--fixit-text)]">
                  <strong className="font-semibold">
                    Development mode:
                  </strong>{" "}
                  FixIt is currently showing the reset
                  link directly because email delivery has
                  not been configured yet.
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/login"
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] px-4 text-sm font-semibold text-[var(--fixit-text)] transition hover:bg-slate-50"
                  >
                    Back to login
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false);
                      setResetUrl(null);
                      setError("");
                    }}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[var(--fixit-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)]"
                  >
                    Try another email
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}