import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  MapPin,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  cancelCustomerBooking,
  createCustomerBooking,
  getCustomerBookings,
  type BookingResponse,
} from "./bookingsApi";

import {
  getCustomerQuotes,
} from "./quotesApi";

import type {
  QuoteResponse,
} from "../../types/quote";


/*
|--------------------------------------------------------------------------
| Customer Bookings Page
|--------------------------------------------------------------------------
|
| URL:
|
| /customer/bookings
|
| Create booking:
|
| /customer/bookings?quote_id=5
|
| Responsibilities:
|
| - View customer bookings
| - Create a booking from an accepted quote
| - Select appointment date/time
| - Cancel eligible bookings
| - Search bookings
| - Filter booking status
| - Loading state
| - Empty state
| - Error state
|
|--------------------------------------------------------------------------
*/


const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

type StatusFilter =
  (typeof STATUS_FILTERS)[number];


/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function CustomerBookingsPage() {
  const queryClient =
    useQueryClient();

  const [searchParams] =
    useSearchParams();

  const quoteIdParam =
    searchParams.get("quote_id");

  const quoteId =
    quoteIdParam
      ? Number(quoteIdParam)
      : null;


  /*
  |--------------------------------------------------------------------------
  | Local state
  |--------------------------------------------------------------------------
  */

  const [scheduledAt, setScheduledAt] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [processingBookingId, setProcessingBookingId] =
    useState<number | null>(null);


  /*
  |--------------------------------------------------------------------------
  | Load bookings
  |--------------------------------------------------------------------------
  */

  const bookingsQuery =
    useQuery<BookingResponse[]>({
      queryKey: [
        "customer",
        "bookings",
      ],
      queryFn:
        getCustomerBookings,
    });


  /*
  |--------------------------------------------------------------------------
  | Load quotes only when creating
  |--------------------------------------------------------------------------
  */

  const hasValidQuoteId =
    Number.isFinite(
      quoteId ?? NaN,
    );


  const quotesQuery =
    useQuery<QuoteResponse[]>({
      queryKey: [
        "customer",
        "quotes",
      ],
      queryFn:
        getCustomerQuotes,
      enabled:
        hasValidQuoteId,
    });


  /*
  |--------------------------------------------------------------------------
  | Data
  |--------------------------------------------------------------------------
  */

  const bookings =
    bookingsQuery.data ?? [];

  const quotes =
    quotesQuery.data ?? [];


  /*
  |--------------------------------------------------------------------------
  | Selected quote
  |--------------------------------------------------------------------------
  */

  const selectedQuote =
    useMemo(() => {
      if (
        quoteId === null ||
        !Number.isFinite(quoteId)
      ) {
        return null;
      }

      return (
        quotes.find(
          (quote) =>
            quote.id === quoteId,
        ) ?? null
      );
    }, [
      quoteId,
      quotes,
    ]);


  /*
  |--------------------------------------------------------------------------
  | Filter + sort bookings
  |--------------------------------------------------------------------------
  */

  const filteredBookings =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return [...bookings]
        .sort(
          (first, second) =>
            new Date(
              second.created_at,
            ).getTime() -
            new Date(
              first.created_at,
            ).getTime(),
        )
        .filter((booking) => {

          /*
          |--------------------------------------------------------------------------
          | Status filter
          |--------------------------------------------------------------------------
          */

          if (
            statusFilter !== "ALL" &&
            booking.status !==
              statusFilter
          ) {
            return false;
          }


          /*
          |--------------------------------------------------------------------------
          | Search filter
          |--------------------------------------------------------------------------
          */

          if (
            normalizedSearch.length === 0
          ) {
            return true;
          }


          const searchableText = [
            `booking ${booking.id}`,
            `quote ${booking.quote_id}`,
            `request ${booking.service_request_id}`,
            `service ${booking.service_id}`,
            booking.amount,
            booking.status,
          ]
            .join(" ")
            .toLowerCase();


          return searchableText.includes(
            normalizedSearch,
          );
        });
    }, [
      bookings,
      search,
      statusFilter,
    ]);


  /*
  |--------------------------------------------------------------------------
  | Create booking mutation
  |--------------------------------------------------------------------------
  */

  const createBookingMutation =
    useMutation<
      BookingResponse,
      Error,
      {
        quoteId: number;
        scheduledAt: string;
      }
    >({
      mutationFn: ({
        quoteId:
          selectedQuoteId,
        scheduledAt:
          selectedScheduledAt,
      }) =>
        createCustomerBooking(
          selectedQuoteId,
          {
            scheduled_at:
              selectedScheduledAt,
          },
        ),

      onSuccess: (
        booking,
      ) => {
        queryClient.invalidateQueries({
          queryKey: [
            "customer",
            "bookings",
          ],
        });

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

        /*
        |--------------------------------------------------------------------------
        | Remove quote_id from the URL without
        | forcing navigation away from the page.
        |--------------------------------------------------------------------------
        */

        window.history.replaceState(
          null,
          "",
          "/customer/bookings",
        );

        setScheduledAt("");

        void booking;
      },
    });


  /*
  |--------------------------------------------------------------------------
  | Cancel booking mutation
  |--------------------------------------------------------------------------
  */

  const cancelBookingMutation =
    useMutation<
      BookingResponse,
      Error,
      number
    >({
      mutationFn:
        cancelCustomerBooking,

      onMutate: (
        bookingId,
      ) => {
        setProcessingBookingId(
          bookingId,
        );
      },

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "customer",
            "bookings",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "customer",
            "booking",
          ],
        });
      },

      onSettled: () => {
        setProcessingBookingId(
          null,
        );
      },
    });


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (
    bookingsQuery.isLoading ||
    (
      hasValidQuoteId &&
      quotesQuery.isLoading
    )
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
    bookingsQuery.isError ||
    quotesQuery.isError
  ) {
    return (
      <BookingsErrorState
        onRetry={() => {
          void bookingsQuery.refetch();

          if (hasValidQuoteId) {
            void quotesQuery.refetch();
          }
        }}
      />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Create booking
  |--------------------------------------------------------------------------
  */

  function handleCreateBooking() {
    if (
      quoteId === null ||
      !Number.isFinite(quoteId)
    ) {
      return;
    }


    if (!selectedQuote) {
      return;
    }


    /*
    |--------------------------------------------------------------------------
    | Important:
    | A booking must be created from an ACCEPTED quote.
    |--------------------------------------------------------------------------
    */

    if (
      selectedQuote.status !==
      "ACCEPTED"
    ) {
      return;
    }


    if (!scheduledAt) {
      return;
    }


    createBookingMutation.mutate({
      quoteId,
      scheduledAt:
        new Date(
          scheduledAt,
        ).toISOString(),
    });
  }


  /*
  |--------------------------------------------------------------------------
  | Cancel booking
  |--------------------------------------------------------------------------
  */

  function handleCancelBooking(
    bookingId: number,
  ) {
    if (
      processingBookingId !== null
    ) {
      return;
    }


    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this booking?",
      );


    if (!confirmed) {
      return;
    }


    cancelBookingMutation.mutate(
      bookingId,
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Minimum appointment datetime
  |--------------------------------------------------------------------------
  */

  const minimumDateTime =
    getMinimumDateTime();


  return (
    <div className="space-y-7">


      {/* ================================================================
          HERO
          ================================================================ */}

      <section className="relative overflow-hidden rounded-[28px] bg-[var(--fixit-primary-active)] px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10 lg:px-10">

        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--fixit-secondary)] opacity-20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 right-32 h-56 w-56 rounded-full bg-[var(--fixit-primary-hover)] opacity-20 blur-3xl" />


        <div className="relative max-w-3xl">

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">

            <CalendarDays
              size={13}
            />

            <span>
              Bookings
            </span>

          </div>


          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            Your appointments.
            <span className="block text-[var(--fixit-secondary)]">
              Your schedule.
            </span>
          </h1>


          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
            Keep track of upcoming service
            appointments, active work, and
            completed bookings in one place.
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
              placeholder="Search by booking, request, service or amount..."
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
          CREATE BOOKING
          ================================================================ */}

      {hasValidQuoteId && (

        <CreateBookingCard
          quote={selectedQuote}
          scheduledAt={
            scheduledAt
          }
          minimumDateTime={
            minimumDateTime
          }
          isCreating={
            createBookingMutation.isPending
          }
          isSuccess={
            createBookingMutation.isSuccess
          }
          createdBookingId={
            createBookingMutation
              .data?.id ?? null
          }
          onChange={
            setScheduledAt
          }
          onCreate={
            handleCreateBooking
          }
          error={
            createBookingMutation.error
          }
        />

      )}


      {/* ================================================================
          FILTERS
          ================================================================ */}

      <section>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

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
                      ? "All bookings"
                      : formatStatus(
                          status,
                        )}
                  </button>
                );
              },
            )}

          </div>


          <Link
            to="/customer/quotes"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--fixit-text-dark)] transition hover:border-[var(--fixit-primary)] hover:text-[var(--fixit-primary)]"
          >
            <span>
              View quotes
            </span>

            <ArrowRight
              size={15}
              className="shrink-0"
            />

          </Link>

        </div>

      </section>


      {/* ================================================================
          BOOKING LIST
          ================================================================ */}

      <section>

        <div className="mb-5">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
            Your appointments
          </p>


          <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">

            <h2 className="text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
              {filteredBookings.length}{" "}
              {filteredBookings.length === 1
                ? "booking"
                : "bookings"}
            </h2>


            {bookings.length > 0 && (
              <p className="text-xs text-[var(--fixit-text-muted)]">
                Newest bookings appear first
              </p>
            )}

          </div>

        </div>


        {filteredBookings.length === 0 ? (

          <BookingsEmptyState
            hasFilters={
              search.trim().length > 0 ||
              statusFilter !== "ALL"
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

            {filteredBookings.map(
              (booking) => (

                <BookingCard
                  key={booking.id}
                  booking={booking}
                  processing={
                    processingBookingId ===
                    booking.id
                  }
                  onCancel={() =>
                    handleCancelBooking(
                      booking.id,
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
| Create Booking Card
|--------------------------------------------------------------------------
*/

function CreateBookingCard({
  quote,
  scheduledAt,
  minimumDateTime,
  isCreating,
  isSuccess,
  createdBookingId,
  onChange,
  onCreate,
  error,
}: {
  quote: QuoteResponse | null;
  scheduledAt: string;
  minimumDateTime: string;
  isCreating: boolean;
  isSuccess: boolean;
  createdBookingId: number | null;
  onChange: (
    value: string,
  ) => void;
  onCreate: () => void;
  error: Error | null;
}) {


  /*
  |--------------------------------------------------------------------------
  | Quote unavailable
  |--------------------------------------------------------------------------
  */

  if (!quote) {
    return (
      <section className="overflow-hidden rounded-[26px] border border-[var(--fixit-warning)]/20 bg-[var(--fixit-warning-soft)] p-5 sm:p-6">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-warning)]">
              Booking
            </p>


            <h2 className="mt-1 text-lg font-semibold text-[var(--fixit-text-dark)]">
              Quote not found
            </h2>


            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)]">
              The selected quote could not be
              found. Return to your quotes and
              choose an accepted quote.
            </p>

          </div>


          <Link
            to="/customer/quotes"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)]"
          >
            <span>
              View quotes
            </span>

            <ArrowRight
              size={15}
            />

          </Link>

        </div>

      </section>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Only accepted quotes may become bookings
  |--------------------------------------------------------------------------
  */

  const canBook =
    quote.status === "ACCEPTED";


  if (!canBook) {
    return (
      <section className="rounded-[26px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm sm:p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fixit-warning)]/20 bg-[var(--fixit-warning-soft)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--fixit-warning)]">

                <Clock3
                  size={12}
                />

                {formatStatus(
                  quote.status,
                )}

              </span>

              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                Quote #{quote.id}
              </span>

            </div>


            <h2 className="mt-3 text-lg font-semibold text-[var(--fixit-text-dark)]">
              This quote cannot be booked
              yet
            </h2>


            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)]">
              A booking can be created only
              after the quote has been accepted.
              Return to your quotes to review
              the available offers.
            </p>

          </div>


          <Link
            to="/customer/quotes"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)]"
          >
            <span>
              View quotes
            </span>

            <ArrowRight
              size={15}
            />

          </Link>

        </div>

      </section>
    );
  }


  return (
    <section className="overflow-hidden rounded-[26px] border border-[var(--fixit-border)] bg-white shadow-sm">

      {/* Accent */}

      <div className="h-1 bg-gradient-to-r from-[var(--fixit-primary)] via-[var(--fixit-primary-hover)] to-[var(--fixit-secondary)]" />


      <div className="p-5 sm:p-6 lg:p-7">


        {/* ============================================================
            HEADER
            ============================================================ */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--fixit-success)]">

                <CheckCircle2
                  size={12}
                />

                Accepted quote

              </span>


              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                Quote #{quote.id}
              </span>

            </div>


            <h2 className="mt-3 text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
              Choose your appointment
            </h2>


            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)]">
              Select a convenient date and time
              to turn your accepted quote into a
              confirmed FixIt booking.
            </p>

          </div>


          {/* Amount */}

          <div className="shrink-0 rounded-2xl bg-[var(--fixit-background)] px-5 py-4">

            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
              Agreed amount
            </p>


            <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[var(--fixit-text-dark)]">
              ₹
              {formatPrice(
                quote.amount,
              )}
            </p>

          </div>

        </div>


        {/* ============================================================
            FORM
            ============================================================ */}

        <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">

          <div>

            <label
              htmlFor="booking-date-time"
              className="mb-2 block text-sm font-semibold text-[var(--fixit-text-dark)]"
            >
              Appointment date & time
            </label>


            <input
              id="booking-date-time"
              type="datetime-local"
              value={scheduledAt}
              min={minimumDateTime}
              onChange={(event) =>
                onChange(
                  event.target.value,
                )
              }
              className="h-12 w-full rounded-xl border border-[var(--fixit-border)] bg-white px-4 text-sm text-[var(--fixit-text-dark)] outline-none transition focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-soft)]"
            />


            <p className="mt-2 text-xs text-[var(--fixit-text-muted)]">
              Choose a future appointment
              time that works for you.
            </p>

          </div>


          <button
            type="button"
            disabled={
              !scheduledAt ||
              isCreating
            }
            onClick={onCreate}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >

            {isCreating ? (

              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin text-white"
                />

                <span>
                  Creating booking...
                </span>
              </>

            ) : (

              <>
                <CalendarDays
                  size={17}
                  className="text-white"
                />

                <span>
                  Confirm booking
                </span>
              </>

            )}

          </button>

        </div>


        {/* ============================================================
            ERROR
            ============================================================ */}

        {error && (

          <div className="mt-5 rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-4 py-3">

            <div className="flex items-start gap-3">

              <XCircle
                size={17}
                className="mt-0.5 shrink-0 text-[var(--fixit-error)]"
              />


              <div>

                <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                  We couldn't create the
                  booking.
                </p>


                <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                  {getApiErrorMessage(
                    error,
                  )}
                </p>

              </div>

            </div>

          </div>

        )}


        {/* ============================================================
            SUCCESS
            ============================================================ */}

        {isSuccess &&
          createdBookingId !== null && (

            <div className="mt-5 rounded-2xl border border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] px-4 py-3">

              <div className="flex items-start gap-3">

                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-[var(--fixit-success)]"
                />


                <div>

                  <p className="text-sm font-semibold text-[var(--fixit-success)]">
                    Booking confirmed
                  </p>


                  <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                    Booking #
                    {createdBookingId}{" "}
                    has been created successfully.
                    Your appointment is now in
                    your bookings list.
                  </p>

                </div>

              </div>

            </div>

          )}


        {/* ============================================================
            TRUST NOTE
            ============================================================ */}

        <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-[var(--fixit-text-muted)]">

          <ShieldCheck
            size={14}
            className="mt-0.5 shrink-0 text-[var(--fixit-success)]"
          />

          <span>
            Your booking uses the accepted quote
            amount. Payment is handled separately.
          </span>

        </div>

      </div>

    </section>
  );
}


