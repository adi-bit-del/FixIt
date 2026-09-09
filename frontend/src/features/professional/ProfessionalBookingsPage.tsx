import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Play,
  XCircle,
} from "lucide-react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  completeProfessionalBooking,
  getProfessionalBookings,
  startProfessionalBooking,
} from "./professionalBookingsApi";

/*
|--------------------------------------------------------------------------
| View Model
|--------------------------------------------------------------------------
*/

type BookingViewModel = {
  id: number;
  status: string;
  serviceId: number;
  customerProfileId: number;
  scheduledAt: string;
  amount: number;
};

/*
|--------------------------------------------------------------------------
| Safe Normalization
|--------------------------------------------------------------------------
*/

function asNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed)
      ? parsed
      : 0;
  }

  return 0;
}

function asString(
  value: unknown,
  fallback = "",
): string {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return fallback;
}

function normalizeBooking(
  booking: {
    id: unknown;
    status: unknown;
    service_id: unknown;
    customer_profile_id: unknown;
    scheduled_at: unknown;
    amount: unknown;
  },
): BookingViewModel {
  return {
    id: asNumber(booking.id),
    status: asString(
      booking.status,
      "UNKNOWN",
    ),
    serviceId: asNumber(
      booking.service_id,
    ),
    customerProfileId:
      asNumber(
        booking.customer_profile_id,
      ),
    scheduledAt: asString(
      booking.scheduled_at,
      "",
    ),
    amount: asNumber(
      booking.amount,
    ),
  };
}

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

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

