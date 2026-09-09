import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  FileText,
  MessageSquareText,
  ShieldCheck,
  Users,
  UsersRound,
  Wrench,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import {
  getAdminBookings,
  getAdminCategories,
  getAdminCustomers,
  getAdminPayments,
  getAdminProfessionals,
  getAdminQuotes,
  getAdminRequests,
  getAdminReviews,
  getAdminServices,
} from "./adminApi";

import emptyVerificationImage from "../../assets/empty-verification.png";

function statusClass(status: string) {
  const value = status.toUpperCase();

  if (value === "VERIFIED") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (value === "REJECTED") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: string;
          };
        };
      }
    ).response;

    if (response?.data?.detail) {
      return response.data.detail;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while loading the dashboard.";
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function AdminDashboardPage() {
  const professionalsQuery = useQuery({
    queryKey: ["admin-professionals"],
    queryFn: getAdminProfessionals,
  });

  const customersQuery = useQuery({
    queryKey: ["admin-customers"],
    queryFn: getAdminCustomers,
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAdminCategories,
  });

  const servicesQuery = useQuery({
    queryKey: ["admin-services"],
    queryFn: getAdminServices,
  });

  const requestsQuery = useQuery({
    queryKey: ["admin-requests"],
    queryFn: getAdminRequests,
  });

  const quotesQuery = useQuery({
    queryKey: ["admin-quotes"],
    queryFn: getAdminQuotes,
  });

  const bookingsQuery = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: getAdminBookings,
  });

  const paymentsQuery = useQuery({
    queryKey: ["admin-payments"],
    queryFn: getAdminPayments,
  });

  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: getAdminReviews,
  });

  const professionals = professionalsQuery.data ?? [];
  const customers = customersQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const services = servicesQuery.data ?? [];
  const requests = requestsQuery.data ?? [];
  const quotes = quotesQuery.data ?? [];
  const bookings = bookingsQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];

  const queries = [
    professionalsQuery,
    customersQuery,
    categoriesQuery,
    servicesQuery,
    requestsQuery,
    quotesQuery,
    bookingsQuery,
    paymentsQuery,
    reviewsQuery,
  ];

  const loading = queries.some((query) => query.isLoading);
  const hasError = queries.some((query) => query.isError);

  const firstErrorQuery = queries.find(
    (query) => query.isError,
  );

  const pendingProfessionals = professionals.filter(
    (professional) =>
      professional.verification_status.toUpperCase() === "PENDING",
  );

  const verifiedProfessionals = professionals.filter(
    (professional) =>
      professional.verification_status.toUpperCase() === "VERIFIED",
  );

  const rejectedProfessionals = professionals.filter(
    (professional) =>
      professional.verification_status.toUpperCase() === "REJECTED",
  );

  const activeCategories = categories.filter(
    (category) => category.is_active,
  );

  const activeServices = services.filter(
    (service) => service.is_active,
  );

  const inactiveServices = services.filter(
    (service) => !service.is_active,
  );

  const pendingRequests = requests.filter(
    (request) => request.status === "PENDING",
  );

  const acceptedRequests = requests.filter(
    (request) => request.status === "ACCEPTED",
  );

  const pendingQuotes = quotes.filter(
    (quote) => quote.status === "PENDING",
  );

  const acceptedQuotes = quotes.filter(
    (quote) => quote.status === "ACCEPTED",
  );

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "CONFIRMED",
  );

  const inProgressBookings = bookings.filter(
    (booking) => booking.status === "IN_PROGRESS",
  );

  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  );

  const successfulPayments = payments.filter(
    (payment) => payment.status === "SUCCESS",
  );

  const failedPayments = payments.filter(
    (payment) => payment.status === "FAILED",
  );

  const successfulPaymentValue = successfulPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );

  const stats = [
    {
      label: "Professionals",
      value: professionals.length,
      description: `${verifiedProfessionals.length} verified`,
      icon: Users,
      to: "/admin/professionals",
    },
    {
      label: "Customers",
      value: customers.length,
      description: "Registered customers",
      icon: UsersRound,
      to: "/admin/customers",
    },
    {
      label: "Requests",
      value: requests.length,
      description: `${pendingRequests.length} pending`,
      icon: ClipboardList,
      to: "/admin/requests",
    },
    {
      label: "Bookings",
      value: bookings.length,
      description: `${completedBookings.length} completed`,
      icon: BarChart3,
      to: "/admin/bookings",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page header */}

      <header className="mb-8">
        <p className="text-sm font-medium text-[var(--fixit-primary)]">
          Admin Console
        </p>

        <div className="mt-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--fixit-text)] sm:text-3xl">
            Platform Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)] sm:text-base">
            Monitor marketplace activity, trust signals, service
            operations, and payment health from one place.
          </p>
        </div>
      </header>

      {/* Dashboard error */}

      {hasError && (
        <div className="mb-6 rounded-2xl border border-[var(--fixit-error)]/20 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--fixit-danger)]" />

            <div>
              <p className="font-semibold text-[var(--fixit-danger)]">
                Some dashboard data could not be loaded.
              </p>

              <p className="mt-1 text-sm text-red-700">
                {firstErrorQuery
                  ? getErrorMessage(firstErrorQuery.error)
                  : "Please refresh and try again."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI cards */}

      <section
        aria-label="Platform statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.label}
              to={stat.to}
              className="group rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--fixit-primary)]/20 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)]">
                  <Icon className="h-5 w-5 text-[var(--fixit-primary)]" />
                </div>

                <ArrowRight className="h-4 w-4 text-[var(--fixit-disabled)] transition group-hover:translate-x-0.5 group-hover:text-[var(--fixit-primary)]" />
              </div>

              <p className="mt-5 text-sm font-medium text-[var(--fixit-text-muted)]">
                {stat.label}
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-[var(--fixit-text)]">
                {loading ? "—" : stat.value}
              </p>

              <p className="mt-2 text-xs text-[var(--fixit-text-muted)]">
                {loading ? "Loading..." : stat.description}
              </p>
            </Link>
          );
        })}
      </section>

      {/* Operations overview */}

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <OverviewCard
          title="Requests"
          icon={ClipboardList}
          to="/admin/requests"
          items={[
            {
              label: "Pending",
              value: pendingRequests.length,
            },
            {
              label: "Accepted",
              value: acceptedRequests.length,
            },
            {
              label: "Total",
              value: requests.length,
            },
          ]}
          loading={loading}
        />

        <OverviewCard
          title="Quotes"
          icon={FileText}
          to="/admin/quotes"
          items={[
            {
              label: "Pending",
              value: pendingQuotes.length,
            },
            {
              label: "Accepted",
              value: acceptedQuotes.length,
            },
            {
              label: "Total",
              value: quotes.length,
            },
          ]}
          loading={loading}
        />

        <OverviewCard
          title="Bookings"
          icon={BarChart3}
          to="/admin/bookings"
          items={[
            {
              label: "Confirmed",
              value: confirmedBookings.length,
            },
            {
              label: "In progress",
              value: inProgressBookings.length,
            },
            {
              label: "Completed",
              value: completedBookings.length,
            },
          ]}
          loading={loading}
        />
      </section>

      {/* Verification + Payments */}

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        {/* Verification */}

        <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)]">
                  <ShieldCheck className="h-4 w-4 text-[var(--fixit-primary)]" />
                </div>

                <h2 className="text-lg font-semibold text-[var(--fixit-text)]">
                  Verification queue
                </h2>
              </div>

              <p className="mt-2 text-sm text-[var(--fixit-text-muted)]">
                Review professionals awaiting platform approval.
              </p>
            </div>

            <Link
              to="/admin/professionals"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--fixit-primary)] transition hover:text-[var(--fixit-primary-hover)]"
            >
              View professionals
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 rounded-2xl bg-[var(--fixit-background)] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-3xl font-bold tracking-tight text-[var(--fixit-text)]">
                  {loading ? "—" : pendingProfessionals.length}
                </p>

                <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
                  Professionals pending verification
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  {loading ? "—" : verifiedProfessionals.length} verified
                </span>

                <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                  {loading ? "—" : rejectedProfessionals.length} rejected
                </span>
              </div>
            </div>
          </div>

          {!loading && pendingProfessionals.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-[var(--fixit-border)] bg-white px-6 py-8 text-center">
              <img
                src={emptyVerificationImage}
                alt=""
                aria-hidden="true"
                className="mx-auto h-32 w-auto object-contain"
              />

              <p className="mt-4 font-semibold text-[var(--fixit-text)]">
                All caught up
              </p>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
                There are no professionals waiting for verification
                right now.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {pendingProfessionals
                .slice(0, 5)
                .map((professional) => (
                  <div
                    key={professional.id}
                    className="flex flex-col gap-4 rounded-xl border border-[var(--fixit-border)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {professional.profile_image_url ? (
                        <img
                          src={professional.profile_image_url}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-[var(--fixit-border)]"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)]">
                          <Users className="h-5 w-5 text-[var(--fixit-primary)]" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--fixit-text)]">
                          {professional.business_name}
                        </p>

                        <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
                          {professional.experience_years} years
                          experience
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                          professional.verification_status,
                        )}`}
                      >
                        {professional.verification_status}
                      </span>

                      <Link
                        to="/admin/professionals"
                        className="rounded-lg border border-[var(--fixit-border)] px-3 py-2 text-xs font-semibold text-[var(--fixit-text)] transition hover:border-[var(--fixit-primary-ring)] hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)]"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}

              {pendingProfessionals.length > 5 && (
                <Link
                  to="/admin/professionals"
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--fixit-border)] px-4 py-3 text-sm font-semibold text-[var(--fixit-primary)] transition hover:bg-[var(--fixit-primary-soft)]"
                >
                  View all pending professionals
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Payments */}

        <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--fixit-text)]">
                Payment health
              </h2>

              <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
                Current transaction overview.
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)]">
              <CircleDollarSign className="h-4 w-4 text-[var(--fixit-primary)]" />
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[var(--fixit-background)] p-5">
            <p className="text-sm text-[var(--fixit-text-muted)]">
              Successful payment value
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--fixit-text)]">
              {loading
                ? "—"
                : formatAmount(successfulPaymentValue)}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              to="/admin/payments"
              className="rounded-xl border border-[var(--fixit-border)] p-4 transition hover:border-[var(--fixit-primary-ring)] hover:bg-[var(--fixit-primary-soft)]"
            >
              <p className="text-xs font-medium text-[var(--fixit-text-muted)]">
                Successful
              </p>

              <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
                {loading ? "—" : successfulPayments.length}
              </p>
            </Link>

            <Link
              to="/admin/payments"
              className="rounded-xl border border-[var(--fixit-border)] p-4 transition hover:border-red-200 hover:bg-red-50"
            >
              <p className="text-xs font-medium text-[var(--fixit-text-muted)]">
                Failed
              </p>

              <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
                {loading ? "—" : failedPayments.length}
              </p>
            </Link>
          </div>

          <Link
            to="/admin/payments"
            className="mt-4 flex items-center justify-between rounded-xl border border-transparent bg-white p-3 text-sm font-semibold text-[var(--fixit-primary)] transition hover:bg-[var(--fixit-primary-soft)]"
          >
            Open payment activity
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Catalog + Trust */}

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Catalog */}

        <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--fixit-text)]">
                Catalog health
              </h2>

              <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
                Current service catalog status.
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)]">
              <CheckCircle2 className="h-4 w-4 text-[var(--fixit-primary)]" />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link
              to="/admin/categories"
              className="rounded-xl bg-[var(--fixit-background)] p-4 transition hover:bg-[var(--fixit-primary-soft)]"
            >
              <p className="text-sm text-[var(--fixit-text-muted)]">
                Active categories
              </p>

              <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
                {loading ? "—" : activeCategories.length}
              </p>
            </Link>

            <Link
              to="/admin/services"
              className="rounded-xl bg-[var(--fixit-background)] p-4 transition hover:bg-[var(--fixit-primary-soft)]"
            >
              <p className="text-sm text-[var(--fixit-text-muted)]">
                Active services
              </p>

              <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
                {loading ? "—" : activeServices.length}
              </p>
            </Link>

            <Link
              to="/admin/services"
              className="rounded-xl bg-[var(--fixit-background)] p-4 transition hover:bg-[var(--fixit-primary-soft)]"
            >
              <p className="text-sm text-[var(--fixit-text-muted)]">
                Inactive services
              </p>

              <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
                {loading ? "—" : inactiveServices.length}
              </p>
            </Link>
          </div>

          <div className="mt-5 rounded-xl border border-[var(--fixit-border)] bg-white p-4">
            <div className="flex items-start gap-3">
              <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-[var(--fixit-primary)]" />

              <div>
                <p className="text-sm font-semibold text-[var(--fixit-text)]">
                  Marketplace catalog
                </p>

                <p className="mt-1 text-sm leading-5 text-[var(--fixit-text-muted)]">
                  {loading
                    ? "Checking catalog status..."
                    : `${activeCategories.length} active categories and ${activeServices.length} active services are currently available.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust */}

        <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--fixit-text)]">
                Trust & moderation
              </h2>

              <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
                Platform health across verification and reviews.
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)]">
              <MessageSquareText className="h-4 w-4 text-[var(--fixit-primary)]" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              to="/admin/professionals"
              className="rounded-xl border border-[var(--fixit-border)] p-4 transition hover:bg-[var(--fixit-primary-soft)]"
            >
              <p className="text-xs text-[var(--fixit-text-muted)]">
                Pending verification
              </p>

              <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
                {loading ? "—" : pendingProfessionals.length}
              </p>
            </Link>

            <Link
              to="/admin/reviews"
              className="rounded-xl border border-[var(--fixit-border)] p-4 transition hover:bg-[var(--fixit-primary-soft)]"
            >
              <p className="text-xs text-[var(--fixit-text-muted)]">
                Reviews
              </p>

              <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
                {loading ? "—" : reviews.length}
              </p>
            </Link>
          </div>

          <div className="mt-5 rounded-xl border border-[var(--fixit-border)] bg-white p-4">
            <p className="text-sm font-semibold text-[var(--fixit-text)]">
              Professional verification
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                {loading ? "—" : pendingProfessionals.length} pending
              </span>

              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                {loading ? "—" : verifiedProfessionals.length} verified
              </span>

              <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                {loading ? "—" : rejectedProfessionals.length} rejected
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace funnel */}

      <section className="mt-6 rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-[var(--fixit-text)]">
            Marketplace funnel
          </h2>

          <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
            A high-level view of activity moving through the
            FixIt marketplace.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <FunnelStep
            label="Requests"
            value={requests.length}
            to="/admin/requests"
            loading={loading}
          />

          <FunnelStep
            label="Quotes"
            value={quotes.length}
            to="/admin/quotes"
            loading={loading}
          />

          <FunnelStep
            label="Bookings"
            value={bookings.length}
            to="/admin/bookings"
            loading={loading}
          />

          <FunnelStep
            label="Successful payments"
            value={successfulPayments.length}
            to="/admin/payments"
            loading={loading}
          />
        </div>
      </section>

      {/* Quick actions */}

      <section className="mt-6 rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-[var(--fixit-text)]">
            Quick actions
          </h2>

          <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
            Jump directly into the areas you manage most often.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            icon={Users}
            label="Manage professionals"
            to="/admin/professionals"
          />

          <QuickAction
            icon={ClipboardList}
            label="Review requests"
            to="/admin/requests"
          />

          <QuickAction
            icon={CircleDollarSign}
            label="View payments"
            to="/admin/payments"
          />

          <QuickAction
            icon={MessageSquareText}
            label="Moderate reviews"
            to="/admin/reviews"
          />
        </div>
      </section>
    </div>
  );
}

