import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  type AdminRequest,
  getAdminRequests,
} from "../../features/admin/adminApi";

type StatusFilter =
  | "ALL"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

const statusFilters: StatusFilter[] = [
  "ALL",
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
];

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function getStatusClasses(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-[rgb(245_158_11/0.10)] text-[var(--fixit-warning)]";
    case "ACCEPTED":
      return "bg-[rgb(14_165_233/0.10)] text-[var(--fixit-info)]";
    case "COMPLETED":
      return "bg-[rgb(16_185_129/0.10)] text-[var(--fixit-success)]";
    case "REJECTED":
      return "bg-[rgb(239_68_68/0.10)] text-[var(--fixit-error)]";
    case "CANCELLED":
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
    case "COMPLETED":
      return CheckCircle2;
    case "REJECTED":
      return XCircle;
    case "CANCELLED":
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

export default function AdminRequestsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const {
    data: requests = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<AdminRequest[]>({
    queryKey: ["admin-requests"],
    queryFn: getAdminRequests,
  });

  const counts = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((item) => item.status === "PENDING")
        .length,
      accepted: requests.filter(
        (item) => item.status === "ACCEPTED",
      ).length,
      completed: requests.filter(
        (item) => item.status === "COMPLETED",
      ).length,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        request.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        String(request.id),
        request.customer_name,
        request.professional_name,
        request.service_name,
        request.description ?? "",
        request.status,
      ].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [requests, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--fixit-text)]">
          Requests
        </h1>
        <p className="mt-1 text-sm text-[var(--fixit-muted)]">
          Monitor service requests across the FixIt marketplace.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          label="Total Requests"
          value={counts.total}
        />
        <MetricCard
          label="Pending"
          value={counts.pending}
          accent="warning"
        />
        <MetricCard
          label="Accepted"
          value={counts.accepted}
          accent="info"
        />
        <MetricCard
          label="Completed"
          value={counts.completed}
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
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer, professional, service..."
                className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white pl-10 pr-4 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0">
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
          <RequestsSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[var(--fixit-error)]">
              <AlertCircle size={22} />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[var(--fixit-text)]">
              Unable to load requests
            </h2>

            <p className="mt-1 max-w-sm text-sm text-[var(--fixit-muted)]">
              Something went wrong while loading the admin request
              queue.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--fixit-primary-hover)]"
            >
              <Loader2 size={16} />
              Try again
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[var(--fixit-muted)]">
              <Search size={21} />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[var(--fixit-text)]">
              No requests found
            </h2>

            <p className="mt-1 max-w-sm text-sm text-[var(--fixit-muted)]">
              Try adjusting your search or status filter.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[1050px] w-full">
                <thead>
                  <tr className="border-b border-[var(--fixit-border)] bg-slate-50/70">
                    <TableHeading>Request</TableHeading>
                    <TableHeading>Customer</TableHeading>
                    <TableHeading>Professional</TableHeading>
                    <TableHeading>Service</TableHeading>
                    <TableHeading>Status</TableHeading>
                    <TableHeading>Preferred Date</TableHeading>
                    <TableHeading>Created</TableHeading>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request) => (
                    <RequestRow
                      key={request.id}
                      request={request}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-[var(--fixit-border)] md:hidden">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
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
  accent?: "primary" | "warning" | "info" | "success";
}) {
  const accentClasses = {
    primary:
      "bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]",
    warning:
      "bg-[rgb(245_158_11/0.10)] text-[var(--fixit-warning)]",
    info:
      "bg-[rgb(14_165_233/0.10)] text-[var(--fixit-info)]",
    success:
      "bg-[rgb(16_185_129/0.10)] text-[var(--fixit-success)]",
  };

  return (
    <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-4 sm:p-5">
      <p className="text-sm text-[var(--fixit-muted)]">{label}</p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold tracking-tight text-[var(--fixit-text)]">
          {value}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentClasses[accent]}`}
        >
          <span className="text-sm font-semibold">#</span>
        </div>
      </div>
    </div>
  );
}

function TableHeading({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--fixit-muted)]">
      {children}
    </th>
  );
}

function RequestRow({
  request,
}: {
  request: AdminRequest;
}) {
  const StatusIcon = getStatusIcon(request.status);

  return (
    <tr className="border-b border-[var(--fixit-border)] last:border-b-0 hover:bg-slate-50/60">
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-[var(--fixit-text)]">
          #{request.id}
        </p>
        <p className="mt-1 max-w-[180px] truncate text-xs text-[var(--fixit-muted)]">
          {request.description || "No description"}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[var(--fixit-text)]">
          {request.customer_name}
        </p>
        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          Customer #{request.customer_profile_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[var(--fixit-text)]">
          {request.professional_name}
        </p>
        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          Professional #{request.professional_profile_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[var(--fixit-text)]">
          {request.service_name}
        </p>
        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          Service #{request.service_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={request.status} icon={StatusIcon} />
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-[var(--fixit-text)]">
          {formatDate(request.preferred_date)}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-[var(--fixit-text)]">
          {formatDate(request.created_at)}
        </p>
        <p className="mt-1 text-xs text-[var(--fixit-muted)]">
          {formatDateTime(request.created_at)}
        </p>
      </td>
    </tr>
  );
}

function RequestCard({
  request,
}: {
  request: AdminRequest;
}) {
  const StatusIcon = getStatusIcon(request.status);

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--fixit-text)]">
            Request #{request.id}
          </p>
          <p className="mt-1 text-xs text-[var(--fixit-muted)]">
            {request.service_name}
          </p>
        </div>

        <StatusBadge
          status={request.status}
          icon={StatusIcon}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoBlock
          label="Customer"
          value={request.customer_name}
        />

        <InfoBlock
          label="Professional"
          value={request.professional_name}
        />

        <InfoBlock
          label="Preferred date"
          value={formatDate(request.preferred_date)}
        />

        <InfoBlock
          label="Created"
          value={formatDate(request.created_at)}
        />
      </div>

      {request.description && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fixit-muted)]">
            Description
          </p>

          <p className="mt-1 text-sm leading-6 text-[var(--fixit-text)]">
            {request.description}
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

function RequestsSkeleton() {
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
          <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}