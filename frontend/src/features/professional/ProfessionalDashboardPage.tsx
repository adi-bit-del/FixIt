import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  IndianRupee,
  MessageSquareQuote,
  TrendingUp,
} from "lucide-react";

import type { ReactNode } from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  Link,
} from "react-router-dom";
import {
  getProfessionalRequests,
} from "./professionalRequestsApi";

import {
  getProfessionalQuotes,
} from "./professionalQuotesApi";

import {
  getProfessionalBookings,
} from "./professionalBookingsApi";

import professionalGrowthImage from "../../assets/professional-growth.png";


/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

function formatTime(
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


  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
}


function formatDate(
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


  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}


function formatAmount(
  value: string | number,
) {
  const numericValue =
    Number(value);


  if (
    Number.isNaN(
      numericValue,
    )
  ) {
    return String(value);
  }


  return new Intl.NumberFormat(
    "en-IN",
    {
      maximumFractionDigits: 2,
    },
  ).format(
    numericValue,
  );
}


/*
|--------------------------------------------------------------------------
| Professional Dashboard
|--------------------------------------------------------------------------
*/

export default function ProfessionalDashboardPage() {

  /*
  |--------------------------------------------------------------------------
  | Queries
  |--------------------------------------------------------------------------
  */

  const requestsQuery =
    useQuery({
      queryKey: [
        "professional-requests",
      ],
      queryFn:
        getProfessionalRequests,
    });


  const quotesQuery =
    useQuery({
      queryKey: [
        "professional-quotes",
      ],
      queryFn:
        getProfessionalQuotes,
    });


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
  | Data
  |--------------------------------------------------------------------------
  */

  const requests =
    requestsQuery.data ?? [];

  const quotes =
    quotesQuery.data ?? [];

  const bookings =
    bookingsQuery.data ?? [];


  /*
  |--------------------------------------------------------------------------
  | Dashboard calculations
  |--------------------------------------------------------------------------
  */

  const pendingRequests =
    requests.filter(
      (request) =>
        [
          "REQUESTED",
          "PENDING",
        ].includes(
          request.status.toUpperCase(),
        ),
    ).length;


  const activeQuotes =
    quotes.filter(
      (quote) =>
        [
          "PENDING",
          "SENT",
          "ACTIVE",
        ].includes(
          quote.status.toUpperCase(),
        ),
    ).length;


  const completedBookings =
    bookings.filter(
      (booking) =>
        booking.status.toUpperCase() ===
        "COMPLETED",
    );


  const upcomingBookings =
    bookings
      .filter((booking) => {
        const status =
          booking.status.toUpperCase();

        return (
          ![
            "COMPLETED",
            "CANCELLED",
          ].includes(
            status,
          ) &&
          new Date(
            booking.scheduled_at,
          ).getTime() >=
            Date.now()
        );
      })
      .sort(
        (first, second) =>
          new Date(
            first.scheduled_at,
          ).getTime() -
          new Date(
            second.scheduled_at,
          ).getTime(),
      );


  const today =
    new Date();


  const todaysJobs =
    bookings.filter(
      (booking) => {
        const date =
          new Date(
            booking.scheduled_at,
          );

        const status =
          booking.status.toUpperCase();


        return (
          date.getFullYear() ===
            today.getFullYear() &&
          date.getMonth() ===
            today.getMonth() &&
          date.getDate() ===
            today.getDate() &&
          status !==
            "CANCELLED"
        );
      },
    );


  const earnings =
    completedBookings.reduce(
      (
        sum,
        booking,
      ) =>
        sum +
        Number(
          booking.amount || 0,
        ),
      0,
    );


  /*
  |--------------------------------------------------------------------------
  | Stats
  |--------------------------------------------------------------------------
  */

  const stats = [
    {
      label:
        "Pending requests",
      value:
        pendingRequests,
      description:
        "Requests waiting for your response",
      icon:
        ClipboardList,
      tone:
        "primary",
    },
    {
      label:
        "Active quotes",
      value:
        activeQuotes,
      description:
        "Quotes currently in progress",
      icon:
        MessageSquareQuote,
      tone:
        "secondary",
    },
    {
      label:
        "Upcoming bookings",
      value:
        upcomingBookings.length,
      description:
        "Scheduled services ahead",
      icon:
        CalendarDays,
      tone:
        "info",
    },
    {
      label:
        "Completed jobs",
      value:
        completedBookings.length,
      description:
        "Services successfully completed",
      icon:
        CheckCircle2,
      tone:
        "success",
    },
  ] as const;


  /*
  |--------------------------------------------------------------------------
  | Loading / error
  |--------------------------------------------------------------------------
  */

  const isLoading =
    requestsQuery.isLoading ||
    quotesQuery.isLoading ||
    bookingsQuery.isLoading;


  const isError =
    requestsQuery.isError ||
    quotesQuery.isError ||
    bookingsQuery.isError;


  if (isLoading) {
    return (
      <ProfessionalDashboardLoading />
    );
  }


  if (isError) {
    return (
      <ProfessionalDashboardError
        onRetry={() => {
          void requestsQuery.refetch();
          void quotesQuery.refetch();
          void bookingsQuery.refetch();
        }}
      />
    );
  }


  return (
    <div className="space-y-7">


      {/* ================================================================
          HERO
          ================================================================ */}

      <section className="relative overflow-hidden rounded-[30px] bg-[var(--fixit-primary-active)] text-white shadow-lg">

        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[var(--fixit-secondary)] opacity-20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[var(--fixit-primary-hover)] opacity-20 blur-3xl" />


        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">

          {/* Hero copy */}

          <div className="px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">

              <TrendingUp
                size={13}
              />

              Professional workspace

            </div>


            <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">

              Grow your business.
              <span className="block text-[var(--fixit-secondary)]">
                One job at a time.
              </span>

            </h1>


            <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
              Manage customer requests, send
              quotes, track appointments, and keep
              your FixIt business moving forward.
            </p>


            {/* Hero actions */}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

              <Link
  to="/professional/requests"
  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fixit-primary-hover)]"
