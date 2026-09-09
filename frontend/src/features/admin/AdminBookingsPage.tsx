import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Search,
  XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  type AdminBooking,
  getAdminBookings,
} from "./adminApi";

type StatusFilter =
  | "ALL"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

const statusFilters: StatusFilter[] = [
  "ALL",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

function formatStatus(status: string) {
  return status
    .split("_")
    .map(
      (part) =>
        part.charAt(0) + part.slice(1).toLowerCase(),
    )
    .join(" ");
}

function getStatusClasses(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-[rgb(14_165_233/0.10)] text-[var(--fixit-info)]";

    case "IN_PROGRESS":
      return "bg-[rgb(245_158_11/0.10)] text-[var(--fixit-warning)]";

    case "COMPLETED":
      return "bg-[rgb(16_185_129/0.10)] text-[var(--fixit-success)]";

    case "CANCELLED":
      return "bg-[rgb(100_116_139/0.10)] text-[var(--fixit-muted)]";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "CONFIRMED":
      return CalendarClock;

    case "IN_PROGRESS":
      return Clock3;

    case "COMPLETED":
      return CheckCircle2;

    case "CANCELLED":
      return XCircle;

    default:
      return AlertCircle;
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

export default function AdminBookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<AdminBooking[]>({
    queryKey: ["admin-bookings"],
    queryFn: getAdminBookings,
  });

  const metrics = useMemo(
    () => ({
      total: bookings.length,
      confirmed: bookings.filter(
        (booking) => booking.status === "CONFIRMED",
      ).length,
      inProgress: bookings.filter(
        (booking) => booking.status === "IN_PROGRESS",
      ).length,
      completed: bookings.filter(
        (booking) => booking.status === "COMPLETED",
      ).length,
    }),
    [bookings],
  );

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        booking.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        String(booking.id),
        String(booking.service_request_id),
        String(booking.quote_id),
        booking.customer_name,
        booking.professional_name,
        booking.service_name,
        booking.status,
      ].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [bookings, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--fixit-text)]">
          Bookings
        </h1>

        <p className="mt-1 text-sm text-[var(--fixit-muted)]">
          Monitor confirmed and completed services across the
          FixIt marketplace.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          label="Total Bookings"
          value={metrics.total}
        />

        <MetricCard
          label="Confirmed"
          value={metrics.confirmed}
          accent="info"
        />

        <MetricCard
          label="In Progress"
          value={metrics.inProgress}
          accent="warning"
        />

        <MetricCard
          label="Completed"
          value={metrics.completed}
          accent="success"
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
          <BookingsSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[var(--fixit-error)]">
              <AlertCircle size={22} />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[var(--fixit-text)]">
              Unable to load bookings
            </h2>

            <p className="mt-1 max-w-sm text-sm text-[var(--fixit-muted)]">
              Something went wrong while loading the admin
              booking list.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--fixit-primary-hover)]"
            >
              Try again
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[var(--fixit-muted)]">
              <Search size={21} />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[var(--fixit-text)]">
              No bookings found
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
                    <TableHeading>Booking</TableHeading>
                    <TableHeading>Customer</TableHeading>
                    <TableHeading>Professional</TableHeading>
                    <TableHeading>Service</TableHeading>
                    <TableHeading>Amount</TableHeading>
                    <TableHeading>Status</TableHeading>
                    <TableHeading>Scheduled</TableHeading>
                    <TableHeading>Created</TableHeading>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-[var(--fixit-border)] md:hidden">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
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
  value: number;
  accent?: "primary" | "info" | "warning" | "success";
}) {
  const accentClasses = {
    primary:
      "bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]",
    info:
      "bg-[rgb(14_165_233/0.10)] text-[var(--fixit-info)]",
    warning:
      "bg-[rgb(245_158_11/0.10)] text-[var(--fixit-warning)]",
    success:
      "bg-[rgb(16_185_129/0.10)] text-[var(--fixit-success)]",
  };

  return (
    <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-4 sm:p-5">
      <p className="text-sm text-[var(--fixit-muted)]">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--fixit-text)]">
        {value}
      </p>

      <div
        className={`mt-3 h-1 w-10 rounded-full ${accentClasses[accent]}`}
      />
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

function BookingRow({
  booking,
}: {
  booking: AdminBooking;
}) {
  const StatusIcon = getStatusIcon(booking.status);

  return (
    <tr className="border-b border-[var(--fixit-border)] last:border-b-0 hover:bg-slate-50/60">
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-[var(--fixit-text)]">
          #{booking.id}
        </p>

        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          Request #{booking.service_request_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[var(--fixit-text)]">
          {booking.customer_name}
        </p>

        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          Customer #{booking.customer_profile_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[var(--fixit-text)]">
          {booking.professional_name}
        </p>

        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          Professional #{booking.professional_profile_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[var(--fixit-text)]">
          {booking.service_name}
        </p>

        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          Service #{booking.service_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-[var(--fixit-text)]">
          {formatAmount(Number(booking.amount))}
        </p>
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          status={booking.status}
          icon={StatusIcon}
        />
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-[var(--fixit-text)]">
          {formatDate(booking.scheduled_at)}
        </p>

        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          {formatDateTime(booking.scheduled_at)}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-[var(--fixit-text)]">
          {formatDate(booking.created_at)}
        </p>
      </td>
    </tr>
  );
}

function BookingCard({
  booking,
}: {
  booking: AdminBooking;
}) {
  const StatusIcon = getStatusIcon(booking.status);

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--fixit-text)]">
            Booking #{booking.id}
          </p>

          <p className="mt-1 text-xs text-[var(--fixit-muted)]">
            Request #{booking.service_request_id}
          </p>
        </div>

        <StatusBadge
          status={booking.status}
          icon={StatusIcon}
        />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <p className="text-xs text-[var(--fixit-muted)]">
          Service
        </p>

        <p className="mt-1 text-sm font-semibold text-[var(--fixit-text)]">
          {booking.service_name}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <InfoBlock
          label="Customer"
          value={booking.customer_name}
        />

        <InfoBlock
          label="Professional"
          value={booking.professional_name}
        />

        <InfoBlock
          label="Amount"
          value={formatAmount(Number(booking.amount))}
        />

        <InfoBlock
          label="Scheduled"
          value={formatDate(booking.scheduled_at)}
        />
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

function BookingsSkeleton() {
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
          <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}