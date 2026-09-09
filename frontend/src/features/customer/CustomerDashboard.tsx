import type { ReactNode } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getCustomerBookings,
  getCustomerQuotes,
  getCustomerRequests,
} from "./customerApi";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

import heroProfessional from "../../assets/hero-professional.png";
import findProfessional from "../../assets/find-professional.png";
import howFixitWorks from "../../assets/how-fixit-works.png";
import trustedProfessional from "../../assets/trusted-professional.png";
import allInOneServices from "../../assets/all-in-one-services.png";

const quickServices = [
  {
    title: "AC Repair",
    description: "Cooling, servicing & maintenance",
  },
  {
    title: "Plumbing",
    description: "Leaks, fittings & installations",
  },
  {
    title: "Electrical",
    description: "Repairs, wiring & fixtures",
  },
  {
    title: "Cleaning",
    description: "Home & deep cleaning",
  },
];

const activityItems = [
  {
    label: "Service requests",
    key: "requests",
  },
  {
    label: "Quotes received",
    key: "quotes",
  },
  {
    label: "Completed services",
    key: "completed",
  },
  {
    label: "Upcoming bookings",
    key: "upcoming",
  },
] as const;

export default function CustomerDashboard() {
  const results = useQueries({
    queries: [
      {
        queryKey: ["customer", "requests"],
        queryFn: getCustomerRequests,
      },
      {
        queryKey: ["customer", "quotes"],
        queryFn: getCustomerQuotes,
      },
      {
        queryKey: ["customer", "bookings"],
        queryFn: getCustomerBookings,
      },
    ],
  });

  const [requestsQuery, quotesQuery, bookingsQuery] =
    results;

  const isLoading = results.some(
    (query) => query.isLoading
  );

  const hasError = results.some(
    (query) => query.isError
  );

  const requests = requestsQuery.data ?? [];
  const quotes = quotesQuery.data ?? [];
  const bookings = bookingsQuery.data ?? [];

  const activeRequests = requests.filter(
    (request) =>
      request.status === "PENDING" ||
      request.status === "ACCEPTED"
  ).length;

  const activeQuotes = quotes.filter(
    (quote) => quote.status === "PENDING"
  ).length;

  const completedBookings = bookings.filter(
    (booking) =>
      booking.status === "COMPLETED"
  );

  const upcomingBookings = bookings.filter(
    (booking) =>
      booking.status === "CONFIRMED" ||
      booking.status === "IN_PROGRESS"
  );

  const nextBooking = [...upcomingBookings].sort(
    (a, b) =>
      new Date(a.scheduled_at).getTime() -
      new Date(b.scheduled_at).getTime()
  )[0];

  return (
    <div className="space-y-8">
      {/* ============================================================
          WELCOME HERO
      ============================================================ */}

      <section className="overflow-hidden rounded-[var(--fixit-radius-xl)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] shadow-[var(--fixit-shadow-md)]">
        <div className="grid items-center lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative z-10 p-6 sm:p-8 lg:p-10 xl:p-12">
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
              YOUR FIXIT HOME
            </p>

            <h1 className="mt-3 max-w-xl text-3xl font-bold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              What needs fixing today?
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--fixit-text-muted)] sm:text-base sm:leading-7">
              Find the right professional, request a service,
              compare quotes and manage everything from one place.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/customer/services">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Find a service
                  <ArrowRight size={17} />
                </Button>
              </Link>

              <Link to="/customer/requests">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  View requests
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                value={isLoading ? "—" : String(activeRequests)}
                label="Active requests"
              />

              <StatCard
                value={isLoading ? "—" : String(activeQuotes)}
                label="Pending quotes"
              />

              <StatCard
                value={isLoading ? "—" : String(bookings.length)}
                label="Bookings"
              />

              <StatCard
                value={
                  isLoading
                    ? "—"
                    : String(completedBookings.length)
                }
                label="Completed"
              />
            </div>
          </div>

          <div className="relative hidden min-h-[390px] items-end justify-center overflow-hidden bg-[var(--fixit-primary-soft)] lg:flex">
            <div className="absolute -right-16 top-8 h-64 w-64 rounded-full bg-[var(--fixit-secondary-soft)] blur-3xl" />

            <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[var(--fixit-primary-soft)] blur-2xl" />

            <img
              src={heroProfessional}
              alt="FixIt professional ready to help with home services"
              className="relative z-10 h-full max-h-[430px] w-full object-contain object-bottom"
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          ERROR
      ============================================================ */}

      {hasError && (
        <section
          role="alert"
          className="rounded-[var(--fixit-radius-md)] border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-5 py-4"
        >
          <p className="text-sm font-semibold text-[var(--fixit-error)]">
            Some dashboard information could not be loaded.
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
            Please refresh the page and try again.
          </p>
        </section>
      )}

      {/* ============================================================
          POPULAR SERVICES
      ============================================================ */}

      <section>
        <SectionHeading
          eyebrow="QUICK ACCESS"
          title="Popular services"
          description="Start with one of the services people commonly book through FixIt."
          action={
            <Link
              to="/customer/services"
              className="hidden items-center gap-1 text-sm font-semibold text-[var(--fixit-primary)] transition hover:text-[var(--fixit-primary-hover)] sm:inline-flex"
            >
              View all
              <ChevronRight size={16} />
            </Link>
          }
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickServices.map((service, index) => (
            <QuickServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* ============================================================
          FIND A PROFESSIONAL
      ============================================================ */}

      <section className="overflow-hidden rounded-[var(--fixit-radius-xl)] border border-[var(--fixit-border)] bg-[var(--fixit-background)]">
        <div className="grid items-center lg:grid-cols-[0.8fr_1.2fr]">
          <div className="order-2 p-6 sm:p-8 lg:order-1 lg:p-10">
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
              NEED SOMEONE?
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
              Find the right professional.
            </h2>

            <p className="mt-4 text-sm leading-6 text-[var(--fixit-text-muted)]">
              Tell FixIt what you need and discover professionals
              who can help with the job.
            </p>

            <div className="mt-6 space-y-3">
              <FeaturePoint text="Discover relevant professionals" />

              <FeaturePoint text="Review profiles and service details" />

              <FeaturePoint text="Compare your options before booking" />
            </div>

            <Link
              to="/customer/services"
              className="mt-7 inline-flex"
            >
              <Button variant="primary">
                Find a professional
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          <div className="order-1 flex items-center justify-center bg-[var(--fixit-surface)] p-5 sm:p-8 lg:order-2">
            <img
              src={findProfessional}
              alt="Customer finding professionals through FixIt"
              className="h-auto w-full max-w-2xl object-contain"
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          UPCOMING BOOKING + ACTIVITY
      ============================================================ */}

      <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
                UPCOMING
              </p>

              <h2 className="mt-2 text-xl font-bold tracking-tight">
                Your next booking
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
              <CalendarDays size={19} />
            </div>
          </div>

          {isLoading ? (
            <LoadingState />
          ) : nextBooking ? (
            <div className="mt-7 rounded-[var(--fixit-radius-lg)] border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fixit-primary)] text-white">
                      <CalendarDays size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                        Upcoming appointment
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[var(--fixit-text)]">
                        {formatDate(
                          nextBooking.scheduled_at
                        )}
                      </p>
                    </div>
                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    Service booking #{nextBooking.id}
                  </h3>

                  <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
                    Scheduled for{" "}
                    {formatTime(
                      nextBooking.scheduled_at
                    )}
                  </p>
                </div>

                <StatusBadge
                  status={nextBooking.status}
                />
              </div>

              <Link
                to={`/customer/bookings/${nextBooking.id}`}
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--fixit-primary)] transition hover:text-[var(--fixit-primary-hover)]"
              >
                View booking
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="mt-7 rounded-[var(--fixit-radius-lg)] border border-dashed border-[var(--fixit-border)] bg-[var(--fixit-background)] p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--fixit-surface)] text-[var(--fixit-text-muted)] shadow-[var(--fixit-shadow-sm)]">
                <CalendarDays size={19} />
              </div>

              <p className="mt-4 text-sm font-semibold">
                Nothing scheduled yet
              </p>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[var(--fixit-text-muted)]">
                Once you book a professional, your upcoming
                appointment will appear here.
              </p>

              <Link
                to="/customer/services"
                className="mt-5 inline-flex"
              >
                <Button
                  variant="secondary"
                  size="sm"
                >
                  <Plus size={15} />
                  Book a service
                </Button>
              </Link>
            </div>
          )}
        </Card>

        <Card className="p-6 sm:p-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
            <ShieldCheck size={19} />
          </div>

          <h2 className="mt-5 text-xl font-bold tracking-tight">
            Your FixIt activity
          </h2>

          <p className="mt-2 text-xs leading-5 text-[var(--fixit-text-muted)]">
            A quick look at your service activity.
          </p>

          <div className="mt-7 space-y-4">
            {activityItems.map((item) => {
              let value: number | string;

              switch (item.key) {
                case "requests":
                  value = isLoading
                    ? "—"
                    : requests.length;
                  break;

                case "quotes":
                  value = isLoading
                    ? "—"
                    : quotes.length;
                  break;

                case "completed":
                  value = isLoading
                    ? "—"
                    : completedBookings.length;
                  break;

                case "upcoming":
                  value = isLoading
                    ? "—"
                    : upcomingBookings.length;
                  break;
              }

              return (
                <ActivityItem
                  key={item.key}
                  label={item.label}
                  value={value}
                  icon={
                    item.key === "quotes" ? (
                      <FileIcon />
                    ) : item.key === "completed" ? (
                      <CheckCircle2 size={16} />
                    ) : item.key === "upcoming" ? (
                      <Clock3 size={16} />
                    ) : (
                      <Wrench size={16} />
                    )
                  }
                />
              );
            })}
          </div>
        </Card>
      </section>

      {/* ============================================================
          HOW FIXIT WORKS
      ============================================================ */}

      <section>
        <SectionHeading
          eyebrow="HOW FIXIT WORKS"
          title="A simple path from problem to solution."
          description="Request a service, compare your options and book the professional that works for you."
        />

        <div className="mt-6 overflow-hidden rounded-[var(--fixit-radius-xl)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] shadow-[var(--fixit-shadow-sm)]">
          <img
            src={howFixitWorks}
            alt="FixIt process showing request, quotes and booking"
            className="h-auto w-full object-contain"
          />
        </div>
      </section>

      {/* ============================================================
          TRUSTED PROFESSIONALS
      ============================================================ */}

      <section className="overflow-hidden rounded-[var(--fixit-radius-xl)] border border-[var(--fixit-border)] bg-[var(--fixit-background)]">
        <div className="grid items-center lg:grid-cols-[1fr_1fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
              CHOOSE WITH CONFIDENCE
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
              Know more before you book.
            </h2>

            <p className="mt-4 text-sm leading-6 text-[var(--fixit-text-muted)]">
              Use professional profiles, service information and
              reviews to make a more informed decision.
            </p>

            <div className="mt-7 space-y-4">
              <FeaturePoint text="Review professional profiles" />

              <FeaturePoint text="See services and experience" />

              <FeaturePoint text="Use reviews to compare options" />
            </div>

            <Link
              to="/customer/services"
              className="mt-7 inline-flex"
            >
              <Button variant="primary">
                Explore professionals
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center bg-[var(--fixit-surface)] p-5 sm:p-8">
            <img
              src={trustedProfessional}
              alt="FixIt professional profile with verification and ratings"
              className="h-auto w-full max-w-xl object-contain"
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          ALL-IN-ONE FIXIT
      ============================================================ */}

      <section className="overflow-hidden rounded-[var(--fixit-radius-xl)] bg-[var(--fixit-primary)] text-white shadow-[var(--fixit-shadow-lg)]">
        <div className="grid items-center lg:grid-cols-[0.85fr_1.15fr]">
          <div className="order-2 p-7 sm:p-9 lg:order-1 lg:p-11">
            <p className="text-xs font-bold tracking-[0.16em] text-white/70">
              ALL-IN-ONE FIXIT
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Whatever you need fixed,
              <span className="block text-[var(--fixit-secondary)]">
                start here.
              </span>
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-6 text-white/70 sm:text-base">
              Plumbing, electrical work, cleaning, repairs,
              appliances and more — find the service you need
              from one place.
            </p>

            <Link
              to="/customer/services"
              className="mt-7 inline-flex"
            >
              <Button
                variant="secondary"
                size="lg"
                className="border-white/20 bg-white text-[var(--fixit-primary)] hover:bg-slate-50"
              >
                Explore services
                <ArrowRight size={17} />
              </Button>
            </Link>
          </div>

          <div className="order-1 flex min-h-[300px] items-center justify-center overflow-hidden bg-white/5 p-4 sm:p-6 lg:order-2 lg:min-h-[360px]">
            <img
              src={allInOneServices}
              alt="FixIt home surrounded by different service categories"
              className="h-auto w-full max-w-2xl object-contain"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
          {title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--fixit-text-muted)]">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[var(--fixit-radius-md)] border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-4 py-3">
      <p className="text-xl font-bold tracking-tight text-[var(--fixit-text)]">
        {value}
      </p>

      <p className="mt-1 text-[11px] leading-4 text-[var(--fixit-text-muted)]">
        {label}
      </p>
    </div>
  );
}

