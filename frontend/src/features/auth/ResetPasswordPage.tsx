import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import FixItLogo from "../../components/FixItLogo";
import { resetPassword } from "./authApi";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(
    () => searchParams.get("token") ?? "",
    [searchParams],
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!token) {
      setError(
        "This password reset link is invalid or incomplete.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Your new password must be at least 8 characters long.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        token,
        new_password: password,
      });

      setSuccess(true);
    } catch (requestError: any) {
      const detail =
        requestError?.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
      } else if (
        Array.isArray(detail) &&
        detail.length > 0
      ) {
        setError(
          detail[0]?.msg ||
            "Unable to reset your password.",
        );
      } else {
        setError(
          "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
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
                  <ShieldCheck size={23} />
                </div>

                <h1 className="text-4xl font-semibold tracking-tight text-white xl:text-5xl">
                  You're back
                  <br />
                  in control.
                </h1>

                <p className="mt-5 max-w-sm text-base leading-7 text-white/75">
                  Your FixIt account password has been
                  updated successfully.
                </p>
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

              <div className="rounded-3xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-7 shadow-sm sm:p-9">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:rgb(16_185_129_/_0.1)] text-[var(--fixit-success)]">
                  <CheckCircle2 size={24} />
                </div>

                <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[var(--fixit-text)]">
                  Password updated
                </h2>

                <p className="mt-3 text-sm leading-6 text-[var(--fixit-muted)]">
                  Your password has been changed successfully.
                  You can now sign in using your new password.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[var(--fixit-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
                >
                  Continue to login
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
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
                Create a new
                <br />
                password.
              </h1>

              <p className="mt-5 max-w-sm text-base leading-7 text-white/75">
                Choose a strong password to keep your
                FixIt account protected.
              </p>
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

            <div className="mb-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                <KeyRound size={21} />
              </div>

              <h2 className="text-3xl font-semibold tracking-tight text-[var(--fixit-text)]">
                Reset your password
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--fixit-muted)]">
                Enter a new password for your FixIt
                account.
              </p>
            </div>

            {!token && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-[color:rgb(239_68_68_/_0.18)] bg-[color:rgb(239_68_68_/_0.06)] px-4 py-3 text-sm leading-6 text-[var(--fixit-error)]"
              >
                This password reset link is invalid or
                incomplete. Please request a new reset link.
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-[color:rgb(239_68_68_/_0.18)] bg-[color:rgb(239_68_68_/_0.06)] px-4 py-3 text-sm leading-6 text-[var(--fixit-error)]"
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
                  htmlFor="reset-password"
                  className="mb-2 block text-sm font-medium text-[var(--fixit-text)]"
                >
                  New password
                </label>

                <div className="relative">
                  <input
                    id="reset-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your new password"
                    disabled={
                      isSubmitting || !token
                    }
                    className="h-12 w-full rounded-xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] px-4 pr-12 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-disabled)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)] disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current,
                      )
                    }
                    disabled={
                      isSubmitting || !token
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--fixit-muted)] transition hover:text-[var(--fixit-text)] disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-[var(--fixit-muted)]">
                  Use at least 8 characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="reset-password-confirm"
                  className="mb-2 block text-sm font-medium text-[var(--fixit-text)]"
                >
                  Confirm new password
                </label>

                <div className="relative">
                  <input
                    id="reset-password-confirm"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Re-enter your new password"
                    disabled={
                      isSubmitting || !token
                    }
                    className="h-12 w-full rounded-xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] px-4 pr-12 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-disabled)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)] disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current,
                      )
                    }
                    disabled={
                      isSubmitting || !token
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--fixit-muted)] transition hover:text-[var(--fixit-text)] disabled:cursor-not-allowed"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting || !token
                }
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fixit-primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--fixit-primary-ring)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Updating password...
                  </>
                ) : (
                  "Update password"
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
          </div>
        </main>
      </div>
    </div>
  );
}