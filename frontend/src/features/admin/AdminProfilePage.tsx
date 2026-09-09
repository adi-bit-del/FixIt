import {
  CheckCircle2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAuth } from "../auth/AuthContext";

export default function AdminProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="animate-pulse space-y-6">
          <div>
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-9 w-56 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-80 rounded bg-slate-200" />
          </div>

          <div className="rounded-2xl border border-[var(--fixit-border)] bg-white p-6">
            <div className="h-16 w-16 rounded-2xl bg-slate-200" />

            <div className="mt-5 h-6 w-32 rounded bg-slate-200" />

            <div className="mt-3 h-4 w-64 rounded bg-slate-200" />
          </div>

          <div className="rounded-2xl border border-[var(--fixit-border)] bg-white p-6">
            <div className="h-6 w-48 rounded bg-slate-200" />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="h-20 rounded bg-slate-100" />
              <div className="h-20 rounded bg-slate-100" />
              <div className="h-20 rounded bg-slate-100" />
              <div className="h-20 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            Admin account could not be loaded.
          </p>

          <p className="mt-1 text-sm text-red-600">
            Please sign in again to continue.
          </p>
        </div>
      </div>
    );
  }

  const roleLabel =
    user.roles.length > 0
      ? user.roles.join(", ")
      : "ADMIN";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-[var(--fixit-primary)]">
          Account
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--fixit-text)] sm:text-3xl">
          Admin Profile
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)] sm:text-base">
          View the account currently managing the FixIt platform.
        </p>
      </header>

      <div className="space-y-6">
        {/* Identity */}

        <section className="rounded-2xl border border-[var(--fixit-border)] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--fixit-primary-active)] text-xl font-bold text-white ring-4 ring-[var(--fixit-primary-soft)]">
              A
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-[var(--fixit-text)]">
                  Admin
                </h2>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="mt-1 break-all text-sm text-[var(--fixit-text-muted)]">
                {user.email}
              </p>
            </div>
          </div>
        </section>

        {/* Account information */}

        <section className="rounded-2xl border border-[var(--fixit-border)] bg-white shadow-sm">
          <div className="border-b border-[var(--fixit-border)] px-6 py-5">
            <h2 className="text-lg font-semibold text-[var(--fixit-text)]">
              Account information
            </h2>

            <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
              Basic details associated with this FixIt account.
            </p>
          </div>

          <div className="grid sm:grid-cols-2">
            <InfoRow
              icon={Mail}
              label="Email address"
              value={user.email}
            />

            <InfoRow
              icon={UserRound}
              label="User ID"
              value={`#${user.id}`}
            />

            <InfoRow
              icon={ShieldCheck}
              label="Role"
              value={roleLabel}
            />

            <InfoRow
              icon={CheckCircle2}
              label="Account status"
              value={user.is_active ? "Active" : "Inactive"}
            />
          </div>
        </section>

        {/* Security */}

        <section className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)]">
              <ShieldCheck className="h-4 w-4 text-[var(--fixit-primary)]" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[var(--fixit-text)]">
                Account security
              </h2>

              <p className="mt-1 text-sm leading-6 text-[var(--fixit-text-muted)]">
                Admin authentication is handled through the FixIt
                login system. Password changes and other security
                settings are not exposed here because the current
                backend does not provide those operations.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-[var(--fixit-border)] p-5 last:border-b-0 sm:nth-[2n]:border-l sm:nth-[2n]:border-b-0">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--fixit-primary-soft)]">
          <Icon className="h-4 w-4 text-[var(--fixit-primary)]" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--fixit-text-muted)]">
            {label}
          </p>

          <p className="mt-1 break-all text-sm font-medium text-[var(--fixit-text)]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}