import { useMemo, useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  MessageSquareText,
  Search,
  XCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  acceptCustomerQuote,
  getCustomerQuotes,
  rejectCustomerQuote,
} from "./quotesApi";

import type { QuoteResponse } from "../../types/quote";


/*
|--------------------------------------------------------------------------
| Customer Quotes Page
|--------------------------------------------------------------------------
|
| URL:
| /customer/quotes
|
| Responsibilities:
|
| - Load customer quotes
| - Search quotes
| - Filter by status
| - Sort newest first
| - Open related service request
| - Accept quote
| - Reject quote
| - Loading state
| - Empty state
| - Error state
|
|--------------------------------------------------------------------------
*/


const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "ACCEPTED",
  "REJECTED",
] as const;

type StatusFilter =
  (typeof STATUS_FILTERS)[number];


/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function CustomerQuotesPage() {
  const queryClient =
    useQueryClient();


  /*
  |--------------------------------------------------------------------------
  | Local state
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [processingQuoteId, setProcessingQuoteId] =
    useState<number | null>(null);


  /*
  |--------------------------------------------------------------------------
  | Load quotes
  |--------------------------------------------------------------------------
  */

  const quotesQuery =
    useQuery<QuoteResponse[]>({
      queryKey: [
        "customer",
        "quotes",
      ],
      queryFn:
        getCustomerQuotes,
    });


  const quotes =
    quotesQuery.data ?? [];


  /*
  |--------------------------------------------------------------------------
  | Filter + sort quotes
  |--------------------------------------------------------------------------
  */

  const filteredQuotes =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return [...quotes]
        .sort(
          (first, second) =>
            new Date(
              second.created_at,
            ).getTime() -
            new Date(
              first.created_at,
            ).getTime(),
        )
        .filter((quote) => {

          /*
          |--------------------------------------------------------------------------
          | Status
          |--------------------------------------------------------------------------
          */

          if (
            statusFilter !== "ALL" &&
            quote.status !== statusFilter
          ) {
            return false;
          }


          /*
          |--------------------------------------------------------------------------
          | Search
          |--------------------------------------------------------------------------
          */

          if (
            normalizedSearch.length === 0
          ) {
            return true;
          }


          const searchableText = [
            `quote ${quote.id}`,
            `request ${quote.service_request_id}`,
            quote.amount,
            quote.note ?? "",
            quote.status,
          ]
            .join(" ")
            .toLowerCase();


          return searchableText.includes(
            normalizedSearch,
          );
        });
    }, [
      quotes,
      search,
      statusFilter,
    ]);


  /*
  |--------------------------------------------------------------------------
  | Accept quote
  |--------------------------------------------------------------------------
  */

  const acceptMutation =
    useMutation<
      QuoteResponse,
      Error,
      number
    >({
      mutationFn:
        acceptCustomerQuote,

      onMutate: (quoteId) => {
        setProcessingQuoteId(
          quoteId,
        );
      },

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "customer",
            "quotes",
          ],
        });

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
        setProcessingQuoteId(
          null,
        );
      },
    });


  /*
  |--------------------------------------------------------------------------
  | Reject quote
  |--------------------------------------------------------------------------
  */

  const rejectMutation =
    useMutation<
      QuoteResponse,
      Error,
      number
    >({
      mutationFn:
        rejectCustomerQuote,

      onMutate: (quoteId) => {
        setProcessingQuoteId(
          quoteId,
        );
      },

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "customer",
            "quotes",
          ],
        });

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
        setProcessingQuoteId(
          null,
        );
      },
    });


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (quotesQuery.isLoading) {
    return (
      <QuotesLoadingState />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (quotesQuery.isError) {
    return (
      <QuotesErrorState
        onRetry={() =>
          quotesQuery.refetch()
        }
      />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Accept handler
  |--------------------------------------------------------------------------
  */

  function handleAccept(
    quoteId: number,
  ) {
    if (
      processingQuoteId !== null
    ) {
      return;
    }


    const confirmed =
      window.confirm(
        "Are you sure you want to accept this quote?",
      );


    if (!confirmed) {
      return;
    }


    acceptMutation.mutate(
      quoteId,
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Reject handler
  |--------------------------------------------------------------------------
  */

  function handleReject(
    quoteId: number,
  ) {
    if (
      processingQuoteId !== null
    ) {
      return;
    }


    const confirmed =
      window.confirm(
        "Are you sure you want to reject this quote?",
      );


    if (!confirmed) {
      return;
    }


    rejectMutation.mutate(
      quoteId,
    );
  }


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

      <section className="relative overflow-hidden rounded-[28px] bg-[var(--fixit-primary-active)] px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10 lg:px-10">

        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--fixit-secondary)] opacity-20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 right-32 h-56 w-56 rounded-full bg-[var(--fixit-primary-hover)] opacity-20 blur-3xl" />


        <div className="relative max-w-3xl">

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">

            <FileText
              size={13}
            />

            <span>
              Quotes
            </span>

          </div>


          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            Compare. Choose.
            <span className="block text-[var(--fixit-secondary)]">
              Get it fixed.
            </span>
          </h1>


          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
            Review quotes from professionals,
            compare pricing, and choose the
            offer that works best for you.
          </p>


          {/* Search */}

          <div className="mt-7 flex max-w-2xl items-center rounded-2xl border border-white/10 bg-white/10 p-1.5 backdrop-blur-md">

            <Search
              size={18}
              className="ml-3 shrink-0 text-white/50"
            />


            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search by quote, request, price or note..."
              className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/35"
            />


            {search.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="mr-1 rounded-xl px-3 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Clear
              </button>
            )}

          </div>

        </div>

      </section>


      {/* ================================================================
          FILTERS + SUMMARY
          ================================================================ */}

      <section>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

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
                        ? "border-[var(--fixit-primary)] bg-[var(--fixit-primary)] text-white shadow-sm"
                        : "border-[var(--fixit-border)] bg-white text-[var(--fixit-text-muted)] hover:border-[var(--fixit-primary)] hover:text-[var(--fixit-primary)]",
                    ].join(" ")}
                  >
                    {status === "ALL"
                      ? "All quotes"
                      : formatStatus(
                          status,
                        )}
                  </button>
                );
              },
            )}

          </div>


          <Link
            to="/customer/requests"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--fixit-text-dark)] transition hover:border-[var(--fixit-primary)] hover:text-[var(--fixit-primary)]"
          >
            <span>
              View requests
            </span>

            <ArrowRight
              size={15}
              className="shrink-0"
            />
          </Link>

        </div>

      </section>


      {/* ================================================================
          RESULTS
          ================================================================ */}

      <section>

        <div className="mb-5">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
            Your offers
          </p>


          <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">

            <h2 className="text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
              {filteredQuotes.length}{" "}
              {filteredQuotes.length === 1
                ? "quote"
                : "quotes"}
            </h2>


            {quotes.length > 0 && (
              <p className="text-xs text-[var(--fixit-text-muted)]">
                Newest quotes appear first
              </p>
            )}

          </div>

        </div>


        {filteredQuotes.length === 0 ? (

          <QuotesEmptyState
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

          <div className="grid gap-5 xl:grid-cols-2">

            {filteredQuotes.map(
              (quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  processing={
                    processingQuoteId ===
                    quote.id
                  }
                  onAccept={() =>
                    handleAccept(
                      quote.id,
                    )
                  }
                  onReject={() =>
                    handleReject(
                      quote.id,
                    )
                  }
                />
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
| Quote Card
|--------------------------------------------------------------------------
*/

function QuoteCard({
  quote,
  processing,
  onAccept,
  onReject,
}: {
  quote: QuoteResponse;
  processing: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const canRespond =
    quote.status === "PENDING";


  const statusConfig =
    getStatusConfig(
      quote.status,
    );


  return (
    <article className="group rounded-[26px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--fixit-primary)]/30 hover:shadow-lg sm:p-6">

      <div className="flex flex-col">


        {/* ============================================================
            CARD HEADER
            ============================================================ */}

        <div className="flex items-start justify-between gap-4">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">

              <FileText
                size={19}
              />

            </div>


            <div className="min-w-0">

              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                Quote #{quote.id}
              </p>


              <h3 className="mt-1 truncate text-base font-semibold text-[var(--fixit-text-dark)]">
                Service request #
                {quote.service_request_id}
              </h3>

            </div>

          </div>


          <QuoteStatus
            status={quote.status}
          />

        </div>


        {/* ============================================================
            PRICE PANEL
            ============================================================ */}

        <div className="relative mt-5 overflow-hidden rounded-2xl bg-[var(--fixit-background)] p-5">

          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--fixit-primary-soft)]" />


          <div className="relative">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                  Quoted price
                </p>


                <p className="mt-1 text-3xl font-bold tracking-[-0.035em] text-[var(--fixit-text-dark)]">
                  ₹
                  {formatPrice(
                    quote.amount,
                  )}
                </p>

              </div>


              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[var(--fixit-primary)] shadow-sm">

                <span className="text-lg font-bold">
                  ₹
                </span>

              </div>

            </div>


            {quote.expires_at && (
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--fixit-text-muted)]">

                <Clock3
                  size={14}
                  className="shrink-0"
                />

                <span>
                  Quote expires{" "}
                  <span className="font-medium text-[var(--fixit-text-dark)]">
                    {formatDateTime(
                      quote.expires_at,
                    )}
                  </span>
                </span>

              </div>
            )}

          </div>

        </div>


        {/* ============================================================
            NOTE
            ============================================================ */}

        {quote.note ? (

          <div className="mt-5 rounded-2xl border border-[var(--fixit-border)] bg-white p-4">

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--fixit-secondary-soft)] text-[var(--fixit-secondary)]">

                <MessageSquareText
                  size={16}
                />

              </div>


              <div className="min-w-0">

                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                  Professional note
                </p>


                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--fixit-text-muted)]">
                  {quote.note}
                </p>

              </div>

            </div>

          </div>

        ) : (

          <div className="mt-5 flex items-center gap-2 text-xs text-[var(--fixit-text-muted)]">

            <MessageSquareText
              size={15}
              className="shrink-0"
            />

            <span>
              No additional note was added.
            </span>

          </div>

        )}


        {/* ============================================================
            REQUEST LINK
            ============================================================ */}

        <Link
          to={`/customer/requests/${quote.service_request_id}`}
          className="mt-5 flex items-center justify-between rounded-xl border border-transparent px-1 py-2 text-xs font-semibold text-[var(--fixit-primary)] transition hover:border-[var(--fixit-primary-soft)] hover:bg-[var(--fixit-primary-soft)]"
        >

          <span>
            View service request
          </span>

          <ArrowRight
            size={14}
            className="shrink-0 transition-transform group-hover:translate-x-0.5"
          />

        </Link>


        {/* ============================================================
            ACTIONS
            ============================================================ */}

        {canRespond && (

          <div className="mt-3 grid gap-2 border-t border-[var(--fixit-border)] pt-4 sm:grid-cols-2">

            <button
              type="button"
              disabled={processing}
              onClick={onReject}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--fixit-error)]/20 bg-white px-4 text-xs font-semibold text-[var(--fixit-error)] transition hover:bg-[var(--fixit-error-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            >

              {processing ? (
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <XCircle
                  size={15}
                />
              )}

              <span>
                Reject quote
              </span>

            </button>


            <button
              type="button"
              disabled={processing}
              onClick={onAccept}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >

              {processing ? (
                <LoaderCircle
                  size={15}
                  className="animate-spin text-white"
                />
              ) : (
                <CheckCircle2
                  size={15}
                  className="text-white"
                />
              )}

              <span>
                Accept quote
              </span>

            </button>

          </div>

        )}


        {/* ============================================================
            COMPLETED STATUS MESSAGE
            ============================================================ */}

        {!canRespond && (
          <div
            className={[
              "mt-4 rounded-xl border px-4 py-3",
              statusConfig.messageContainer,
            ].join(" ")}
          >

            <div className="flex items-center gap-2">

              {quote.status === "ACCEPTED" ? (
                <CheckCircle2
                  size={15}
                  className="shrink-0"
                />
              ) : (
                <XCircle
                  size={15}
                  className="shrink-0"
                />
              )}

              <p
                className={[
                  "text-xs font-semibold",
                  statusConfig.messageText,
                ].join(" ")}
              >
                {getStatusMessage(
                  quote.status,
                )}
              </p>

            </div>

          </div>
        )}

      </div>

    </article>
  );
}