/*
|--------------------------------------------------------------------------
| Booking Card
|--------------------------------------------------------------------------
*/

function BookingCard({
  booking,
  processing,
  onCancel,
}: {
  booking: BookingResponse;
  processing: boolean;
  onCancel: () => void;
}) {
  const canCancel =
    booking.status === "PENDING" ||
    booking.status === "CONFIRMED";


  const statusConfig =
    getStatusConfig(
      booking.status,
    );


  return (
    <article className="group rounded-[26px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--fixit-primary)]/30 hover:shadow-lg sm:p-6">

      <div className="flex flex-col">


        {/* ============================================================
            HEADER
            ============================================================ */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div className="flex min-w-0 gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">

              <CalendarDays
                size={20}
              />

            </div>


            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h3 className="text-base font-semibold text-[var(--fixit-text-dark)]">
                  Booking #{booking.id}
                </h3>


                <BookingStatus
                  status={
                    booking.status
                  }
                />

              </div>


              <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                Service request #
                {booking.service_request_id}
              </p>

            </div>

          </div>


          <div
            className={[
              "hidden shrink-0 rounded-xl px-3 py-2 text-right sm:block",
              statusConfig.summaryBackground,
            ].join(" ")}
          >

            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
              Status
            </p>

            <p
              className={[
                "mt-0.5 text-xs font-semibold",
                statusConfig.text,
              ].join(" ")}
            >
              {getBookingStatusMessage(
                booking.status,
              )}
            </p>

          </div>

        </div>


        {/* ============================================================
            MOBILE STATUS MESSAGE
            ============================================================ */}

        <div
          className={[
            "mt-4 rounded-xl px-3 py-2 sm:hidden",
            statusConfig.summaryBackground,
          ].join(" ")}
        >

          <p
            className={[
              "text-xs font-semibold",
              statusConfig.text,
            ].join(" ")}
          >
            {getBookingStatusMessage(
              booking.status,
            )}
          </p>

        </div>


        {/* ============================================================
            BOOKING INFORMATION
            ============================================================ */}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">

          <BookingInfo
            icon={
              <CalendarDays
                size={16}
              />
            }
            label="Scheduled"
            value={formatDateTime(
              booking.scheduled_at,
            )}
          />


          <BookingInfo
            icon={
              <FileText
                size={16}
              />
            }
            label="Agreed amount"
            value={`₹${formatPrice(
              booking.amount,
            )}`}
          />


          <BookingInfo
            icon={
              <MapPin
                size={16}
              />
            }
            label="Service address"
            value={`Address #${booking.address_id}`}
          />


          <BookingInfo
            icon={
              <ShieldCheck
                size={16}
              />
            }
            label="Accepted quote"
            value={`Quote #${booking.quote_id}`}
          />

        </div>


        {/* ============================================================
            CREATED
            ============================================================ */}

        <div className="mt-5 flex items-center gap-2 text-xs text-[var(--fixit-text-muted)]">

          <Clock3
            size={14}
            className="shrink-0"
          />

          <span>
            Booking created{" "}
            {formatDateTime(
              booking.created_at,
            )}
          </span>

        </div>


        {/* ============================================================
            ACTIONS
            ============================================================ */}

        <div className="mt-4 flex flex-col gap-3 border-t border-[var(--fixit-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">

          <Link
            to={`/customer/requests/${booking.service_request_id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--fixit-primary)] transition hover:text-[var(--fixit-primary-hover)]"
          >

            <span>
              View service request
            </span>

            <ArrowRight
              size={14}
              className="shrink-0 transition-transform group-hover:translate-x-0.5"
            />

          </Link>


          {canCancel && (

            <button
              type="button"
              disabled={processing}
              onClick={onCancel}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--fixit-error)]/20 bg-white px-4 py-2.5 text-xs font-semibold text-[var(--fixit-error)] transition hover:bg-[var(--fixit-error-soft)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
                {processing
                  ? "Cancelling..."
                  : "Cancel booking"}
              </span>

            </button>

          )}

        </div>


        {/* ============================================================
            TERMINAL STATUS
            ============================================================ */}

        {booking.status ===
          "COMPLETED" && (

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--fixit-primary)]/10 bg-[var(--fixit-primary-soft)] px-4 py-3">

            <CheckCircle2
              size={16}
              className="shrink-0 text-[var(--fixit-primary)]"
            />

            <p className="text-xs font-medium text-[var(--fixit-primary)]">
              This service has been
              completed.
            </p>

          </div>

        )}


        {booking.status ===
          "CANCELLED" && (

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-4 py-3">

            <XCircle
              size={16}
              className="shrink-0 text-[var(--fixit-text-muted)]"
            />

            <p className="text-xs font-medium text-[var(--fixit-text-muted)]">
              This booking has been
              cancelled.
            </p>

          </div>

        )}

      </div>

    </article>
  );
}


/*
|--------------------------------------------------------------------------
| Booking Information
|--------------------------------------------------------------------------
*/

function BookingInfo({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-4 py-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--fixit-text-muted)] shadow-sm">
        {icon}
      </div>


      <div className="min-w-0">

        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
          {label}
        </p>


        <p className="mt-1 truncate text-sm font-medium text-[var(--fixit-text-dark)]">
          {value}
        </p>

      </div>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Booking Status
|--------------------------------------------------------------------------
*/

function BookingStatus({
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
        {formatStatus(
          status,
        )}
      </span>

    </span>
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


      {/* Hero */}

      <section className="rounded-[28px] bg-[var(--fixit-primary-active)] px-6 py-10 sm:px-8 lg:px-10">

        <div className="animate-pulse">

          <div className="h-7 w-24 rounded-full bg-white/10" />

          <div className="mt-5 h-10 w-3/4 max-w-2xl rounded-xl bg-white/10" />

          <div className="mt-3 h-5 w-1/2 max-w-xl rounded bg-white/10" />

          <div className="mt-7 h-14 w-full max-w-2xl rounded-2xl bg-white/10" />

        </div>

      </section>


      {/* Booking skeletons */}

      <div className="space-y-4">

        {Array.from({
          length: 3,
        }).map((_, index) => (

          <div
            key={index}
            className="rounded-[26px] border border-[var(--fixit-border)] bg-white p-6"
          >

            <div className="animate-pulse">

              <div className="flex gap-4">

                <div className="h-12 w-12 rounded-2xl bg-[var(--fixit-background)]" />

                <div className="flex-1">

                  <div className="h-5 w-32 rounded bg-[var(--fixit-background)]" />

                  <div className="mt-3 h-3 w-28 rounded bg-[var(--fixit-background)]" />

                </div>

              </div>


              <div className="mt-6 grid gap-3 sm:grid-cols-2">

                <div className="h-16 rounded-2xl bg-[var(--fixit-background)]" />

                <div className="h-16 rounded-2xl bg-[var(--fixit-background)]" />

                <div className="h-16 rounded-2xl bg-[var(--fixit-background)]" />

                <div className="h-16 rounded-2xl bg-[var(--fixit-background)]" />

              </div>

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

function BookingsEmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-dashed border-[var(--fixit-border)] bg-white px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">

        <CalendarDays
          size={23}
        />

      </div>


      <h3 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">

        {hasFilters
          ? "No matching bookings"
          : "No bookings yet"}

      </h3>


      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">

        {hasFilters
          ? "Try changing your search or selecting another booking status."
          : "Once you accept a professional's quote and choose an appointment time, your booking will appear here."}

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
          to="/customer/quotes"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)]"
        >

          <span>
            View quotes
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

function BookingsErrorState({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--fixit-error)] shadow-sm">

        <CalendarDays
          size={22}
        />

      </div>


      <h2 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">
        We couldn't load your bookings
      </h2>


      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
        Something went wrong while loading
        your appointments. Please try again.
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
    case "CONFIRMED":
      return {
        container:
          "border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)]",
        dot:
          "bg-[var(--fixit-success)]",
        text:
          "text-[var(--fixit-success)]",
        summaryBackground:
          "bg-[var(--fixit-success-soft)]",
      };

    case "IN_PROGRESS":
      return {
        container:
          "border-[var(--fixit-info)]/20 bg-[var(--fixit-info-soft)]",
        dot:
          "bg-[var(--fixit-info)]",
        text:
          "text-[var(--fixit-info)]",
        summaryBackground:
          "bg-[var(--fixit-info-soft)]",
      };

    case "COMPLETED":
      return {
        container:
          "border-[var(--fixit-primary)]/20 bg-[var(--fixit-primary-soft)]",
        dot:
          "bg-[var(--fixit-primary)]",
        text:
          "text-[var(--fixit-primary)]",
        summaryBackground:
          "bg-[var(--fixit-primary-soft)]",
      };

    case "CANCELLED":
      return {
        container:
          "border-[var(--fixit-border)] bg-[var(--fixit-background)]",
        dot:
          "bg-[var(--fixit-disabled)]",
        text:
          "text-[var(--fixit-text-muted)]",
        summaryBackground:
          "bg-[var(--fixit-background)]",
      };

    default:
      return {
        container:
          "border-[var(--fixit-warning)]/20 bg-[var(--fixit-warning-soft)]",
        dot:
          "bg-[var(--fixit-warning)]",
        text:
          "text-[var(--fixit-warning)]",
        summaryBackground:
          "bg-[var(--fixit-warning-soft)]",
      };
  }
}


/*
|--------------------------------------------------------------------------
| Booking status message
|--------------------------------------------------------------------------
*/

function getBookingStatusMessage(
  status: string,
) {
  switch (status) {
    case "CONFIRMED":
      return "Appointment confirmed";

    case "IN_PROGRESS":
      return "Service in progress";

    case "COMPLETED":
      return "Service completed";

    case "CANCELLED":
      return "Booking cancelled";

    case "PENDING":
      return "Awaiting confirmation";

    default:
      return formatStatus(
        status,
      );
  }
}


/*
|--------------------------------------------------------------------------
| Formatting
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


function formatPrice(
  value: string,
) {
  const numericValue =
    Number(value);


  if (
    Number.isNaN(
      numericValue,
    )
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


/*
|--------------------------------------------------------------------------
| Minimum datetime
|--------------------------------------------------------------------------
*/

function getMinimumDateTime() {
  const now =
    new Date();


  now.setMinutes(
    now.getMinutes() -
      now.getTimezoneOffset(),
  );


  return now
    .toISOString()
    .slice(0, 16);
}


/*
|--------------------------------------------------------------------------
| API error
|--------------------------------------------------------------------------
*/

function getApiErrorMessage(
  error: unknown,
) {
  const apiError =
    error as {
      response?: {
        data?: {
          detail?: string;
        };
      };
    };


  return (
    apiError.response?.data?.detail ??
    "Please try again."
  );
}