function formatDate(
  value: string,
): string {
  if (!value) {
    return "No scheduled time";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}

function formatAmount(
  value: number,
): string {
  return value.toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}

function isActiveBooking(
  status: string,
): boolean {
  return ![
    "COMPLETED",
    "CANCELLED",
  ].includes(
    status.toUpperCase(),
  );
}

function canStartJob(
  status: string,
): boolean {
  return [
    "CONFIRMED",
    "ACCEPTED",
    "SCHEDULED",
  ].includes(
    status.toUpperCase(),
  );
}

function canCompleteJob(
  status: string,
): boolean {
  return [
    "IN_PROGRESS",
    "STARTED",
  ].includes(
    status.toUpperCase(),
  );
}

function getStatusConfig(
  status: string,
): {
  container: string;
  dot: string;
  text: string;
} {
  const value =
    status.toUpperCase();

  if (value === "COMPLETED") {
    return {
      container:
        "border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)]",
      dot:
        "bg-[var(--fixit-success)]",
      text:
        "text-[var(--fixit-success)]",
    };
  }

  if (
    [
      "CANCELLED",
      "REJECTED",
    ].includes(value)
  ) {
    return {
      container:
        "border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)]",
      dot:
        "bg-[var(--fixit-error)]",
      text:
        "text-[var(--fixit-error)]",
    };
  }

  if (
    [
      "IN_PROGRESS",
      "STARTED",
    ].includes(value)
  ) {
    return {
      container:
        "border-[var(--fixit-info)]/20 bg-[var(--fixit-info)]/10",
      dot:
        "bg-[var(--fixit-info)]",
      text:
        "text-[var(--fixit-info)]",
    };
  }

  return {
    container:
      "border-[var(--fixit-warning)]/20 bg-[var(--fixit-warning-soft)]",
    dot:
      "bg-[var(--fixit-warning)]",
    text:
      "text-[var(--fixit-warning)]",
  };
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: unknown;
          };
        };
      }
    ).response;

    const detail =
      response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (
      typeof detail === "number" ||
      typeof detail === "boolean"
    ) {
      return String(detail);
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

/*
|--------------------------------------------------------------------------
| Professional Bookings Page
|--------------------------------------------------------------------------
*/

export default function ProfessionalBookingsPage() {
  const queryClient =
    useQueryClient();

  /*
  |--------------------------------------------------------------------------
  | Bookings Query
  |--------------------------------------------------------------------------
  */

  const bookingsQuery =
    useQuery({
      queryKey: [
        "professional-bookings",
      ],
      queryFn:
        getProfessionalBookings,
    });

  /*
  |--------------------------------------------------------------------------
  | Start Booking
  |--------------------------------------------------------------------------
  */

  const startMutation =
    useMutation({
      mutationFn:
        startProfessionalBooking,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "professional-bookings",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "professional-dashboard",
          ],
        });
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Complete Booking
  |--------------------------------------------------------------------------
  */

  const completeMutation =
    useMutation({
      mutationFn:
        completeProfessionalBooking,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "professional-bookings",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "professional-dashboard",
          ],
        });
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Normalize API Response
  |--------------------------------------------------------------------------
  */

  const bookings: BookingViewModel[] =
    (
      bookingsQuery.data ?? []
    ).map(
      (booking) =>
        normalizeBooking(
          booking,
        ),
    );

  const upcoming =
    bookings.filter(
      (booking) =>
        isActiveBooking(
          booking.status,
        ),
    );

  const completed =
    bookings.filter(
      (booking) =>
        booking.status.toUpperCase() ===
        "COMPLETED",
    );

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (
    bookingsQuery.isLoading
  ) {
    return (
      <BookingsLoadingState />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (
    bookingsQuery.isError
  ) {
    return (
      <BookingsErrorState
        message={getErrorMessage(
          bookingsQuery.error,
        )}
        onRetry={() =>
          bookingsQuery.refetch()
        }
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-7">
      {/* ================================================================
          HERO
          ================================================================ */}

      <section className="relative overflow-hidden rounded-[30px] bg-[var(--fixit-primary-active)] px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10 lg:px-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--fixit-secondary)] opacity-20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-[var(--fixit-primary-hover)] opacity-20 blur-3xl" />

        <div className="relative max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">
            <CalendarDays
              size={13}
            />

            Your schedule
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
            Stay on top of
            <span className="block text-[var(--fixit-secondary)]">
              every job.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
            Manage your confirmed work, start
            jobs when you arrive, and mark
            completed services as finished.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Total bookings
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {bookings.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-[var(--fixit-secondary)]/15 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Upcoming & active
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {upcoming.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Completed
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {completed.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          UPCOMING
          ================================================================ */}

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
              Active schedule
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
              Upcoming & active
            </h2>

            <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
              {upcoming.length}{" "}
              {upcoming.length === 1
                ? "booking"
                : "bookings"}
            </p>
          </div>

          {upcoming.length > 0 && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--fixit-info)]/20 bg-[var(--fixit-info)]/10 px-3 py-2 text-xs font-semibold text-[var(--fixit-info)]">
              <Clock3 size={13} />
              Keep your schedule up to date
            </div>
          )}
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-[var(--fixit-border)] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
              <CalendarDays
                size={24}
              />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">
              No upcoming bookings
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
              Confirmed service jobs will
              appear here when they are ready
              for you to manage.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map(
              (booking) => {
                const status =
                  booking.status.toUpperCase();

                const starting =
                  startMutation.isPending &&
                  startMutation.variables ===
                    booking.id;

                const completing =
                  completeMutation.isPending &&
                  completeMutation.variables ===
                    booking.id;

                const actionError =
                  startMutation.isError
                    ? startMutation.error
                    : completeMutation.isError
                      ? completeMutation.error
                      : null;

                const statusConfig =
                  getStatusConfig(
                    booking.status,
                  );

                return (
                  <article
                    key={booking.id}
                    className="rounded-[26px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--fixit-primary)]/25 hover:shadow-lg sm:p-6"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      {/* Main */}

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                            <CalendarDays
                              size={20}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                                Booking
                              </span>

                              <span className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                                #{String(
                                  booking.id,
                                )}
                              </span>

                              <span
                                className={[
                                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold",
                                  statusConfig.container,
                                  statusConfig.text,
                                ].join(" ")}
                              >
                                <span
                                  className={[
                                    "h-1.5 w-1.5 rounded-full",
                                    statusConfig.dot,
                                  ].join(" ")}
                                />

                                {formatStatus(
                                  booking.status,
                                )}
                              </span>
                            </div>

                            <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--fixit-text-dark)]">
                              Scheduled service
                            </h3>

                            <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                              Customer profile #
                              {String(
                                booking.customerProfileId,
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Details */}

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                              Service
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[var(--fixit-text-dark)]">
                              {`Service #${String(
                                booking.serviceId,
                              )}`}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                              Customer
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[var(--fixit-text-dark)]">
                              {`Profile #${String(
                                booking.customerProfileId,
                              )}`}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                              Scheduled
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-[var(--fixit-text-dark)]">
                              {formatDate(
                                booking.scheduledAt,
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                              Amount
                            </p>

                            <p className="mt-1 text-sm font-bold text-[var(--fixit-text-dark)]">
                              {`₹${formatAmount(
                                booking.amount,
                              )}`}
                            </p>
                          </div>
                        </div>

                        {/* Mutation Error */}

                        {actionError && (
                          <div className="mt-4 rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-4 py-3">
                            <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                              We couldn't update this
                              booking.
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                              {getErrorMessage(
                                actionError,
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}

                      <div className="w-full shrink-0 lg:w-44">
                        <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-3">
                          <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                            Job actions
                          </p>

                          <div className="mt-3 space-y-2">
                            {canStartJob(
                              status,
                            ) && (
                              <button
                                type="button"
                                disabled={
                                  startMutation.isPending ||
                                  completeMutation.isPending
                                }
                                onClick={() =>
                                  startMutation.mutate(
                                    booking.id,
                                  )
                                }
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Play
                                  size={15}
                                />

                                {starting
                                  ? "Starting..."
                                  : "Start job"}
                              </button>
                            )}

                            {canCompleteJob(
                              status,
                            ) && (
                              <button
                                type="button"
                                disabled={
                                  startMutation.isPending ||
                                  completeMutation.isPending
                                }
                                onClick={() =>
                                  completeMutation.mutate(
                                    booking.id,
                                  )
                                }
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fixit-success)] px-4 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <CheckCircle2
                                  size={15}
                                />

                                {completing
                                  ? "Completing..."
                                  : "Complete job"}
                              </button>
                            )}

                            {!canStartJob(
                              status,
                            ) &&
                              !canCompleteJob(
                                status,
                              ) && (
                                <div className="rounded-xl border border-[var(--fixit-border)] bg-white px-3 py-3 text-center">
                                  <p className="text-xs font-medium text-[var(--fixit-text-muted)]">
                                    No action required
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      {/* ================================================================
          COMPLETED
          ================================================================ */}

      <section>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
            Completed work
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
            Completed
          </h2>

          <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
            {completed.length}{" "}
            {completed.length === 1
              ? "completed booking"
              : "completed bookings"}
          </p>
        </div>

        {completed.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-[var(--fixit-border)] bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-success-soft)] text-[var(--fixit-success)]">
              <CheckCircle2
                size={24}
              />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">
              No completed jobs yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
              Completed services will be kept
              here as part of your professional
              job history.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {completed.map(
              (booking) => (
                <article
                  key={booking.id}
                  className="rounded-2xl border border-[var(--fixit-border)] bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[var(--fixit-text-dark)]">
                          Booking #
                          {String(
                            booking.id,
                          )}
                        </p>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--fixit-success)]">
                          <CheckCircle2
                            size={12}
                          />

                          Completed
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-[var(--fixit-text-muted)]">
                        {`Service #${String(
                          booking.serviceId,
                        )}`}{" "}
                        ·{" "}
                        {formatDate(
                          booking.scheduledAt,
                        )}
                      </p>
                    </div>

                    <div className="shrink-0 sm:text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                        Amount
                      </p>

                      <p className="mt-1 text-lg font-bold text-[var(--fixit-text-dark)]">
                        {`₹${formatAmount(
                          booking.amount,
                        )}`}
                      </p>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Loading State
|--------------------------------------------------------------------------
*/

function BookingsLoadingState() {
  return (
    <div className="space-y-7">
      <section className="rounded-[30px] bg-[var(--fixit-primary-active)] px-6 py-10 sm:px-8 lg:px-10">
        <div className="animate-pulse">
          <div className="h-7 w-40 rounded-full bg-white/10" />

          <div className="mt-5 h-11 w-3/4 max-w-2xl rounded-xl bg-white/10" />

          <div className="mt-3 h-5 w-1/2 max-w-xl rounded bg-white/10" />

          <div className="mt-7 h-14 w-64 rounded-2xl bg-white/10" />
        </div>
      </section>

      <div className="space-y-4">
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="rounded-[26px] border border-[var(--fixit-border)] bg-white p-6"
            >
              <div className="animate-pulse">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[var(--fixit-background)]" />

                  <div className="flex-1">
                    <div className="h-3 w-24 rounded bg-[var(--fixit-background)]" />

                    <div className="mt-3 h-6 w-48 rounded bg-[var(--fixit-background)]" />

                    <div className="mt-2 h-3 w-32 rounded bg-[var(--fixit-background)]" />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="h-16 rounded-2xl bg-[var(--fixit-background)]" />
                  <div className="h-16 rounded-2xl bg-[var(--fixit-background)]" />
                  <div className="h-16 rounded-2xl bg-[var(--fixit-background)]" />
                  <div className="h-16 rounded-2xl bg-[var(--fixit-background)]" />
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Error State
|--------------------------------------------------------------------------
*/

function BookingsErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--fixit-error)] shadow-sm">
        <XCircle size={24} />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">
        We couldn't load your bookings
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--fixit-text-muted)]">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)]"
      >
        Try again
      </button>
    </div>
  );
}