/*
|--------------------------------------------------------------------------
| Quote Status
|--------------------------------------------------------------------------
*/

function QuoteStatus({
  status,
}: {
  status: string;
}) {
  const config =
    getStatusConfig(
      status,
    );


  return (
    <span
      className={[
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold",
        config.container,
      ].join(" ")}
    >

      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          config.dot,
        ].join(" ")}
      />


      <span className={config.text}>
        {formatStatus(status)}
      </span>

    </span>
  );
}


/*
|--------------------------------------------------------------------------
| Loading State
|--------------------------------------------------------------------------
*/

function QuotesLoadingState() {
  return (
    <div className="space-y-7">


      {/* Hero */}

      <section className="rounded-[28px] bg-[var(--fixit-primary-active)] px-6 py-10 sm:px-8 lg:px-10">

        <div className="animate-pulse">

          <div className="h-7 w-24 rounded-full bg-white/10" />

          <div className="mt-5 h-10 w-3/4 max-w-2xl rounded-xl bg-white/10" />

          <div className="mt-3 h-5 w-1/2 max-w-xl rounded bg-white/10" />

          <div className="mt-7 h-14 w-full max-w-2xl rounded-2xl bg-white/10" />

        </div>

      </section>


      {/* Cards */}

      <div className="grid gap-5 xl:grid-cols-2">

        {Array.from({
          length: 4,
        }).map((_, index) => (

          <div
            key={index}
            className="rounded-[26px] border border-[var(--fixit-border)] bg-white p-6"
          >

            <div className="animate-pulse">

              <div className="flex gap-3">

                <div className="h-11 w-11 rounded-xl bg-[var(--fixit-background)]" />

                <div className="flex-1">

                  <div className="h-3 w-20 rounded bg-[var(--fixit-background)]" />

                  <div className="mt-2 h-5 w-40 rounded bg-[var(--fixit-background)]" />

                </div>

              </div>


              <div className="mt-6 h-28 rounded-2xl bg-[var(--fixit-background)]" />

              <div className="mt-5 h-20 rounded-2xl bg-[var(--fixit-background)]" />

              <div className="mt-5 h-11 rounded-xl bg-[var(--fixit-background)]" />

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Empty State
|--------------------------------------------------------------------------
*/

function QuotesEmptyState({
  search,
  statusFilter,
  onClear,
}: {
  search: string;
  statusFilter: StatusFilter;
  onClear: () => void;
}) {
  const hasFilters =
    search.trim().length > 0 ||
    statusFilter !== "ALL";


  return (
    <div className="overflow-hidden rounded-[26px] border border-dashed border-[var(--fixit-border)] bg-white px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">

        <FileText
          size={23}
        />

      </div>


      <h3 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">

        {hasFilters
          ? "No matching quotes"
          : "No quotes yet"}

      </h3>


      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">

        {hasFilters
          ? "Try changing your search or selecting another status."
          : "When professionals respond to your service requests, their quotes will appear here."}

      </p>


      {hasFilters ? (

        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex items-center justify-center rounded-xl border border-[var(--fixit-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--fixit-text-dark)] transition hover:border-[var(--fixit-primary)] hover:text-[var(--fixit-primary)]"
        >
          Clear filters
        </button>

      ) : (

        <Link
          to="/customer/requests"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)]"
        >

          <span>
            View requests
          </span>

          <ArrowRight
            size={15}
            className="shrink-0"
          />

        </Link>

      )}

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Error State
|--------------------------------------------------------------------------
*/

function QuotesErrorState({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--fixit-error)] shadow-sm">

        <FileText
          size={22}
        />

      </div>


      <h2 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">
        We couldn't load your quotes
      </h2>


      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
        Something went wrong while loading your
        quotes. Please try again.
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


/*
|--------------------------------------------------------------------------
| Status configuration
|--------------------------------------------------------------------------
*/

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
        messageContainer:
          "border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] text-[var(--fixit-success)]",
        messageText:
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
        messageContainer:
          "border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)]",
        messageText:
          "text-[var(--fixit-error)]",
      };

    case "EXPIRED":
      return {
        container:
          "border-[var(--fixit-border)] bg-[var(--fixit-background)]",
        dot:
          "bg-[var(--fixit-disabled)]",
        text:
          "text-[var(--fixit-text-muted)]",
        messageContainer:
          "border-[var(--fixit-border)] bg-[var(--fixit-background)]",
        messageText:
          "text-[var(--fixit-text-muted)]",
      };

    default:
      return {
        container:
          "border-[var(--fixit-warning)]/20 bg-[var(--fixit-warning-soft)]",
        dot:
          "bg-[var(--fixit-warning)]",
        text:
          "text-[var(--fixit-warning)]",
        messageContainer:
          "border-[var(--fixit-warning)]/20 bg-[var(--fixit-warning-soft)]",
        messageText:
          "text-[var(--fixit-warning)]",
      };
  }
}


/*
|--------------------------------------------------------------------------
| Status message
|--------------------------------------------------------------------------
*/

function getStatusMessage(
  status: string,
) {
  switch (status) {
    case "ACCEPTED":
      return "This quote has been accepted.";

    case "REJECTED":
      return "This quote has been rejected.";

    case "EXPIRED":
      return "This quote is no longer available.";

    default:
      return "This quote is no longer awaiting your response.";
  }
}


/*
|--------------------------------------------------------------------------
| Format status
|--------------------------------------------------------------------------
*/

function formatStatus(
  status: string,
) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}


/*
|--------------------------------------------------------------------------
| Format price
|--------------------------------------------------------------------------
*/

function formatPrice(
  value: string,
) {
  const numericValue =
    Number(value);


  if (
    Number.isNaN(numericValue)
  ) {
    return value;
  }


  return new Intl.NumberFormat(
    "en-IN",
    {
      maximumFractionDigits: 2,
    },
  ).format(numericValue);
}


/*
|--------------------------------------------------------------------------
| Format date/time
|--------------------------------------------------------------------------
*/

function formatDateTime(
  value: string,
) {
  const date =
    new Date(value);


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