function QuickServiceCard({
  title,
  description,
  index,
}: {
  title: string;
  description: string;
  index: number;
}) {
  const backgrounds = [
    "bg-[var(--fixit-primary-soft)]",
    "bg-[var(--fixit-secondary-soft)]",
    "bg-[var(--fixit-info-soft)]",
    "bg-[var(--fixit-success-soft)]",
  ];

  const textColors = [
    "text-[var(--fixit-primary)]",
    "text-[var(--fixit-secondary)]",
    "text-[var(--fixit-info)]",
    "text-[var(--fixit-success)]",
  ];

  return (
    <Link to="/customer/services">
      <Card
        variant="interactive"
        className="group h-full p-5"
      >
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-[var(--fixit-radius-md)] ${backgrounds[index % backgrounds.length]} ${textColors[index % textColors.length]}`}
        >
          <Wrench
            size={19}
            strokeWidth={1.9}
          />
        </div>

        <h3 className="mt-5 text-sm font-bold">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
          {description}
        </p>

        <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-[var(--fixit-primary)]">
          Explore
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </div>
      </Card>
    </Link>
  );
}

function FeaturePoint({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
        <CheckCircle2 size={16} />
      </div>

      <span className="pt-1 text-sm leading-5 text-[var(--fixit-text)]">
        {text}
      </span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-7 flex items-center justify-center rounded-[var(--fixit-radius-lg)] bg-[var(--fixit-background)] p-10">
      <div className="flex items-center gap-2 text-sm text-[var(--fixit-text-muted)]">
        <LoaderCircle
          size={17}
          className="animate-spin text-[var(--fixit-primary)]"
        />

        Loading booking information...
      </div>
    </div>
  );
}

function ActivityItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
          {icon}
        </div>

        <p className="truncate text-sm font-medium text-[var(--fixit-text)]">
          {label}
        </p>
      </div>

      <span className="text-sm font-bold text-[var(--fixit-text)]">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const formattedStatus = status.replaceAll(
    "_",
    " "
  );

  const isInProgress =
    status === "IN_PROGRESS";

  const isConfirmed =
    status === "CONFIRMED";

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${
        isInProgress
          ? "border-[var(--fixit-info)]/20 bg-[var(--fixit-info-soft)] text-[var(--fixit-info)]"
          : isConfirmed
            ? "border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] text-[var(--fixit-success)]"
            : "border-[var(--fixit-border)] bg-[var(--fixit-surface)] text-[var(--fixit-text-muted)]"
      }`}
    >
      {formattedStatus}
    </span>
  );
}

function FileIcon() {
  return <ArrowRight size={16} />;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(value));
}