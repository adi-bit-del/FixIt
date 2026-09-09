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
  CheckCircle2,
  CircleAlert,
  CreditCard,
  FileText,
  LoaderCircle,
  Search,
  ShieldCheck,
  WalletCards,
  XCircle,
} from "lucide-react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  getCustomerPayments,
  makeCustomerPayment,
  type PaymentMethod,
  type PaymentResponse,
} from "./paymentsApi";


/*
|--------------------------------------------------------------------------
| Customer Payments Page
|--------------------------------------------------------------------------
|
| URL:
|
| /customer/payments
|
| Payment flow:
|
| /customer/payments?booking_id=2
|        ↓
| Select payment method
|        ↓
| Select simulation outcome
|        ↓
| Confirm payment
|        ↓
| POST /customer/payments/booking/2
|
|--------------------------------------------------------------------------
*/


const PAYMENT_METHODS = [
  {
    value: "MOCK_CARD",
    label: "Card",
    description:
      "Simulated card payment",
    icon: CreditCard,
  },
  {
    value: "MOCK_UPI",
    label: "UPI",
    description:
      "Simulated UPI payment",
    icon: WalletCards,
  },
  {
    value: "MOCK_CASH",
    label: "Cash",
    description:
      "Simulated cash payment",
    icon: FileText,
  },
] as const;


const STATUS_FILTERS = [
  "ALL",
  "SUCCESS",
  "FAILED",
  "PENDING",
] as const;

type StatusFilter =
  (typeof STATUS_FILTERS)[number];


