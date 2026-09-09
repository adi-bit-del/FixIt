import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  XCircle,
} from "lucide-react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getProfessionalRequests,
  acceptProfessionalRequest,
  rejectProfessionalRequest,
} from "./professionalRequestsApi";

/*
|--------------------------------------------------------------------------
| View Model
|--------------------------------------------------------------------------
*/

type RequestViewModel = {
  id: number;
  status: string;
  serviceId: number;
  addressId: number;
  customerProfileId: number;
  preferredDate: string | null;
};

/*
|--------------------------------------------------------------------------
| Safe Normalization
|--------------------------------------------------------------------------
*/

function asNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
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

function asNullableString(
  value: unknown,
): string | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  return typeof value === "string"
    ? value
    : null;
}

function normalizeRequest(
  request: {
    id: unknown;
    status: unknown;
    service_id: unknown;
    address_id: unknown;
    customer_profile_id: unknown;
    preferred_date?: unknown;
  },
): RequestViewModel {
  return {
    id: asNumber(request.id),
    status: asString(
      request.status,
      "UNKNOWN",
    ),
    serviceId: asNumber(
      request.service_id,
    ),
    addressId: asNumber(
      request.address_id,
    ),
    customerProfileId:
      asNumber(
        request.customer_profile_id,
      ),
    preferredDate:
      asNullableString(
        request.preferred_date,
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
  value: string | null,
): string {
  if (!value) {
    return "No preferred date";
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

function canRespond(
  status: string,
): boolean {
  return ![
    "ACCEPTED",
    "REJECTED",
    "CANCELLED",
    "COMPLETED",
  ].includes(
    status.toUpperCase(),
  );
}

function getStatusClasses(
  status: string,
): {
  wrapper: string;
  dot: string;
  text: string;
} {
  const normalized =
    status.toUpperCase();

  if (
    [
      "ACCEPTED",
      "CONFIRMED",
      "COMPLETED",
    ].includes(normalized)
  ) {
    return {
      wrapper:
        "border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)]",
      dot:
        "bg-[var(--fixit-success)]",
      text:
        "text-[var(--fixit-success)]",
    };
  }

  if (
    [
      "REJECTED",
      "CANCELLED",
    ].includes(normalized)
  ) {
    return {
      wrapper:
        "border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)]",
      dot:
        "bg-[var(--fixit-error)]",
      text:
        "text-[var(--fixit-error)]",
    };
  }

  return {
    wrapper:
      "border-[var(--fixit-warning)]/20 bg-[var(--fixit-warning-soft)]",
    dot:
      "bg-[var(--fixit-warning)]",
    text:
      "text-[var(--fixit-warning)]",
  };
}

function getStatusMessage(
  status: string,
): string {
  switch (
    status.toUpperCase()
  ) {
    case "ACCEPTED":
      return "You accepted this customer request.";

    case "CONFIRMED":
      return "This request has moved into a confirmed service.";

    case "COMPLETED":
      return "The service related to this request has been completed.";

    case "REJECTED":
      return "You rejected this customer request.";

    case "CANCELLED":
      return "This customer request has been cancelled.";

    default:
      return `Request status: ${formatStatus(
        status,
      )}.`;
  }
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
| Main Page
|--------------------------------------------------------------------------
*/

export default function ProfessionalRequestsPage() {
  const queryClient =
    useQueryClient();

  const requestsQuery =
    useQuery({
      queryKey: [
        "professional-requests",
      ],
      queryFn:
        getProfessionalRequests,
    });

  const acceptMutation =
    useMutation({
      mutationFn:
        acceptProfessionalRequest,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "professional-requests",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "professional-dashboard",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "professional-quotes",
          ],
        });
      },
    });

  const rejectMutation =
    useMutation({
      mutationFn:
        rejectProfessionalRequest,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "professional-requests",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "professional-dashboard",
          ],
        });
      },
    });

  const rawRequests =
    requestsQuery.data ?? [];

  const requests: RequestViewModel[] =
    rawRequests.map(
      (request) =>
        normalizeRequest(request),
    );

  const pendingCount =
    requests.filter(
      (request) =>
        canRespond(
          request.status,
        ),
    ).length;

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (
    requestsQuery.isLoading
  ) {
    return (
      <RequestsLoading />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (
    requestsQuery.isError
  ) {
    return (
      <RequestsError
        message={getErrorMessage(
          requestsQuery.error,
        )}
        onRetry={() =>
          requestsQuery.refetch()
        }
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-7">
      {/* Hero */}

      <section className="relative overflow-hidden rounded-[30px] bg-[var(--fixit-primary-active)] px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10 lg:px-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--fixit-secondary)] opacity-20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-[var(--fixit-primary-hover)] opacity-20 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
            <ClipboardList size={13} />
            Incoming work
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
            Turn requests into
            <span className="block text-[var(--fixit-secondary)]">
              your next job.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
            Review customer service requests,
            check the requested timing and
            location, and decide which jobs are
            right for your business.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Total requests
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {requests.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-[var(--fixit-secondary)]/15 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Need response
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {pendingCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Queue */}

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
              Request queue
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
              {requests.length}{" "}
              {requests.length === 1
                ? "service request"
                : "service requests"}
            </h2>
          </div>

          {pendingCount > 0 && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--fixit-warning)]/20 bg-[var(--fixit-warning-soft)] px-3 py-2 text-xs font-semibold text-[var(--fixit-warning)]">
              <Clock3 size={13} />
              {pendingCount} awaiting your response
            </div>
          )}
        </div>

        {requests.length === 0 ? (
          <RequestsEmpty />
        ) : (
          <div className="space-y-4">
            {requests.map(
              (request) => {
                const actionable =
                  canRespond(
                    request.status,
                  );

                const accepting =
                  acceptMutation.isPending &&
                  acceptMutation.variables ===
                    request.id;

                const rejecting =
                  rejectMutation.isPending &&
                  rejectMutation.variables ===
                    request.id;

                const mutationError =
                  acceptMutation.isError
                    ? acceptMutation.error
                    : rejectMutation.isError
                      ? rejectMutation.error
                      : null;

                return (
                  <article
                    key={request.id}
                    className="rounded-[26px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--fixit-primary)]/25 hover:shadow-lg sm:p-6"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      {/* Main content */}

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                            <ClipboardList
                              size={20}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                                Request
                              </span>

                              <span className="text-xs font-semibold text-[var(--fixit-text-dark)]">
                                #{String(request.id)}
                              </span>

                              {(() => {
                                const status =
                                  getStatusClasses(
                                    request.status,
                                  );

                                return (
                                  <span
                                    className={[
                                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold",
                                      status.wrapper,
                                      status.text,
                                    ].join(" ")}
                                  >
                                    <span
                                      className={[
                                        "h-1.5 w-1.5 rounded-full",
                                        status.dot,
                                      ].join(" ")}
                                    />

                                    {formatStatus(
                                      request.status,
                                    )}
                                  </span>
                                );
                              })()}
                            </div>

                            <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--fixit-text-dark)]">
                              Service request
                            </h3>

                            <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                              Customer profile #
                              {String(
                                request.customerProfileId,
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Request details */}

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-4 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--fixit-text-muted)] shadow-sm">
                              <ClipboardList
                                size={16}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                                Service
                              </p>

                              <p className="mt-1 truncate text-sm font-semibold text-[var(--fixit-text-dark)]">
                                {`Service #${String(
                                  request.serviceId,
                                )}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-4 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--fixit-text-muted)] shadow-sm">
                              <MapPin
                                size={16}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                                Location
                              </p>

                              <p className="mt-1 truncate text-sm font-semibold text-[var(--fixit-text-dark)]">
                                {`Address #${String(
                                  request.addressId,
                                )}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-4 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--fixit-text-muted)] shadow-sm">
                              <Clock3
                                size={16}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                                Preferred date
                              </p>

                              <p className="mt-1 truncate text-sm font-semibold text-[var(--fixit-text-dark)]">
                                {formatDate(
                                  request.preferredDate,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Existing status */}

                        {!actionable && (
                          <div
                            className={[
                              "mt-5 flex items-center gap-2 rounded-xl border px-4 py-3",
                              getStatusClasses(
                                request.status,
                              ).wrapper,
                            ].join(" ")}
                          >
                            {[
                              "ACCEPTED",
                              "CONFIRMED",
                              "COMPLETED",
                            ].includes(
                              request.status.toUpperCase(),
                            ) ? (
                              <CheckCircle2
                                size={16}
                                className={
                                  getStatusClasses(
                                    request.status,
                                  ).text
                                }
                              />
                            ) : (
                              <XCircle
                                size={16}
                                className={
                                  getStatusClasses(
                                    request.status,
                                  ).text
                                }
                              />
                            )}

                            <span
                              className={[
                                "text-xs font-semibold",
                                getStatusClasses(
                                  request.status,
                                ).text,
                              ].join(" ")}
                            >
                              {getStatusMessage(
                                request.status,
                              )}
                            </span>
                          </div>
                        )}

                        {/* Mutation error */}

                        {mutationError && (
                          <div className="mt-5 rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-4 py-3">
                            <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                              We couldn't update this
                              request.
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                              {getErrorMessage(
                                mutationError,
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}

                      {actionable && (
                        <div className="w-full shrink-0 lg:w-44">
                          <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-3">
                            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                              Your response
                            </p>

                            <div className="mt-3 space-y-2">
                              <button
                                type="button"
                                disabled={
                                  acceptMutation.isPending ||
                                  rejectMutation.isPending
                                }
                                onClick={() =>
                                  acceptMutation.mutate(
                                    request.id,
                                  )
                                }
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 text-xs font-semibold !text-white transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--fixit-disabled)] disabled:!text-white"
                              >
                                {accepting ? (
                                  "Accepting..."
                                ) : (
                                  <>
                                    <CheckCircle2
                                      size={15}
                                    />
                                    Accept request
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                disabled={
                                  acceptMutation.isPending ||
                                  rejectMutation.isPending
                                }
                                onClick={() =>
                                  rejectMutation.mutate(
                                    request.id,
                                  )
                                }
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--fixit-error)]/20 bg-white px-4 text-xs font-semibold text-[var(--fixit-error)] transition hover:bg-[var(--fixit-error-soft)] disabled:cursor-not-allowed disabled:bg-[var(--fixit-background)] disabled:text-[var(--fixit-text-muted)]"
                              >
                                {rejecting ? (
                                  "Rejecting..."
                                ) : (
                                  <>
                                    <XCircle
                                      size={15}
                                    />
                                    Reject request
                                  </>
                                )}
                              </button>
                            </div>

                            <p className="mt-3 px-1 text-[10px] leading-4 text-[var(--fixit-text-muted)]">
                              Review the request
                              details before
                              responding.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Empty State
|--------------------------------------------------------------------------
*/

function RequestsEmpty() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-dashed border-[var(--fixit-border)] bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
        <ClipboardList size={24} />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">
        No service requests yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
        New customer requests assigned to
        your professional account will
        appear here.
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Loading
|--------------------------------------------------------------------------
*/

function RequestsLoading() {
  return (
    <div className="space-y-7">
      <section className="rounded-[30px] bg-[var(--fixit-primary-active)] px-6 py-10 sm:px-8 lg:px-10">
        <div className="animate-pulse">
          <div className="h-7 w-40 rounded-full bg-white/10" />

          <div className="mt-5 h-11 w-3/4 max-w-2xl rounded-xl bg-white/10" />

          <div className="mt-3 h-5 w-1/2 max-w-xl rounded bg-white/10" />

          <div className="mt-7 h-14 w-48 rounded-2xl bg-white/10" />
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

                    <div className="mt-3 h-6 w-44 rounded bg-[var(--fixit-background)]" />

                    <div className="mt-2 h-3 w-28 rounded bg-[var(--fixit-background)]" />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
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
| Error
|--------------------------------------------------------------------------
*/

function RequestsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--fixit-error)] shadow-sm">
        <ClipboardList size={22} />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">
        We couldn't load service requests
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