>
  <ClipboardList size={16} />
  View requests
</Link>


              <Link
                to="/professional/bookings"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
              >

                <CalendarDays
                  size={16}
                />

                View bookings

              </Link>

            </div>

          </div>


          {/* Growth visual */}

          <div className="relative hidden min-h-[300px] overflow-hidden lg:block">

            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[var(--fixit-primary-active)]" />


            <img
              src={
                professionalGrowthImage
              }
              alt="Professional growth illustration"
              className="h-full w-full object-cover object-center opacity-95"
            />

          </div>

        </div>

      </section>


      {/* ================================================================
          STATS
          ================================================================ */}

      <section>

        <div className="mb-4">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
            Your workspace
          </p>


          <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
            At a glance
          </h2>

        </div>


        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map(
            (stat) => {

              const Icon =
                stat.icon;


              const iconBackground =
                stat.tone ===
                "primary"
                  ? "bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]"
                  : stat.tone ===
                      "secondary"
                    ? "bg-[var(--fixit-secondary-soft)] text-[var(--fixit-secondary)]"
                    : stat.tone ===
                        "info"
                      ? "bg-[var(--fixit-info-soft)] text-[var(--fixit-info)]"
                      : "bg-[var(--fixit-success-soft)] text-[var(--fixit-success)]";


              return (
                <div
                  key={
                    stat.label
                  }
                  className="group rounded-[24px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--fixit-primary)]/20 hover:shadow-md"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div
                      className={[
                        "flex h-11 w-11 items-center justify-center rounded-xl",
                        iconBackground,
                      ].join(" ")}
                    >
                      <Icon
                        size={19}
                      />
                    </div>


                    <span className="text-xs font-medium text-[var(--fixit-text-muted)]">
                      Live
                    </span>

                  </div>


                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--fixit-text-muted)]">
                    {stat.label}
                  </p>


                  <p className="mt-1 text-3xl font-bold tracking-[-0.04em] text-[var(--fixit-text-dark)]">
                    {stat.value}
                  </p>


                  <p className="mt-2 text-xs leading-5 text-[var(--fixit-text-muted)]">
                    {stat.description}
                  </p>

                </div>
              );
            },
          )}

        </div>

      </section>


      {/* ================================================================
          MAIN DASHBOARD
          ================================================================ */}

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">


        {/* ============================================================
            UPCOMING JOBS
            ============================================================ */}

        <div className="rounded-[26px] border border-[var(--fixit-border)] bg-white shadow-sm">

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
                Schedule
              </p>


              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
                Upcoming jobs
              </h2>


              <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
                Your next scheduled customer
                appointments.
              </p>

            </div>


            <Link
              to="/professional/bookings"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--fixit-text-dark)] transition hover:border-[var(--fixit-primary)] hover:text-[var(--fixit-primary)]"
            >
              View all
              <CalendarDays
                size={14}
              />
            </Link>

          </div>


          {upcomingBookings.length ===
          0 ? (

            <div className="mx-5 mb-5 rounded-2xl border border-dashed border-[var(--fixit-border)] bg-[var(--fixit-background)] px-6 py-12 text-center sm:mx-6 sm:mb-6">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--fixit-primary)] shadow-sm">

                <CalendarDays
                  size={23}
                />

              </div>


              <h3 className="mt-5 text-base font-semibold text-[var(--fixit-text-dark)]">
                No upcoming jobs
              </h3>


              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
                Confirmed appointments will appear
                here when customers book your
                services.
              </p>


              <Link
  to="/professional/requests"
  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)]"
