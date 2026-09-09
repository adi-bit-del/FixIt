import {
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Send,
  WalletCards,
  XCircle,
} from "lucide-react";

import {
  useState,
  type SubmitEvent,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createProfessionalQuote,
  getProfessionalQuotes,
} from "./professionalQuotesApi";

import { getProfessionalServices } from "./professionalServicesApi";

import { getProfessionalRequests } from "./professionalRequestsApi";

/*
|--------------------------------------------------------------------------
| Local View Models
|--------------------------------------------------------------------------
|
| API responses can contain loosely typed fields.
| Everything rendered by this page is normalized first.
|
*/

type RequestViewModel = {
  id: number;
  status: string;
  serviceId: number;
};

type ServiceViewModel = {
  id: number;
  isActive: boolean;
};

type QuoteViewModel = {
  id: number;
  status: string;
  serviceRequestId: number;
  amount: number;
  note: string;
  expiresAt: string | null;
};

/*
|--------------------------------------------------------------------------
| Safe Normalizers
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

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return Boolean(value);
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
  };
}

function normalizeService(
  service: {
    id: unknown;
    is_active: unknown;
  },
): ServiceViewModel {
  return {
    id: asNumber(service.id),
    isActive: asBoolean(
      service.is_active,
    ),
  };
}

function normalizeQuote(
  quote: {
    id: unknown;
    status: unknown;
    service_request_id: unknown;
    amount: unknown;
    note?: unknown;
    expires_at?: unknown;
  },
): QuoteViewModel {
  return {
    id: asNumber(quote.id),
    status: asString(
      quote.status,
      "UNKNOWN",
    ),
    serviceRequestId:
      asNumber(
        quote.service_request_id,
      ),
    amount: asNumber(
      quote.amount,
    ),
    note: asString(quote.note),
    expiresAt:
      asNullableString(
        quote.expires_at,
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
    return "No expiry";
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

function getStatusConfig(
  status: string,
): {
  container: string;
  dot: string;
  text: string;
} {
  const value =
    status.toUpperCase();

  if (
    [
      "ACCEPTED",
      "CONFIRMED",
    ].includes(value)
  ) {
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
      "REJECTED",
      "CANCELLED",
      "EXPIRED",
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
| Professional Quotes Page
|--------------------------------------------------------------------------
*/