function OverviewCard({
  title,
  icon: Icon,
  to,
  items,
  loading,
}: {
  title: string;
  icon: typeof ClipboardList;
  to: string;
  items: Array<{
    label: string;
    value: number;
  }>;
  loading: boolean;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--fixit-primary)]/20 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)]">
            <Icon className="h-5 w-5 text-[var(--fixit-primary)]" />
          </div>

          <h2 className="font-semibold text-[var(--fixit-text)]">
            {title}
          </h2>
        </div>

        <ArrowRight className="h-4 w-4 text-[var(--fixit-disabled)]" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-xs text-[var(--fixit-text-muted)]">
              {item.label}
            </p>

            <p className="mt-1 text-xl font-bold text-[var(--fixit-text)]">
              {loading ? "—" : item.value}
            </p>
          </div>
        ))}
      </div>
    </Link>
  );
}

function FunnelStep({
  label,
  value,
  to,
  loading,
}: {
  label: string;
  value: number;
  to: string;
  loading: boolean;
}) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-4 transition hover:border-[var(--fixit-primary-ring)] hover:bg-[var(--fixit-primary-soft)]"
    >
      <p className="text-xs font-medium text-[var(--fixit-text-muted)]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--fixit-text)]">
        {loading ? "—" : value}
      </p>
    </Link>
  );
}

function QuickAction({
  icon: Icon,
  label,
  to,
}: {
  icon: typeof Users;
  label: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border border-[var(--fixit-border)] p-4 transition hover:border-[var(--fixit-primary-ring)] hover:bg-[var(--fixit-primary-soft)]"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-[var(--fixit-primary)]" />

        <span className="text-sm font-semibold text-[var(--fixit-text)]">
          {label}
        </span>
      </div>

      <ArrowRight className="h-4 w-4 text-[var(--fixit-disabled)] transition group-hover:translate-x-0.5 group-hover:text-[var(--fixit-primary)]" />
    </Link>
  );
}