>
  <ClipboardList size={16} />
  View requests
</Link>

            </div>

          ) : (

            <div className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">

              {upcomingBookings
                .slice(
                  0,
                  5,
                )
                .map(
                  (
                    booking,
                  ) => (

                    <div
                      key={
                        booking.id
                      }
                      className="group rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-4 transition hover:border-[var(--fixit-primary)]/25 hover:bg-white"
                    >

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                        {/* Date */}

                        <div className="flex w-full shrink-0 items-center gap-3 sm:w-28">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--fixit-primary)] shadow-sm">

                            <CalendarDays
                              size={18}
                            />

                          </div>


                          <div>

                            <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                              {formatDate(
                                booking.scheduled_at,
                              )}
                            </p>


                            <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--fixit-text-muted)]">

                              <Clock3
                                size={12}
                              />

                              {formatTime(
                                booking.scheduled_at,
                              )}

                            </p>

                          </div>

                        </div>


                        {/* Job */}

                        <div className="min-w-0 flex-1 sm:border-l sm:border-[var(--fixit-border)] sm:pl-4">

                          <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                            Service #
                            {
                              booking.service_id
                            }
                          </p>


                          <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                            Customer #
                            {
                              booking.customer_profile_id
                            }
                          </p>

                        </div>


                        {/* Amount */}

                        <div className="flex shrink-0 items-center justify-between gap-4 sm:block sm:text-right">

                          <span className="text-xs text-[var(--fixit-text-muted)] sm:hidden">
                            Agreed amount
                          </span>


                          <p className="text-base font-bold text-[var(--fixit-text-dark)]">
                            ₹
                            {formatAmount(
                              booking.amount,
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                  ),
                )}

            </div>

          )}

        </div>


        {/* ============================================================
            PERFORMANCE
            ============================================================ */}

        <div className="rounded-[26px] border border-[var(--fixit-border)] bg-white shadow-sm">

          <div className="p-5 sm:p-6">

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
              Performance
            </p>


            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
              Your activity
            </h2>


            <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
              A quick view of your current
              workload and completed business.
            </p>


            {/* Earnings */}

            <div className="mt-6 rounded-2xl bg-[var(--fixit-primary-soft)] p-4">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--fixit-primary)] shadow-sm">

                    <IndianRupee
                      size={18}
                    />

                  </div>


                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                      Completed booking value
                    </p>


                    <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[var(--fixit-text-dark)]">
                      ₹
                      {formatAmount(
                        earnings,
                      )}
                    </p>

                  </div>

                </div>


                <TrendingUp
                  size={18}
                  className="text-[var(--fixit-primary)]"
                />

              </div>

            </div>


            {/* Activity metrics */}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">

              <ActivityMetric
                label="Today's jobs"
                value={
                  todaysJobs.length
                }
                icon={
                  <CalendarDays
                    size={16}
                  />
                }
                tone="info"
              />


              <ActivityMetric
                label="Total bookings"
                value={
                  bookings.length
                }
                icon={
                  <ClipboardList
                    size={16}
                  />
                }
                tone="primary"
              />


              <ActivityMetric
                label="Completed jobs"
                value={
                  completedBookings.length
                }
                icon={
                  <CheckCircle2
                    size={16}
                  />
                }
                tone="success"
              />

            </div>


            {/* Rating */}

            <div className="mt-4 rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-4">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--fixit-text-muted)] shadow-sm">

                  <CheckCircle2
                    size={16}
                  />

                </div>


                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                    Rating
                  </p>


                  <p className="mt-1 text-base font-semibold text-[var(--fixit-text-dark)]">
                    Not available yet
                  </p>


                  <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                    Rating aggregation is not exposed
                    by the current backend contract.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================================================================
          QUICK ACTIONS
          ================================================================ */}

      <section>

        <div className="mb-4">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
            Quick actions
          </p>


          <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
            Keep business moving
          </h2>

        </div>


        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <QuickAction
            to="/professional/requests"
            icon={
              <ClipboardList
                size={18}
              />
            }
            title="Review requests"
            description="Respond to customers waiting for a professional."
          />


          <QuickAction
            to="/professional/quotes"
            icon={
              <MessageSquareQuote
                size={18}
              />
            }
            title="Manage quotes"
            description="Create and track your service offers."
          />


          <QuickAction
            to="/professional/bookings"
            icon={
              <CalendarDays
                size={18}
              />
            }
            title="Manage bookings"
            description="Stay on top of upcoming customer appointments."
          />


          <QuickAction
            to="/professional/services"
            icon={
              <TrendingUp
                size={18}
              />
            }
            title="Manage services"
            description="Keep your offered services and pricing current."
          />

        </div>

      </section>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Activity Metric