export default function ProfessionalQuotesPage() {
  const queryClient =
    useQueryClient();

  /*
  |--------------------------------------------------------------------------
  | Form State
  |--------------------------------------------------------------------------
  */

  const [requestId, setRequestId] =
    useState("");

  const [
    professionalServiceId,
    setProfessionalServiceId,
  ] = useState("");

  const [amount, setAmount] =
    useState("");

  const [note, setNote] =
    useState("");

  const [expiresAt, setExpiresAt] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Queries
  |--------------------------------------------------------------------------
  */

  const quotesQuery =
    useQuery({
      queryKey: [
        "professional-quotes",
      ],
      queryFn:
        getProfessionalQuotes,
    });

  const requestsQuery =
    useQuery({
      queryKey: [
        "professional-requests",
      ],
      queryFn:
        getProfessionalRequests,
    });

  const servicesQuery =
    useQuery({
      queryKey: [
        "professional-services",
      ],
      queryFn:
        getProfessionalServices,
    });

  /*
  |--------------------------------------------------------------------------
  | Create Quote
  |--------------------------------------------------------------------------
  */

  const createMutation =
    useMutation({
      mutationFn: () =>
        createProfessionalQuote(
          Number(requestId),
          {
            professional_service_id:
              Number(
                professionalServiceId,
              ),
            amount: Number(amount),
            note:
              note.trim() || null,
            expires_at: expiresAt
              ? new Date(
                  expiresAt,
                ).toISOString()
              : null,
          },
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "professional-quotes",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "professional-dashboard",
          ],
        });

        setRequestId("");
        setProfessionalServiceId("");
        setAmount("");
        setNote("");
        setExpiresAt("");
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Normalize API Data
  |--------------------------------------------------------------------------
  */

  const requests: RequestViewModel[] =
    (requestsQuery.data ?? []).map(
      normalizeRequest,
    );

  const services: ServiceViewModel[] =
    (servicesQuery.data ?? []).map(
      normalizeService,
    );

  const quotes: QuoteViewModel[] =
    (quotesQuery.data ?? []).map(
      normalizeQuote,
    );

  const acceptedRequests =
    requests.filter(
      (request) =>
        request.status.toUpperCase() ===
        "ACCEPTED",
    );

  const activeServices =
    services.filter(
      (service) =>
        service.isActive,
    );

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  function submit(
    event: SubmitEvent,
  ) {
    event.preventDefault();

    const numericAmount =
      Number(amount);

    if (
      !requestId ||
      !professionalServiceId ||
      !amount ||
      !Number.isFinite(
        numericAmount,
      ) ||
      numericAmount <= 0
    ) {
      return;
    }

    createMutation.mutate();
  }

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  const loading =
    requestsQuery.isLoading ||
    servicesQuery.isLoading ||
    quotesQuery.isLoading;

  /*
  |--------------------------------------------------------------------------
  | Render
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
            <FileText size={13} />
            Pricing & proposals
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
            Turn accepted requests into
            <span className="block text-[var(--fixit-secondary)]">
              clear proposals.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
            Create professional quotes, set
            your price, define an expiry date,
            and keep track of every proposal
            you've sent.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Sent quotes
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {quotes.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Accepted requests
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {acceptedRequests.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-[var(--fixit-secondary)]/15 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Active services
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {activeServices.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          MAIN CONTENT
          ================================================================ */}

      <section className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
        {/* ==============================================================
            CREATE QUOTE
            ============================================================== */}

        <div className="h-fit rounded-[26px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
              <Plus size={19} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                New quote
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--fixit-text-dark)]">
                Create a quote
              </h2>

              <p className="mt-1 text-sm leading-5 text-[var(--fixit-text-muted)]">
                Send pricing for an accepted
                customer request.
              </p>
            </div>
          </div>

          {acceptedRequests.length ===
            0 && (
            <div className="mt-5 rounded-2xl border border-[var(--fixit-warning)]/20 bg-[var(--fixit-warning-soft)] p-4">
              <div className="flex items-start gap-3">
                <Clock3
                  size={17}
                  className="mt-0.5 shrink-0 text-[var(--fixit-warning)]"
                />

                <div>
                  <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                    No accepted requests
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                    Accept a customer request
                    first. It will then become
                    available here for quoting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeServices.length ===
            0 && (
            <div className="mt-3 rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] p-4">
              <div className="flex items-start gap-3">
                <XCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-[var(--fixit-error)]"
                />

                <div>
                  <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                    No active services
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                    Add and activate a professional
                    service before creating a
                    quote.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={submit}
            className="mt-6 space-y-5"
          >
            {/* Request */}

            <div>
              <label
                htmlFor="quote-request"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text-dark)]"
              >
                Customer request
              </label>

              <select
                id="quote-request"
                value={requestId}
                onChange={(event) =>
                  setRequestId(
                    event.target.value,
                  )
                }
                disabled={
                  acceptedRequests.length ===
                  0
                }
                className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-sm text-[var(--fixit-text-dark)] outline-none transition focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10 disabled:cursor-not-allowed disabled:bg-[var(--fixit-background)]"
              >
                <option value="">
                  Select an accepted request
                </option>

                {acceptedRequests.map(
                  (request) => (
                    <option
                      key={request.id}
                      value={String(
                        request.id,
                      )}
                    >
                      {`Request #${request.id} · Service #${request.serviceId}`}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Professional service */}

            <div>
              <label
                htmlFor="quote-service"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text-dark)]"
              >
                Your service
              </label>

              <select
                id="quote-service"
                value={
                  professionalServiceId
                }
                onChange={(event) =>
                  setProfessionalServiceId(
                    event.target.value,
                  )
                }
                disabled={
                  activeServices.length ===
                  0
                }
                className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-sm text-[var(--fixit-text-dark)] outline-none transition focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10 disabled:cursor-not-allowed disabled:bg-[var(--fixit-background)]"
              >
                <option value="">
                  Select your service
                </option>

                {activeServices.map(
                  (service) => (
                    <option
                      key={service.id}
                      value={String(
                        service.id,
                      )}
                    >
                      {`Professional service #${service.id}`}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Amount */}

            <div>
              <label
                htmlFor="quote-amount"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text-dark)]"
              >
                Quote amount
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--fixit-text-muted)]">
                  ₹
                </span>

                <input
                  id="quote-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value,
                    )
                  }
                  placeholder="949"
                  className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white pl-8 pr-3 text-sm text-[var(--fixit-text-dark)] outline-none transition placeholder:text-slate-400 focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10"
                />
              </div>
            </div>

            {/* Note */}

            <div>
              <label
                htmlFor="quote-note"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text-dark)]"
              >
                Note
                <span className="ml-1 font-normal text-[var(--fixit-text-muted)]">
                  optional
                </span>
              </label>

              <textarea
                id="quote-note"
                value={note}
                onChange={(event) =>
                  setNote(
                    event.target.value,
                  )
                }
                rows={4}
                placeholder="Explain what's included in the quote..."
                className="w-full resize-none rounded-xl border border-[var(--fixit-border)] bg-white px-3 py-2.5 text-sm leading-6 text-[var(--fixit-text-dark)] outline-none transition placeholder:text-slate-400 focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10"
              />
            </div>

            {/* Expiry */}

            <div>
              <label
                htmlFor="quote-expiry"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text-dark)]"
              >
                Quote expiry
                <span className="ml-1 font-normal text-[var(--fixit-text-muted)]">
                  optional
                </span>
              </label>

              <input
                id="quote-expiry"
                type="datetime-local"
                value={expiresAt}
                onChange={(event) =>
                  setExpiresAt(
                    event.target.value,
                  )
                }
                className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-sm text-[var(--fixit-text-dark)] outline-none transition focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10"
              />
            </div>

            {/* Error */}

            {createMutation.isError && (
              <div className="rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] p-4">
                <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                  We couldn't send the quote.
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                  {getErrorMessage(
                    createMutation.error,
                  )}
                </p>
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                !requestId ||
                !professionalServiceId ||
                !amount ||
                Number(amount) <= 0
              }
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 text-sm font-semibold !text-white transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--fixit-disabled)] disabled:!text-white"
            >
              <Send size={15} />

              {createMutation.isPending
                ? "Sending quote..."
                : "Send quote"}
            </button>
          </form>
        </div>

        {/* ==============================================================
            SENT QUOTES
            ============================================================== */}

        <div className="min-w-0 rounded-[26px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                  <WalletCards size={17} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                    Quote history
                  </p>

                  <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-[var(--fixit-text-dark)]">
                    Sent quotes
                  </h2>
                </div>
              </div>

              <p className="mt-2 text-sm leading-5 text-[var(--fixit-text-muted)]">
                Track quotations you've
                submitted to customers.
              </p>
            </div>

            <div className="w-fit rounded-xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                Total
              </p>

              <p className="mt-0.5 text-sm font-bold text-[var(--fixit-text-dark)]">
                {quotes.length}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 space-y-3">
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[var(--fixit-border)] p-5"
                  >
                    <div className="animate-pulse">
                      <div className="h-4 w-28 rounded bg-[var(--fixit-background)]" />

                      <div className="mt-3 h-3 w-36 rounded bg-[var(--fixit-background)]" />

                      <div className="mt-5 h-12 rounded-xl bg-[var(--fixit-background)]" />
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : quotes.length ===
            0 ? (
            <div className="mt-6 rounded-[22px] border border-dashed border-[var(--fixit-border)] px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                <FileText size={23} />
              </div>

              <h3 className="mt-5 text-base font-semibold text-[var(--fixit-text-dark)]">
                No quotes yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--fixit-text-muted)]">
                Quotes you send to customers
                will appear here with their
                current status.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {quotes.map(
                (quote) => {
                  const statusConfig =
                    getStatusConfig(
                      quote.status,
                    );

                  return (
                    <article
                      key={quote.id}
                      className="rounded-2xl border border-[var(--fixit-border)] p-5 transition hover:border-[var(--fixit-primary)]/25 hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        {/* Quote identity */}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                              Quote
                            </span>

                            <span className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                              #{quote.id}
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
                                quote.status,
                              )}
                            </span>
                          </div>

                          <p className="mt-2 text-sm font-medium text-[var(--fixit-text-dark)]">
                            Service request #
                            {
                              quote.serviceRequestId
                            }
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--fixit-text-muted)]">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock3
                                size={13}
                              />

                              {quote.expiresAt
                                ? `Expires ${formatDate(
                                    quote.expiresAt,
                                  )}`
                                : "No expiry"}
                            </span>
                          </div>
                        </div>

                        {/* Amount */}

                        <div className="shrink-0 lg:text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                            Quote amount
                          </p>

                          <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--fixit-text-dark)]">
                            ₹
                            {formatAmount(
                              quote.amount,
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Note */}

                      {quote.note.trim() !==
                        "" && (
                        <div className="mt-4 rounded-xl bg-[var(--fixit-background)] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                            Note
                          </p>

                          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-[var(--fixit-text-muted)]">
                            {
                              quote.note
                            }
                          </p>
                        </div>
                      )}

                      {/* Accepted state */}

                      {[
                        "ACCEPTED",
                        "CONFIRMED",
                      ].includes(
                        quote.status.toUpperCase(),
                      ) && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] px-3.5 py-3">
                          <CheckCircle2
                            size={15}
                            className="text-[var(--fixit-success)]"
                          />

                          <span className="text-xs font-semibold text-[var(--fixit-success)]">
                            This quote has been
                            accepted.
                          </span>
                        </div>
                      )}

                      {/* Rejected / expired state */}

                      {[
                        "REJECTED",
                        "CANCELLED",
                        "EXPIRED",
                      ].includes(
                        quote.status.toUpperCase(),
                      ) && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-3.5 py-3">
                          <XCircle
                            size={15}
                            className="text-[var(--fixit-error)]"
                          />

                          <span className="text-xs font-semibold text-[var(--fixit-error)]">
                            This quote is no
                            longer active.
                          </span>
                        </div>
                      )}
                    </article>
                  );
                },
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}