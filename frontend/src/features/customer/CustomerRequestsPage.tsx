import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Clock3,
  FileText,
  LoaderCircle,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  cancelCustomerRequest,
  getCustomerRequests,
} from "./requestApi";

import { getServices } from "./servicesApi";

import type {
  CustomerServiceRequest,
} from "../../types/customer";

import type {
  Service,
} from "../../types/service";

/* ==========================================================================
   STATUS FILTERS
   ========================================================================== */

const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
] as const;

type StatusFilter =
  (typeof STATUS_FILTERS)[number];

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function CustomerRequestsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [cancellingRequestId, setCancellingRequestId] =
    useState<number | null>(null);

  /* ------------------------------------------------------------------------
     REQUESTS
     ------------------------------------------------------------------------ */

  const requestsQuery =
    useQuery<CustomerServiceRequest[]>({
      queryKey: [
        "customer",
        "requests",
      ],
      queryFn:
        getCustomerRequests,
    });

  /* ------------------------------------------------------------------------
     SERVICES
     ------------------------------------------------------------------------ */

  const servicesQuery =
    useQuery<Service[]>({
      queryKey: [
        "service-catalog",
      ],
      queryFn: () =>
        getServices(),
    });

  const requests =
    requestsQuery.data ?? [];

  const services =
    servicesQuery.data ?? [];

  /* ------------------------------------------------------------------------
     SERVICE LOOKUP
     ------------------------------------------------------------------------ */

  const serviceMap =
    useMemo(() => {
      return new Map<number, Service>(
        services.map(
          (service) => [
            service.id,
            service,
          ],
        ),
      );
    }, [services]);

  /* ------------------------------------------------------------------------
     FILTERING
     ------------------------------------------------------------------------ */

  const filteredRequests =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return [...requests]
        .sort(
          (first, second) =>
            new Date(
              second.created_at,
            ).getTime() -
            new Date(
              first.created_at,
            ).getTime(),
        )
        .filter((request) => {
          if (
            statusFilter !== "ALL" &&
            request.status !==
              statusFilter
          ) {
            return false;
          }

          if (
            normalizedSearch.length === 0
          ) {
            return true;
          }

          const serviceName =
            serviceMap.get(
              request.service_id,
            )?.name ?? "";

          const searchableText = [
            serviceName,
            request.description ?? "",
            request.status,
            `request ${request.id}`,
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            normalizedSearch,
          );
        });
    }, [
      requests,
      search,
      statusFilter,
      serviceMap,
    ]);

  /* ------------------------------------------------------------------------
     CANCEL REQUEST
     ------------------------------------------------------------------------ */

  const cancelMutation =
    useMutation<
      CustomerServiceRequest,
      Error,
      number
    >({
      mutationFn:
        cancelCustomerRequest,

      onMutate: (
        requestId,
      ) => {
        setCancellingRequestId(
          requestId,
        );
      },

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "customer",
            "requests",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "customer",
            "request",
          ],
        });
      },

      onSettled: () => {
        setCancellingRequestId(
          null,
        );
      },
    });

  /* ------------------------------------------------------------------------
     LOADING
     ------------------------------------------------------------------------ */

  if (
    requestsQuery.isLoading ||
    servicesQuery.isLoading
  ) {
    return (
      <RequestsLoadingState />
    );
  }

  /* ------------------------------------------------------------------------
     ERROR
     ------------------------------------------------------------------------ */

  if (
    requestsQuery.isError ||
    servicesQuery.isError
  ) {
    return (
      <RequestsErrorState />
    );
  }

  return (
    <div className="space-y-7">

      {/* ====================================================================
          HERO
          ==================================================================== */}

      <section className="relative overflow-hidden rounded-[28px] bg-[var(--fixit-primary-active)] px-6 py-8 text-white shadow-[var(--fixit-shadow-lg)] sm:px-8 sm:py-10 lg:px-10">
        {/* Decorative accent */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--fixit-secondary)]/25 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[var(--fixit-primary-hover)]/20 blur-3xl" />

        <div className="relative z-10 max-w-3xl">

          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/85">
            <ClipboardList size={13} />
            Service requests
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
            Keep track of everything.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
            View your requests, monitor their
            status, and open any request for its
            full details.
          </p>

          {/* Search */}
          <div className="mt-7 flex max-w-2xl items-center rounded-[var(--fixit-radius-lg)] border border-white/15 bg-white/10 p-1.5 backdrop-blur-sm">
            <Search
              size={18}
              className="ml-3 shrink-0 text-white/60"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search requests..."
              className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/45"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="mr-1 rounded-xl px-3 py-2 text-xs font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================================
          STATUS FILTERS
          ==================================================================== */}

      <section>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map(
            (status) => {
              const isActive =
                statusFilter ===
                status;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      status,
                    )
                  }
                  className={[
                    "shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition",
                    isActive
                      ? "border-[var(--fixit-primary)] bg-[var(--fixit-primary)] text-white shadow-[var(--fixit-shadow-sm)]"
                      : "border-[var(--fixit-border)] bg-[var(--fixit-surface)] text-[var(--fixit-text-muted)] hover:border-[var(--fixit-primary)]/30 hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)]",
                  ].join(" ")}
                >
                  {status === "ALL"
                    ? "All requests"
                    : formatStatus(
                        status,
                      )}
                </button>
              );
            },
          )}
        </div>
      </section>

      {/* ====================================================================
          RESULTS
          ==================================================================== */}

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--fixit-secondary)]">
              Your activity
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-[var(--fixit-text)]">
              {filteredRequests.length}{" "}
              {filteredRequests.length === 1
                ? "request"
                : "requests"}
            </h2>
          </div>

          <Link
            to="/customer/services"
            className="inline-flex w-fit items-center gap-2 rounded-[var(--fixit-radius-md)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] px-4 py-2.5 text-xs font-semibold text-[var(--fixit-text)] transition hover:border-[var(--fixit-primary)]/30 hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)]"
          >
            <span>
              Create new request
            </span>

            <ArrowRight
              size={15}
              className="shrink-0"
            />
          </Link>
        </div>

        {filteredRequests.length ===
        0 ? (
          <RequestsEmptyState
            search={search}
            statusFilter={
              statusFilter
            }
            onClear={() => {
              setSearch("");
              setStatusFilter(
                "ALL",
              );
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(
              (request) => {
                const service =
                  serviceMap.get(
                    request.service_id,
                  );

                return (
                  <RequestCard
                    key={request.id}
                    request={request}
                    serviceName={
                      service?.name ??
                      `Service #${request.service_id}`
                    }
                    isCancelling={
                      cancellingRequestId ===
                      request.id
                    }
                    onCancel={() => {
                      if (
                        !window.confirm(
                          "Are you sure you want to cancel this service request?",
                        )
                      ) {
                        return;
                      }

                      cancelMutation.mutate(
                        request.id,
                      );
                    }}
                  />
                );
              },
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/* ==========================================================================
   REQUEST CARD
   ========================================================================== */

function RequestCard({
  request,
  serviceName,
  isCancelling,
  onCancel,
}: {
  request: CustomerServiceRequest;
  serviceName: string;
  isCancelling: boolean;
  onCancel: () => void;
}) {
  const canCancel =
    request.status === "PENDING" ||
    request.status === "ACCEPTED";

  return (
    <article className="rounded-[24px] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-5 shadow-[var(--fixit-shadow-sm)] transition hover:border-[var(--fixit-primary)]/20 hover:shadow-[var(--fixit-shadow-md)] sm:p-6">

      <div className="flex flex-col gap-5">

        {/* Header */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div className="flex min-w-0 gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
              <ClipboardList
                size={20}
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">

                <h3 className="break-words text-base font-bold text-[var(--fixit-text)]">
                  {serviceName}
                </h3>

                <RequestStatusBadge
                  status={
                    request.status
                  }
                />
              </div>

              <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                Request #{request.id}
              </p>
            </div>
          </div>

          <Link
            to={`/customer/requests/${request.id}`}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-[var(--fixit-radius-md)] bg-[var(--fixit-primary)] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--fixit-primary-hover)] sm:w-auto"
          >
            <span>
              View details
            </span>

            <ArrowRight
              size={15}
              className="shrink-0"
            />
          </Link>
        </div>

        {/* Information */}

        <div className="grid gap-3 sm:grid-cols-2">

          <RequestInfo
            icon={
              <CalendarDays
                size={16}
              />
            }
            label="Preferred date"
            value={
              request.preferred_date
                ? formatDate(
                    request.preferred_date,
                  )
                : "Not specified"
            }
          />

          <RequestInfo
            icon={
              <Clock3 size={16} />
            }
            label="Created"
            value={formatDateTime(
              request.created_at,
            )}
          />
        </div>

        {/* Description */}

        {request.description && (
          <div className="rounded-[var(--fixit-radius-lg)] border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-4">

            <div className="flex items-start gap-3">

              <FileText
                size={16}
                className="mt-0.5 shrink-0 text-[var(--fixit-text-muted)]"
              />

              <div className="min-w-0">

                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fixit-secondary)]">
                  Problem description
                </p>

                <p className="mt-1 line-clamp-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--fixit-text-muted)]">
                  {request.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cancel */}

        {canCancel && (
          <div className="flex flex-col gap-3 border-t border-[var(--fixit-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-2 text-xs text-[var(--fixit-text-muted)]">
              <ShieldCheck
                size={15}
                className="mt-0.5 shrink-0 text-[var(--fixit-primary)]"
              />

              <span>
                You can cancel this
                request while it is
                active.
              </span>
            </div>

            <button
              type="button"
              disabled={
                isCancelling
              }
              onClick={
                onCancel
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--fixit-radius-md)] border border-[var(--fixit-error)]/25 bg-[var(--fixit-surface)] px-4 py-2.5 text-xs font-bold text-[var(--fixit-error)] transition hover:bg-[var(--fixit-error-soft)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isCancelling ? (
                <>
                  <LoaderCircle
                    size={15}
                    className="animate-spin"
                  />

                  <span>
                    Cancelling...
                  </span>
                </>
              ) : (
                <>
                  <XCircle
                    size={15}
                  />

                  <span>
                    Cancel request
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

/* ==========================================================================
   REQUEST INFORMATION
   ========================================================================== */

function RequestInfo({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--fixit-radius-lg)] border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-4 py-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--fixit-surface)] text-[var(--fixit-primary)] shadow-[var(--fixit-shadow-sm)]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-[var(--fixit-text)]">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ==========================================================================
   STATUS BADGE
   ========================================================================== */

function RequestStatusBadge({
  status,
}: {
  status: string;
}) {
  const config =
    getStatusConfig(status);

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold",
        config.container,
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 shrink-0 rounded-full",
          config.dot,
        ].join(" ")}
      />

      <span
        className={
          config.text
        }
      >
        {formatStatus(
          status,
        )}
      </span>
    </span>
  );
}

/* ==========================================================================
   LOADING
   ========================================================================== */

function RequestsLoadingState() {
  return (
    <div className="space-y-7">

      <section className="rounded-[28px] bg-[var(--fixit-primary)] px-6 py-10 sm:px-8">
        <div className="animate-pulse">

          <div className="h-6 w-40 rounded-full bg-white/10" />

          <div className="mt-4 h-10 w-3/4 max-w-2xl rounded bg-white/10" />

          <div className="mt-3 h-5 w-1/2 max-w-xl rounded bg-white/10" />

          <div className="mt-7 h-14 w-full max-w-2xl rounded-[var(--fixit-radius-lg)] bg-white/10" />
        </div>
      </section>

      <div className="space-y-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="rounded-[24px] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-6"
          >
            <div className="animate-pulse">

              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[var(--fixit-primary-soft)]" />

                <div className="flex-1">
                  <div className="h-5 w-1/3 rounded bg-[var(--fixit-background)]" />

                  <div className="mt-3 h-4 w-1/5 rounded bg-[var(--fixit-background)]" />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="h-16 rounded-[var(--fixit-radius-lg)] bg-[var(--fixit-background)]" />
                <div className="h-16 rounded-[var(--fixit-radius-lg)] bg-[var(--fixit-background)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   EMPTY
   ========================================================================== */

function RequestsEmptyState({
  search,
  statusFilter,
  onClear,
}: {
  search: string;
  statusFilter: StatusFilter;
  onClear: () => void;
}) {
  const hasFilters =
    search.length > 0 ||
    statusFilter !== "ALL";

  return (
    <div className="rounded-[24px] border border-dashed border-[var(--fixit-border)] bg-[var(--fixit-surface)] px-6 py-16 text-center shadow-[var(--fixit-shadow-sm)]">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
        <ClipboardList
          size={20}
        />
      </div>

      <h3 className="mt-5 text-base font-bold text-[var(--fixit-text)]">
        {hasFilters
          ? "No matching requests"
          : "No service requests yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
        {hasFilters
          ? "Try changing your search or status filter."
          : "Once you request a service, your requests will appear here."}
      </p>

      {hasFilters ? (
        <button
          type="button"
          onClick={
            onClear
          }
          className="mt-5 rounded-[var(--fixit-radius-md)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--fixit-text)] transition hover:border-[var(--fixit-primary)]/30 hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)]"
        >
          Clear filters
        </button>
      ) : (
        <Link
          to="/customer/services"
          className="mt-5 inline-flex items-center gap-2 rounded-[var(--fixit-radius-md)] bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--fixit-primary-hover)]"
        >
          <span>
            Find a service
          </span>

          <ArrowRight
            size={15}
          />
        </Link>
      )}
    </div>
  );
}

/* ==========================================================================
   ERROR
   ========================================================================== */

function RequestsErrorState() {
  return (
    <div className="rounded-[24px] border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-6 py-16 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--fixit-surface)] text-[var(--fixit-error)] shadow-[var(--fixit-shadow-sm)]">
        <ClipboardList
          size={20}
        />
      </div>

      <h2 className="mt-5 text-lg font-bold text-[var(--fixit-text)]">
        We couldn't load your requests
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
        Make sure the FixIt backend is running
        and refresh the page.
      </p>
    </div>
  );
}

/* ==========================================================================
   STATUS CONFIGURATION
   ========================================================================== */

function getStatusConfig(
  status: string,
) {
  switch (status) {
    case "ACCEPTED":
      return {
        container:
          "border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)]",
        dot:
          "bg-[var(--fixit-success)]",
        text:
          "text-[var(--fixit-success)]",
      };

    case "REJECTED":
      return {
        container:
          "border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)]",
        dot:
          "bg-[var(--fixit-error)]",
        text:
          "text-[var(--fixit-error)]",
      };

    case "CANCELLED":
      return {
        container:
          "border-[var(--fixit-border)] bg-[var(--fixit-background)]",
        dot:
          "bg-[var(--fixit-disabled)]",
        text:
          "text-[var(--fixit-text-muted)]",
      };

    case "COMPLETED":
      return {
        container:
          "border-[var(--fixit-primary)]/20 bg-[var(--fixit-primary-soft)]",
        dot:
          "bg-[var(--fixit-primary)]",
        text:
          "text-[var(--fixit-primary)]",
      };

    default:
      return {
        container:
          "border-[var(--fixit-warning)]/20 bg-[var(--fixit-warning-soft)]",
        dot:
          "bg-[var(--fixit-warning)]",
        text:
          "text-[var(--fixit-warning)]",
      };
  }
}

/* ==========================================================================
   FORMAT STATUS
   ========================================================================== */

function formatStatus(
  status: string,
): string {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

/* ==========================================================================
   DATE FORMATTING
   ========================================================================== */

function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

function formatDateTime(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(new Date(value));
}