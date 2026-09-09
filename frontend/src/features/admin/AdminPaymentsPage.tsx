import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Search,
  XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  type AdminPayment,
  getAdminPayments,
} from "./adminApi";

type StatusFilter = "ALL" | "SUCCESS" | "FAILED";

const statusFilters: StatusFilter[] = [
  "ALL",
  "SUCCESS",
  "FAILED",
];

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatPaymentMethod(method: string) {
  return method
    .replace(/^MOCK_/, "")
    .split("_")
    .map(
      (part) =>
        part.charAt(0) + part.slice(1).toLowerCase(),
    )
    .join(" ");
}

function getStatusClasses(status: string) {
  switch (status) {
    case "SUCCESS":
      return "bg-[rgb(16_185_129/0.10)] text-[var(--fixit-success)]";

    case "FAILED":
      return "bg-[rgb(239_68_68/0.10)] text-[var(--fixit-error)]";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "SUCCESS":
      return CheckCircle2;

    case "FAILED":
      return XCircle;

    default:
      return AlertCircle;
  }
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const {
    data: payments = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<AdminPayment[]>({
    queryKey: ["admin-payments"],
    queryFn: getAdminPayments,
  });

  const metrics = useMemo(() => {
    const successfulPayments = payments.filter(
      (payment) => payment.status === "SUCCESS",
    );

    const failedPayments = payments.filter(
      (payment) => payment.status === "FAILED",
    );

    const successfulValue = successfulPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    return {
      total: payments.length,
      successful: successfulPayments.length,
      failed: failedPayments.length,
      successfulValue,
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        payment.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        String(payment.id),
        String(payment.booking_id),
        payment.customer_name,
        payment.professional_name,
        payment.service_name,
        payment.payment_method,
        payment.transaction_reference,
        payment.status,
      ].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [payments, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--fixit-text)]">
          Payments
        </h1>

        <p className="mt-1 text-sm text-[var(--fixit-muted)]">
          Monitor payment activity and transaction status across
          the FixIt marketplace.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          label="Total Payments"
          value={metrics.total}
        />

        <MetricCard
          label="Successful"
          value={metrics.successful}
          accent="success"
        />

        <MetricCard
          label="Failed"
          value={metrics.failed}
          accent="danger"
        />

        <MetricCard
          label="Successful Value"
          value={formatAmount(metrics.successfulValue)}
          accent="primary"
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
                placeholder="Search customer, booking, transaction..."
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
          <PaymentsSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[var(--fixit-error)]">
              <AlertCircle size={22} />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[var(--fixit-text)]">
              Unable to load payments
            </h2>

            <p className="mt-1 max-w-sm text-sm text-[var(--fixit-muted)]">
              Something went wrong while loading payment activity.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--fixit-primary-hover)]"
            >
              Try again
            </button>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[var(--fixit-muted)]">
              <Search size={21} />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[var(--fixit-text)]">
              No payments found
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
                    <TableHeading>Payment</TableHeading>
                    <TableHeading>Customer</TableHeading>
                    <TableHeading>Professional</TableHeading>
                    <TableHeading>Service</TableHeading>
                    <TableHeading>Amount</TableHeading>
                    <TableHeading>Method</TableHeading>
                    <TableHeading>Status</TableHeading>
                    <TableHeading>Transaction</TableHeading>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((payment) => (
                    <PaymentRow
                      key={payment.id}
                      payment={payment}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-[var(--fixit-border)] md:hidden">
              {filteredPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
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
  accent = "primary",
}: {
  label: string;
  value: string | number;
  accent?: "primary" | "success" | "danger";
}) {
  const accentClasses = {
    primary:
      "bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]",
    success:
      "bg-[rgb(16_185_129/0.10)] text-[var(--fixit-success)]",
    danger:
      "bg-[rgb(239_68_68/0.10)] text-[var(--fixit-error)]",
  };

  return (
    <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-4 sm:p-5">
      <p className="text-sm text-[var(--fixit-muted)]">
        {label}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="truncate text-2xl font-semibold tracking-tight text-[var(--fixit-text)]">
          {value}
        </p>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accentClasses[accent]}`}
        >
          <CreditCard size={17} />
        </div>
      </div>
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

function PaymentRow({
  payment,
}: {
  payment: AdminPayment;
}) {
  const StatusIcon = getStatusIcon(payment.status);

  return (
    <tr className="border-b border-[var(--fixit-border)] last:border-b-0 hover:bg-slate-50/60">
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-[var(--fixit-text)]">
          #{payment.id}
        </p>

        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          Booking #{payment.booking_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[var(--fixit-text)]">
          {payment.customer_name}
        </p>

        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          Customer #{payment.customer_profile_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[var(--fixit-text)]">
          {payment.professional_name}
        </p>

        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          Professional #{payment.professional_profile_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[var(--fixit-text)]">
          {payment.service_name}
        </p>

        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          Service #{payment.service_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-[var(--fixit-text)]">
          {formatAmount(Number(payment.amount))}
        </p>
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
          {formatPaymentMethod(payment.payment_method)}
        </span>
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          status={payment.status}
          icon={StatusIcon}
        />
      </td>

      <td className="px-5 py-4">
        <p
          className="max-w-[190px] truncate font-mono text-xs text-[var(--fixit-muted)]"
          title={payment.transaction_reference}
        >
          {payment.transaction_reference}
        </p>
      </td>
    </tr>
  );
}

function PaymentCard({
  payment,
}: {
  payment: AdminPayment;
}) {
  const StatusIcon = getStatusIcon(payment.status);

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--fixit-text)]">
            Payment #{payment.id}
          </p>

          <p className="mt-1 text-xs text-[var(--fixit-muted)]">
            Booking #{payment.booking_id}
          </p>
        </div>

        <StatusBadge
          status={payment.status}
          icon={StatusIcon}
        />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <p className="text-xs text-[var(--fixit-muted)]">
          Service
        </p>

        <p className="mt-1 text-sm font-semibold text-[var(--fixit-text)]">
          {payment.service_name}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <InfoBlock
          label="Customer"
          value={payment.customer_name}
        />

        <InfoBlock
          label="Professional"
          value={payment.professional_name}
        />

        <InfoBlock
          label="Amount"
          value={formatAmount(Number(payment.amount))}
        />

        <InfoBlock
          label="Method"
          value={formatPaymentMethod(payment.payment_method)}
        />
      </div>

      <div className="mt-4 rounded-xl border border-[var(--fixit-border)] bg-white p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fixit-muted)]">
          Transaction
        </p>

        <p className="mt-1 break-all font-mono text-xs text-[var(--fixit-text)]">
          {payment.transaction_reference}
        </p>
      </div>
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
  icon: typeof CheckCircle2;
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

function PaymentsSkeleton() {
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
          <div className="h-7 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}