import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  DollarSign,
  Search,
  XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  type AdminQuote,
  getAdminQuotes,
} from "./adminApi";

type StatusFilter =
  | "ALL"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

const statusFilters: StatusFilter[] = [
  "ALL",
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
];

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function getStatusClasses(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-[rgb(245_158_11/0.10)] text-[var(--fixit-warning)]";
    case "ACCEPTED":
      return "bg-[rgb(16_185_129/0.10)] text-[var(--fixit-success)]";
    case "REJECTED":
      return "bg-[rgb(239_68_68/0.10)] text-[var(--fixit-error)]";
    case "EXPIRED":
      return "bg-[rgb(100_116_139/0.10)] text-[var(--fixit-muted)]";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "PENDING":
      return Clock3;
    case "ACCEPTED":
      return CheckCircle2;
    case "REJECTED":
      return XCircle;
    case "EXPIRED":
      return AlertCircle;
    default:
      return Clock3;
  }
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function AdminQuotesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const {
    data: quotes = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<AdminQuote[]>({
    queryKey: ["admin-quotes"],
    queryFn: getAdminQuotes,
  });

  const metrics = useMemo(() => {
    const totalValue = quotes.reduce(
      (sum, quote) => sum + Number(quote.amount),
      0,
    );

    return {
      total: quotes.length,
      pending: quotes.filter(
        (quote) => quote.status === "PENDING",
      ).length,
      accepted: quotes.filter(
        (quote) => quote.status === "ACCEPTED",
      ).length,
      totalValue,
    };
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return quotes.filter((quote) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        quote.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        String(quote.id),
        String(quote.service_request_id),
        quote.customer_name,
        quote.professional_name,
        quote.service_name,
        quote.note ?? "",
        quote.status,
      ].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [quotes, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--fixit-text)]">
          Quotes
        </h1>

        <p className="mt-1 text-sm text-[var(--fixit-muted)]">
          Monitor quotes exchanged across the FixIt marketplace.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          label="Total Quotes"
          value={String(metrics.total)}
          icon={<DollarSign size={18} />}
        />

        <MetricCard
          label="Pending"
          value={String(metrics.pending)}
          icon={<Clock3 size={18} />}
          accent="warning"
        />

        <MetricCard
          label="Accepted"
          value={String(metrics.accepted)}
          icon={<CheckCircle2 size={18} />}
          accent="success"
        />

        <MetricCard
          label="Quoted Value"
          value={formatAmount(metrics.totalValue)}
          icon={<DollarSign size={18} />}
          accent="info"
        />
      </div>

      <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)]">
        <div className="border-b border-[var(--fixit-border)] p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fixit-muted)]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search customer, professional, service..."
                className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white pl-10 pr-4 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={[
                    "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition",
                    statusFilter === status
                      ? "bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]"
                      : "text-[var(--fixit-muted)] hover:bg-slate-50 hover:text-[var(--fixit-text)]",
                  ].join(" ")}
                >
                  {status === "ALL"
                    ? "All"
                    : formatStatus(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <QuotesSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[var(--fixit-error)]">
              <AlertCircle size={22} />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[var(--fixit-text)]">
              Unable to load quotes
            </h2>

            <p className="mt-1 max-w-sm text-sm text-[var(--fixit-muted)]">
              Something went wrong while loading the admin quote
              queue.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--fixit-primary-hover)]"
            >
              Try again
            </button>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[var(--fixit-muted)]">
              <Search size={21} />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[var(--fixit-text)]">
              No quotes found
            </h2>

            <p className="mt-1 max-w-sm text-sm text-[var(--fixit-muted)]">
              Try adjusting your search or status filter.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[1150px] w-full">
                <thead>
                  <tr className="border-b border-[var(--fixit-border)] bg-slate-50/70">
                    <TableHeading>Quote</TableHeading>
                    <TableHeading>Customer</TableHeading>
                    <TableHeading>Professional</TableHeading>
                    <TableHeading>Service</TableHeading>
                    <TableHeading>Amount</TableHeading>
                    <TableHeading>Status</TableHeading>
                    <TableHeading>Expires</TableHeading>
                    <TableHeading>Created</TableHeading>
                  </tr>
                </thead>

                <tbody>
                  {filteredQuotes.map((quote) => (
                    <QuoteRow
                      key={quote.id}
                      quote={quote}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-[var(--fixit-border)] md:hidden">
              {filteredQuotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  accent = "primary",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: "primary" | "warning" | "success" | "info";
}) {
  const accentClasses = {
    primary:
      "bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]",
    warning:
      "bg-[rgb(245_158_11/0.10)] text-[var(--fixit-warning)]",
    success:
      "bg-[rgb(16_185_129/0.10)] text-[var(--fixit-success)]",
    info:
      "bg-[rgb(14_165_233/0.10)] text-[var(--fixit-info)]",
  };

  return (
    <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-[var(--fixit-muted)]">
          {label}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentClasses[accent]}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 truncate text-2xl font-semibold tracking-tight text-[var(--fixit-text)]">
        {value}
      </p>
    </div>
  );
}

function TableHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--fixit-muted)]">
      {children}
    </th>
  );
}