/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function CustomerPaymentsPage() {
  const queryClient =
    useQueryClient();

  const [searchParams] =
    useSearchParams();


  /*
  |--------------------------------------------------------------------------
  | Booking ID
  |--------------------------------------------------------------------------
  */

  const bookingIdParam =
    searchParams.get(
      "booking_id",
    );

  const bookingId =
    bookingIdParam !== null
      ? Number(bookingIdParam)
      : null;


  const hasValidBookingId =
    Number.isFinite(
      bookingId ?? NaN,
    );


  /*
  |--------------------------------------------------------------------------
  | Local state
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>(
      "MOCK_CARD",
    );

  const [
    simulationResult,
    setSimulationResult,
  ] = useState<
    "SUCCESS" | "FAILED"
  >("SUCCESS");


  /*
  |--------------------------------------------------------------------------
  | Payments query
  |--------------------------------------------------------------------------
  */

  const paymentsQuery =
    useQuery<PaymentResponse[]>({
      queryKey: [
        "customer",
        "payments",
      ],
      queryFn:
        getCustomerPayments,
    });


  const payments =
    paymentsQuery.data ?? [];


  /*
  |--------------------------------------------------------------------------
  | Filter + sort payments
  |--------------------------------------------------------------------------
  */

  const filteredPayments =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();


      return [...payments]
        .sort(
          (first, second) =>
            second.id -
            first.id,
        )
        .filter((payment) => {

          /*
          |--------------------------------------------------------------------------
          | Status filter
          |--------------------------------------------------------------------------
          */

          if (
            statusFilter !== "ALL" &&
            payment.status !==
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
            normalizedSearch.length ===
            0
          ) {
            return true;
          }


          const searchableText = [
            `payment ${payment.id}`,
            `booking ${payment.booking_id}`,
            payment.amount,
            payment.payment_method,
            payment.transaction_reference,
            payment.status,
          ]
            .join(" ")
            .toLowerCase();


          return searchableText.includes(
            normalizedSearch,
          );
        });
    }, [
      payments,
      search,
      statusFilter,
    ]);


  /*
  |--------------------------------------------------------------------------
  | Make payment mutation
  |--------------------------------------------------------------------------
  */

  const paymentMutation =
    useMutation<
      PaymentResponse,
      Error,
      {
        bookingId: number;
        paymentMethod: PaymentMethod;
        simulateResult:
          | "SUCCESS"
          | "FAILED";
      }
    >({
      mutationFn: ({
        bookingId:
          selectedBookingId,
        paymentMethod:
          selectedPaymentMethod,
        simulateResult:
          selectedSimulationResult,
      }) =>
        makeCustomerPayment(
          selectedBookingId,
          {
            payment_method:
              selectedPaymentMethod,
            simulate_result:
              selectedSimulationResult,
          },
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "customer",
            "payments",
          ],
        });

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

        queryClient.invalidateQueries({
          queryKey: [
            "customer",
            "requests",
          ],
        });
      },
    });


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (
    paymentsQuery.isLoading
  ) {
    return (
      <PaymentsLoadingState />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (
    paymentsQuery.isError
  ) {
    return (
      <PaymentsErrorState
        onRetry={() =>
          paymentsQuery.refetch()
        }
      />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Make payment
  |--------------------------------------------------------------------------
  */

  function handlePayment() {
    if (
      bookingId === null ||
      !Number.isFinite(
        bookingId,
      )
    ) {
      return;
    }


    paymentMutation.mutate({
      bookingId,
      paymentMethod,
      simulateResult:
        simulationResult,
    });
  }


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

            <CreditCard
              size={13}
            />

            <span>
              Payments
            </span>

          </div>


          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            Payments, kept simple.
            <span className="block text-[var(--fixit-secondary)]">
              Track every transaction.
            </span>
          </h1>


          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
            Complete payments for your FixIt
            bookings and keep a clear history of
            every transaction.
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
              placeholder="Search by payment, booking, method or transaction..."
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
          PAYMENT FORM
          ================================================================ */}

      {hasValidBookingId && (

        <PaymentFormCard
          bookingId={
            bookingId as number
          }
          paymentMethod={
            paymentMethod
          }
          simulationResult={
            simulationResult
          }
          isProcessing={
            paymentMutation.isPending
          }
          payment={
            paymentMutation.data ??
            null
          }
          error={
            paymentMutation.error
          }
          onPaymentMethodChange={
            setPaymentMethod
          }
          onSimulationChange={
            setSimulationResult
          }
          onSubmit={
            handlePayment
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
                      ? "All payments"
                      : formatStatus(
                          status,
                        )}
                  </button>
                );
              },
            )}

          </div>


          <Link
            to="/customer/bookings"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--fixit-text-dark)] transition hover:border-[var(--fixit-primary)] hover:text-[var(--fixit-primary)]"
          >

            <span>
              View bookings
            </span>

            <ArrowRight
              size={15}
              className="shrink-0"
            />

          </Link>

        </div>

      </section>


      {/* ================================================================
          PAYMENT HISTORY
          ================================================================ */}

      <section>

        <div className="mb-5">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
            Payment history
          </p>


          <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">

            <h2 className="text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
              {filteredPayments.length}{" "}
              {filteredPayments.length ===
              1
                ? "payment"
                : "payments"}
            </h2>


            {payments.length > 0 && (

              <p className="text-xs text-[var(--fixit-text-muted)]">
                Newest transactions appear first
              </p>

            )}

          </div>

        </div>


        {filteredPayments.length ===
        0 ? (

          <PaymentsEmptyState
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

            {filteredPayments.map(
              (payment) => (

                <PaymentCard
                  key={
                    payment.id
                  }
                  payment={
                    payment
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
| Payment Form Card
|--------------------------------------------------------------------------
*/

function PaymentFormCard({
  bookingId,
  paymentMethod,
  simulationResult,
  isProcessing,
  payment,
  error,
  onPaymentMethodChange,
  onSimulationChange,
  onSubmit,
}: {
  bookingId: number;
  paymentMethod: PaymentMethod;
  simulationResult:
    | "SUCCESS"
    | "FAILED";
  isProcessing: boolean;
  payment: PaymentResponse | null;
  error: Error | null;
  onPaymentMethodChange: (
    method: PaymentMethod,
  ) => void;
  onSimulationChange: (
    result:
      | "SUCCESS"
      | "FAILED",
  ) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-[var(--fixit-border)] bg-white shadow-sm">

      {/* Accent */}

      <div className="h-1 bg-gradient-to-r from-[var(--fixit-primary)] via-[var(--fixit-primary-hover)] to-[var(--fixit-secondary)]" />


      <div className="p-5 sm:p-6 lg:p-7">


        {/* ============================================================
            HEADER
            ============================================================ */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--fixit-primary)]/15 bg-[var(--fixit-primary-soft)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-primary)]">

              <CreditCard
                size={12}
              />

              Payment

            </div>


            <h2 className="mt-3 text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
              Complete booking #{bookingId}
            </h2>


            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)]">
              Choose your payment method and
              confirm the transaction for this
              booking.
            </p>

          </div>


          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">

            <WalletCards
              size={21}
            />

          </div>

        </div>


        {/* ============================================================
            PAYMENT METHOD
            ============================================================ */}

        <div className="mt-7">

          <p className="mb-3 text-sm font-semibold text-[var(--fixit-text-dark)]">
            Payment method
          </p>


          <div className="grid gap-3 sm:grid-cols-3">

            {PAYMENT_METHODS.map(
              (method) => {

                const Icon =
                  method.icon;

                const selected =
                  paymentMethod ===
                  method.value;

                return (
                  <button
                    key={
                      method.value
                    }
                    type="button"
                    onClick={() =>
                      onPaymentMethodChange(
                        method.value,
                      )
                    }
                    className={[
                      "flex min-w-0 items-start gap-3 rounded-2xl border p-4 text-left transition",
                      selected
                        ? "border-[var(--fixit-primary)] bg-[var(--fixit-primary-soft)] shadow-sm"
                        : "border-[var(--fixit-border)] bg-white hover:border-[var(--fixit-primary)]/40 hover:bg-[var(--fixit-background)]",
                    ].join(" ")}
                  >

                    <div
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        selected
                          ? "bg-[var(--fixit-primary)] text-white"
                          : "bg-[var(--fixit-background)] text-[var(--fixit-text-muted)]",
                      ].join(" ")}
                    >

                      <Icon
                        size={17}
                      />

                    </div>


                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                          {method.label}
                        </p>


                        {selected && (
                          <CheckCircle2
                            size={14}
                            className="shrink-0 text-[var(--fixit-primary)]"
                          />
                        )}

                      </div>


                      <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                        {
                          method.description
                        }
                      </p>

                    </div>

                  </button>
                );
              },
            )}

          </div>

        </div>


        {/* ============================================================
            SIMULATION RESULT
            ============================================================ */}

        <div className="mt-7 rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-4 sm:p-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                Simulation result
              </p>


              <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                This environment lets you test
                both successful and failed payment
                responses.
              </p>

            </div>


            <div className="flex gap-2">

              <button
                type="button"
                onClick={() =>
                  onSimulationChange(
                    "SUCCESS",
                  )
                }
                className={[
                  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold transition",
                  simulationResult ===
                  "SUCCESS"
                    ? "border-[var(--fixit-success)] bg-[var(--fixit-success)] text-white"
                    : "border-[var(--fixit-border)] bg-white text-[var(--fixit-text-muted)] hover:border-[var(--fixit-success)] hover:text-[var(--fixit-success)]",
                ].join(" ")}
              >

                <CheckCircle2
                  size={14}
                />

                Success

              </button>


              <button
                type="button"
                onClick={() =>
                  onSimulationChange(
                    "FAILED",
                  )
                }
                className={[
                  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold transition",
                  simulationResult ===
                  "FAILED"
                    ? "border-[var(--fixit-error)] bg-[var(--fixit-error)] text-white"
                    : "border-[var(--fixit-border)] bg-white text-[var(--fixit-text-muted)] hover:border-[var(--fixit-error)] hover:text-[var(--fixit-error)]",
                ].join(" ")}
              >

                <XCircle
                  size={14}
                />

                Failed

              </button>

            </div>

          </div>

        </div>


        {/* ============================================================
            ACTION
            ============================================================ */}

        <div className="mt-6 border-t border-[var(--fixit-border)] pt-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-2 text-xs leading-5 text-[var(--fixit-text-muted)]">

              <ShieldCheck
                size={15}
                className="mt-0.5 shrink-0 text-[var(--fixit-success)]"
              />

              <span>
                This is a simulated payment flow
                for the FixIt development
                environment. No real card or UPI
                transaction is performed.
              </span>

            </div>


            <button
              type="button"
              disabled={
                isProcessing
              }
              onClick={onSubmit}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
            >

              {isProcessing ? (

                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin text-white"
                  />

                  <span>
                    Processing...
                  </span>
                </>

              ) : (

                <>
                  <CreditCard
                    size={17}
                    className="text-white"
                  />

                  <span>
                    Make payment
                  </span>
                </>

              )}

            </button>

          </div>


          {/* ==========================================================
              RESULT
              ========================================================== */}

          {payment && (

            <PaymentSuccessMessage
              payment={
                payment
              }
            />

          )}


          {error && (

            <div className="mt-4 rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-4 py-4">

              <div className="flex items-start gap-3">

                <CircleAlert
                  size={18}
                  className="mt-0.5 shrink-0 text-[var(--fixit-error)]"
                />


                <div>

                  <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                    Payment could not be
                    completed.
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

        </div>

      </div>

    </section>
  );
}


/*
|--------------------------------------------------------------------------
| Payment Card
|--------------------------------------------------------------------------
*/

function PaymentCard({
  payment,
}: {
  payment: PaymentResponse;
}) {
  const isSuccess =
    payment.status ===
    "SUCCESS";


  return (
    <article className="group rounded-[26px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--fixit-primary)]/30 hover:shadow-lg sm:p-6">

      <div className="flex flex-col">


        {/* ============================================================
            HEADER
            ============================================================ */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div className="flex min-w-0 gap-4">

            <div
              className={[
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                isSuccess
                  ? "bg-[var(--fixit-success-soft)] text-[var(--fixit-success)]"
                  : "bg-[var(--fixit-background)] text-[var(--fixit-text-muted)]",
              ].join(" ")}
            >

              <CreditCard
                size={20}
              />

            </div>


            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h3 className="text-base font-semibold text-[var(--fixit-text-dark)]">
                  Payment #{payment.id}
                </h3>


                <PaymentStatus
                  status={
                    payment.status
                  }
                />

              </div>


              <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                Booking #
                {payment.booking_id}
              </p>

            </div>

          </div>


          <p className="text-xl font-bold tracking-[-0.02em] text-[var(--fixit-text-dark)]">
            ₹
            {formatPrice(
              payment.amount,
            )}
          </p>

        </div>


        {/* ============================================================
            INFORMATION
            ============================================================ */}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">

          <PaymentInfo
            icon={
              <CreditCard
                size={16}
              />
            }
            label="Payment method"
            value={formatPaymentMethod(
              payment.payment_method,
            )}
          />


          <PaymentInfo
            icon={
              <FileText
                size={16}
              />
            }
            label="Transaction reference"
            value={
              payment.transaction_reference
            }
          />

        </div>


        {/* ============================================================
            FOOTER
            ============================================================ */}

        <div className="mt-4 flex flex-col gap-3 border-t border-[var(--fixit-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2 text-xs text-[var(--fixit-text-muted)]">

            {isSuccess ? (

              <CheckCircle2
                size={15}
                className="text-[var(--fixit-success)]"
              />

            ) : (

              <CircleAlert
                size={15}
                className="text-[var(--fixit-text-muted)]"
              />

            )}


            <span>
              {isSuccess
                ? "Payment completed successfully."
                : `Payment status: ${formatStatus(
                    payment.status,
                  )}.`}
            </span>

          </div>


          <Link
            to="/customer/bookings"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--fixit-text-dark)] transition hover:border-[var(--fixit-primary)] hover:text-[var(--fixit-primary)] sm:w-auto"
          >

            <span>
              View booking
            </span>

            <ArrowRight
              size={14}
            />

          </Link>

        </div>

      </div>

    </article>
  );
}


/*
|--------------------------------------------------------------------------
| Payment information
|--------------------------------------------------------------------------
*/

function PaymentInfo({
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
| Payment success
|--------------------------------------------------------------------------
*/

function PaymentSuccessMessage({
  payment,
}: {
  payment: PaymentResponse;
}) {
  const succeeded =
    payment.status ===
    "SUCCESS";


  if (!succeeded) {
    return (
      <div className="mt-4 rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-4 py-4">

        <div className="flex items-start gap-3">

          <XCircle
            size={19}
            className="mt-0.5 shrink-0 text-[var(--fixit-error)]"
          />


          <div className="min-w-0">

            <p className="text-sm font-semibold text-[var(--fixit-error)]">
              Payment failed
            </p>


            <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
              Payment #{payment.id} was
              processed as a failed transaction.
            </p>


            <p className="mt-2 break-all text-xs font-medium text-[var(--fixit-text-dark)]">
              Transaction:{" "}
              {
                payment.transaction_reference
              }
            </p>

          </div>

        </div>

      </div>
    );
  }


  return (
    <div className="mt-4 rounded-2xl border border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] px-4 py-4">

      <div className="flex items-start gap-3">

        <CheckCircle2
          size={19}
          className="mt-0.5 shrink-0 text-[var(--fixit-success)]"
        />


        <div className="min-w-0">

          <p className="text-sm font-semibold text-[var(--fixit-success)]">
            Payment successful
          </p>


          <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
            Payment #{payment.id} was
            processed successfully.
          </p>


          <p className="mt-2 break-all text-xs font-medium text-[var(--fixit-text-dark)]">
            Transaction:{" "}
            {
              payment.transaction_reference
            }
          </p>

        </div>

      </div>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Payment status
|--------------------------------------------------------------------------
*/

function PaymentStatus({
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


/*
|--------------------------------------------------------------------------
| Loading
|--------------------------------------------------------------------------
*/

function PaymentsLoadingState() {
  return (
    <div className="space-y-7">

      <section className="rounded-[28px] bg-[var(--fixit-primary-active)] px-6 py-10 sm:px-8 lg:px-10">

        <div className="animate-pulse">

          <div className="h-7 w-24 rounded-full bg-white/10" />

          <div className="mt-5 h-10 w-3/4 max-w-2xl rounded-xl bg-white/10" />

          <div className="mt-3 h-5 w-1/2 max-w-xl rounded bg-white/10" />

          <div className="mt-7 h-14 w-full max-w-2xl rounded-2xl bg-white/10" />

        </div>

      </section>


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

                  <div className="h-5 w-36 rounded bg-[var(--fixit-background)]" />

                  <div className="mt-3 h-3 w-28 rounded bg-[var(--fixit-background)]" />

                </div>

              </div>


              <div className="mt-6 grid gap-3 sm:grid-cols-2">

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
| Empty
|--------------------------------------------------------------------------
*/

function PaymentsEmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-dashed border-[var(--fixit-border)] bg-white px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">

        <CreditCard
          size={23}
        />

      </div>


      <h3 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">

        {hasFilters
          ? "No matching payments"
          : "No payments yet"}

      </h3>


      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">

        {hasFilters
          ? "Try changing your search or selecting another payment status."
          : "Once you complete a payment for a FixIt booking, the transaction will appear here."}

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
          to="/customer/bookings"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)]"
        >

          <span>
            View bookings
          </span>

          <ArrowRight
            size={15}
          />

        </Link>

      )}

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Error
|--------------------------------------------------------------------------
*/

function PaymentsErrorState({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--fixit-error)] shadow-sm">

        <CreditCard
          size={22}
        />

      </div>


      <h2 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">
        We couldn't load your payments
      </h2>


      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
        Something went wrong while loading
        your payment history. Please try again.
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
    case "SUCCESS":
      return {
        container:
          "border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)]",
        dot:
          "bg-[var(--fixit-success)]",
        text:
          "text-[var(--fixit-success)]",
      };

    case "FAILED":
      return {
        container:
          "border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)]",
        dot:
          "bg-[var(--fixit-error)]",
        text:
          "text-[var(--fixit-error)]",
      };

    case "PENDING":
      return {
        container:
          "border-[var(--fixit-warning)]/20 bg-[var(--fixit-warning-soft)]",
        dot:
          "bg-[var(--fixit-warning)]",
        text:
          "text-[var(--fixit-warning)]",
      };

    default:
      return {
        container:
          "border-[var(--fixit-border)] bg-[var(--fixit-background)]",
        dot:
          "bg-[var(--fixit-disabled)]",
        text:
          "text-[var(--fixit-text-muted)]",
      };
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


function formatPaymentMethod(
  method: string,
) {
  switch (method) {
    case "MOCK_CARD":
      return "Mock card";

    case "MOCK_UPI":
      return "Mock UPI";

    case "MOCK_CASH":
      return "Mock cash";

    default:
      return formatStatus(
        method,
      );
  }
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