|--------------------------------------------------------------------------
*/

function ActivityMetric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone:
    | "primary"
    | "info"
    | "success";
}) {
  const iconClass =
    tone === "primary"
      ? "bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]"
      : tone === "info"
        ? "bg-[var(--fixit-info-soft)] text-[var(--fixit-info)]"
        : "bg-[var(--fixit-success-soft)] text-[var(--fixit-success)]";


  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--fixit-border)] bg-white px-4 py-3">

      <div className="flex items-center gap-3">

        <div
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            iconClass,
          ].join(" ")}
        >
          {icon}
        </div>


        <p className="text-sm font-medium text-[var(--fixit-text-muted)]">
          {label}
        </p>

      </div>


      <p className="text-xl font-bold text-[var(--fixit-text-dark)]">
        {value}
      </p>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Quick Action
|--------------------------------------------------------------------------
*/

function QuickAction({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-[22px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--fixit-primary)]/30 hover:shadow-md"
    >

      <div className="flex items-center justify-between gap-4">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
          {icon}
        </div>


        <ArrowIndicator />

      </div>


      <h3 className="mt-5 text-sm font-semibold text-[var(--fixit-text-dark)]">
        {title}
      </h3>


      <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
        {description}
      </p>

    </Link>
  );
}


/*
|--------------------------------------------------------------------------
| Arrow Indicator
|--------------------------------------------------------------------------
*/

function ArrowIndicator() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--fixit-background)] text-[var(--fixit-text-muted)] transition group-hover:bg-[var(--fixit-primary-soft)] group-hover:text-[var(--fixit-primary)]">
      →
    </span>
  );
}


/*
|--------------------------------------------------------------------------
| Loading State
|--------------------------------------------------------------------------
*/

function ProfessionalDashboardLoading() {
  return (
    <div className="space-y-7">

      <section className="rounded-[30px] bg-[var(--fixit-primary-active)] px-6 py-10 sm:px-8">

        <div className="animate-pulse">

          <div className="h-7 w-48 rounded-full bg-white/10" />

          <div className="mt-5 h-11 w-3/4 max-w-2xl rounded-xl bg-white/10" />

          <div className="mt-3 h-5 w-1/2 max-w-xl rounded bg-white/10" />

          <div className="mt-7 h-11 w-36 rounded-xl bg-white/10" />

        </div>

      </section>


      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {Array.from({
          length: 4,
        }).map((_, index) => (

          <div
            key={index}
            className="rounded-[24px] border border-[var(--fixit-border)] bg-white p-5"
          >

            <div className="animate-pulse">

              <div className="h-11 w-11 rounded-xl bg-[var(--fixit-background)]" />

              <div className="mt-5 h-3 w-28 rounded bg-[var(--fixit-background)]" />

              <div className="mt-2 h-9 w-16 rounded bg-[var(--fixit-background)]" />

              <div className="mt-2 h-3 w-40 rounded bg-[var(--fixit-background)]" />

            </div>

          </div>

        ))}

      </div>


      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">

        <div className="h-96 rounded-[26px] border border-[var(--fixit-border)] bg-white" />

        <div className="h-96 rounded-[26px] border border-[var(--fixit-border)] bg-white" />

      </div>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Error State
|--------------------------------------------------------------------------
*/

function ProfessionalDashboardError({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--fixit-error)] shadow-sm">

        <ClipboardList
          size={22}
        />

      </div>


      <h2 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">
        We couldn't load your dashboard
      </h2>


      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
        Something went wrong while loading your
        professional activity. Please try again.
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