function QuoteRow({ quote }: { quote: AdminQuote }) {
  const StatusIcon = getStatusIcon(quote.status);

  return (
    <tr className="border-b border-[var(--fixit-border)] last:border-b-0 hover:bg-slate-50/60">
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-[var(--fixit-text)]">
          #{quote.id}
        </p>

        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          Request #{quote.service_request_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[var(--fixit-text)]">
          {quote.customer_name}
        </p>

        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          Customer #{quote.customer_profile_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[var(--fixit-text)]">
          {quote.professional_name}
        </p>

        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          Professional #{quote.professional_profile_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[var(--fixit-text)]">
          {quote.service_name}
        </p>

        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          Service #{quote.service_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-[var(--fixit-text)]">
          {formatAmount(Number(quote.amount))}
        </p>
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          status={quote.status}
          icon={StatusIcon}
        />
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-[var(--fixit-text)]">
          {formatDate(quote.expires_at)}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-[var(--fixit-text)]">
          {formatDate(quote.created_at)}
        </p>

        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          {formatDateTime(quote.created_at)}
        </p>
      </td>
    </tr>
  );
}

function QuoteCard({ quote }: { quote: AdminQuote }) {
  const StatusIcon = getStatusIcon(quote.status);

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--fixit-text)]">
            Quote #{quote.id}
          </p>

          <p className="mt-1 text-xs text-[var(--fixit-muted)]">
            Request #{quote.service_request_id}
          </p>
        </div>

        <StatusBadge
          status={quote.status}
          icon={StatusIcon}
        />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <p className="text-xs text-[var(--fixit-muted)]">
          Service
        </p>

        <p className="mt-1 text-sm font-semibold text-[var(--fixit-text)]">
          {quote.service_name}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <InfoBlock
          label="Customer"
          value={quote.customer_name}
        />

        <InfoBlock
          label="Professional"
          value={quote.professional_name}
        />

        <InfoBlock
          label="Amount"
          value={formatAmount(Number(quote.amount))}
        />

        <InfoBlock
          label="Expires"
          value={formatDate(quote.expires_at)}
        />
      </div>

      {quote.note && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fixit-muted)]">
            Note
          </p>

          <p className="mt-1 text-sm leading-6 text-[var(--fixit-text)]">
            {quote.note}
          </p>
        </div>
      )}
    </div>
  );
}

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fixit-muted)]">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-[var(--fixit-text)]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
  icon: Icon,
}: {
  status: string;
  icon: typeof Clock3;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium ${getStatusClasses(
        status,
      )}`}
    >
      <Icon size={13} />
      {formatStatus(status)}
    </span>
  );
}

function QuotesSkeleton() {
  return (
    <div className="divide-y divide-[var(--fixit-border)]">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-5 px-5 py-5"
        >
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}