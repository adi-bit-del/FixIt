import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { useQuery } from "@tanstack/react-query";

import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  UserRound,
  Wrench,
} from "lucide-react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import { getProfessionals } from "./professionalsApi";

import type {
  ProfessionalDiscovery,
} from "../../types/professional";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

type SortOption =
  | "recommended"
  | "price-low"
  | "price-high"
  | "experience";

export default function ProfessionalDiscoveryPage() {
  const [searchParams] =
    useSearchParams();

  const serviceIdParam =
    searchParams.get("service_id");

  const parsedServiceId =
    serviceIdParam &&
    !Number.isNaN(Number(serviceIdParam))
      ? Number(serviceIdParam)
      : undefined;

  const [city, setCity] =
    useState("");

  const [postalCode, setPostalCode] =
    useState("");

  const [appliedCity, setAppliedCity] =
    useState("");

  const [
    appliedPostalCode,
    setAppliedPostalCode,
  ] = useState("");

  const [sortBy, setSortBy] =
    useState<SortOption>("recommended");

  const professionalsQuery =
    useQuery({
      queryKey: [
        "professionals",
        parsedServiceId,
        appliedCity,
        appliedPostalCode,
      ],

      queryFn: () =>
        getProfessionals({
          serviceId: parsedServiceId,
          city:
            appliedCity || undefined,
          postalCode:
            appliedPostalCode || undefined,
        }),
    });

  const professionals =
    useMemo(
      () =>
        professionalsQuery.data ?? [],
      [professionalsQuery.data]
    );

  const sortedProfessionals =
    useMemo(() => {
      const items = [
        ...professionals,
      ];

      switch (sortBy) {
        case "price-low":
          return items.sort(
            (a, b) =>
              Number(a.price) -
              Number(b.price)
          );

        case "price-high":
          return items.sort(
            (a, b) =>
              Number(b.price) -
              Number(a.price)
          );

        case "experience":
          return items.sort(
            (a, b) =>
              b.experience_years -
              a.experience_years
          );

        case "recommended":
        default:
          return items;
      }
    }, [professionals, sortBy]);

  function handleSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setAppliedCity(
      city.trim()
    );

    setAppliedPostalCode(
      postalCode.trim()
    );
  }

  function clearFilters() {
    setCity("");
    setPostalCode("");
    setAppliedCity("");
    setAppliedPostalCode("");
  }

  const hasLocationFilters =
    Boolean(
      appliedCity ||
        appliedPostalCode
    );

  return (
    <div className="space-y-8">
      {/* ============================================================
          PAGE HEADER
      ============================================================ */}

      <section className="overflow-hidden rounded-[var(--fixit-radius-xl)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] shadow-[var(--fixit-shadow-sm)]">
        <div className="relative">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--fixit-secondary-soft)] blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[var(--fixit-primary-soft)] blur-3xl" />

          <div className="relative z-10 p-6 sm:p-8 lg:p-10">
            <div className="max-w-4xl">
              <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
                PROFESSIONAL DISCOVERY
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                Find the right professional for the job.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)] sm:text-base">
                Compare professionals, service details,
                experience and starting prices before you
                send a request.
              </p>

              {parsedServiceId && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--fixit-primary)]/10 bg-[var(--fixit-primary-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--fixit-primary)]">
                  <Wrench size={14} />
                  Professionals for selected service
                </div>
              )}
            </div>

            {/* ======================================================
                SEARCH
                ====================================================== */}

            <form
              onSubmit={handleSearch}
              className="mt-8 rounded-[var(--fixit-radius-lg)] border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-2"
            >
              <div className="grid gap-2 md:grid-cols-[1fr_180px_auto]">
                <div className="flex min-w-0 items-center rounded-[var(--fixit-radius-md)] border border-transparent bg-[var(--fixit-surface)] px-3 shadow-[var(--fixit-shadow-sm)] focus-within:border-[var(--fixit-primary)]/30">
                  <MapPin
                    size={18}
                    className="mr-2 shrink-0 text-[var(--fixit-text-muted)]"
                  />

                  <input
                    type="text"
                    value={city}
                    onChange={(event) =>
                      setCity(
                        event.target.value
                      )
                    }
                    placeholder="Search by city"
                    className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm text-[var(--fixit-text)] outline-none placeholder:text-[var(--fixit-text-muted)]"
                    aria-label="Search by city"
                  />
                </div>

                <input
                  type="text"
                  value={postalCode}
                  onChange={(event) =>
                    setPostalCode(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="PIN code"
                  className="h-11 rounded-[var(--fixit-radius-md)] border border-transparent bg-[var(--fixit-surface)] px-4 text-sm text-[var(--fixit-text)] outline-none shadow-[var(--fixit-shadow-sm)] placeholder:text-[var(--fixit-text-muted)] focus:border-[var(--fixit-primary)]/30"
                  aria-label="Search by PIN code"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full md:w-auto"
                >
                  <Search size={17} />
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ============================================================
          LOCATION FILTERS
      ============================================================ */}

      {(hasLocationFilters ||
        parsedServiceId) && (
        <section>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
              Active filters
            </span>

            {parsedServiceId && (
              <FilterPill label="Selected service" />
            )}

            {appliedCity && (
              <FilterPill
                label={`City: ${appliedCity}`}
              />
            )}

            {appliedPostalCode && (
              <FilterPill
                label={`PIN: ${appliedPostalCode}`}
              />
            )}

            {hasLocationFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-1 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--fixit-primary)] transition hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary-hover)]"
              >
                Clear location
              </button>
            )}
          </div>
        </section>
      )}

      {/* ============================================================
          RESULTS HEADER
      ============================================================ */}

      <section>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
              PROFESSIONALS
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em]">
              {parsedServiceId
                ? "Available professionals"
                : "Explore professionals"}
            </h2>

            <p className="mt-2 text-sm text-[var(--fixit-text-muted)]">
              {professionalsQuery.isLoading
                ? "Finding professionals..."
                : `${professionals.length} ${
                    professionals.length === 1
                      ? "professional"
                      : "professionals"
                  } available`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SlidersHorizontal
              size={16}
              className="text-[var(--fixit-text-muted)]"
            />

            <label className="relative">
              <span className="sr-only">
                Sort professionals
              </span>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target
                      .value as SortOption
                  )
                }
                className="h-10 appearance-none rounded-[var(--fixit-radius-md)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] pl-3 pr-9 text-xs font-semibold text-[var(--fixit-text)] outline-none transition focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
              >
                <option value="recommended">
                  Recommended
                </option>

                <option value="price-low">
                  Price: Low to high
                </option>

                <option value="price-high">
                  Price: High to low
                </option>

                <option value="experience">
                  Most experience
                </option>
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fixit-text-muted)]"
              />
            </label>
          </div>
        </div>
      </section>

      {/* ============================================================
          ERROR
      ============================================================ */}

      {professionalsQuery.isError && (
        <section
          role="alert"
          className="rounded-[var(--fixit-radius-md)] border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-5 py-4"
        >
          <p className="text-sm font-semibold text-[var(--fixit-error)]">
            We couldn't load professionals.
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
            Make sure the FixIt backend is running
            and try again.
          </p>
        </section>
      )}

      {/* ============================================================
          RESULTS
      ============================================================ */}

      {professionalsQuery.isLoading ? (
        <ProfessionalGridSkeleton />
      ) : sortedProfessionals.length === 0 ? (
        <EmptyProfessionals
          hasFilters={
            Boolean(
              appliedCity ||
                appliedPostalCode ||
                parsedServiceId
            )
          }
          onClear={clearFilters}
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {sortedProfessionals.map(
            (professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={
                  professional
                }
              />
            )
          )}
        </div>
      )}

      {/* ============================================================
          SERVICE JOURNEY NOTE
      ============================================================ */}

      {!professionalsQuery.isLoading &&
        sortedProfessionals.length > 0 && (
          <Card className="overflow-hidden bg-[var(--fixit-primary-soft)] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--fixit-surface)] text-[var(--fixit-primary)] shadow-[var(--fixit-shadow-sm)]">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <p className="text-sm font-bold text-[var(--fixit-text)]">
                    Choose with confidence
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                    Review a professional's profile and
                    service details before sending your
                    request.
                  </p>
                </div>
              </div>

              <Link
                to="/customer/services"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--fixit-primary)] transition hover:text-[var(--fixit-primary-hover)]"
              >
                Browse services
                <ArrowRight size={14} />
              </Link>
            </div>
          </Card>
        )}
    </div>
  );
}

/* ==========================================================================
   PROFESSIONAL CARD
   ========================================================================== */

function ProfessionalCard({
  professional,
}: {
  professional: ProfessionalDiscovery;
}) {
  return (
    <Card
      variant="interactive"
      className="group flex h-full flex-col p-5 sm:p-6"
    >
      {/* ================================================================
          PROFILE HEADER
      ================================================================ */}

      <div className="flex gap-4">
        <div className="relative shrink-0">
          {professional.profile_image_url ? (
            <img
              src={
                professional.profile_image_url
              }
              alt={
                professional.business_name
              }
              className="h-16 w-16 rounded-[var(--fixit-radius-lg)] object-cover sm:h-20 sm:w-20"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-[var(--fixit-radius-lg)] bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)] sm:h-20 sm:w-20">
              <UserRound
                size={28}
                strokeWidth={1.7}
              />
            </div>
          )}

          <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--fixit-surface)] bg-[var(--fixit-primary)] text-white shadow-[var(--fixit-shadow-sm)]">
            <ShieldCheck size={13} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold tracking-tight text-[var(--fixit-text)]">
                {professional.business_name}
              </h3>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--fixit-text-muted)]">
                <CheckCircle2
                  size={13}
                  className="text-[var(--fixit-success)]"
                />

                <span>
                  Verified professional
                </span>
              </div>
            </div>

            <span className="w-fit shrink-0 rounded-full border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-3 py-1.5 text-[11px] font-semibold text-[var(--fixit-text-muted)]">
              {professional.experience_years}{" "}
              {professional.experience_years === 1
                ? "year"
                : "years"}{" "}
              experience
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================
          SERVICE
      ================================================================ */}

      <div className="mt-6 rounded-[var(--fixit-radius-lg)] border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                <Wrench size={15} />
              </div>

              <p className="truncate text-sm font-semibold text-[var(--fixit-text)]">
                {professional.service_name}
              </p>
            </div>

            {professional.bio && (
              <p className="mt-3 line-clamp-2 text-xs leading-5 text-[var(--fixit-text-muted)]">
                {professional.bio}
              </p>
            )}
          </div>

          <div className="shrink-0 sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
              Starting from
            </p>

            <p className="mt-1 text-xl font-bold tracking-tight text-[var(--fixit-text)]">
              ₹{formatPrice(
                professional.price
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================
          META
      ================================================================ */}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--fixit-text-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <Star
            size={15}
            fill="currentColor"
            className="text-[var(--fixit-warning)]"
          />

          <span className="font-semibold text-[var(--fixit-text)]">
            New
          </span>
        </span>

        <span className="h-1 w-1 rounded-full bg-[var(--fixit-border)]" />

        <span className="inline-flex items-center gap-1.5">
          <Wrench size={14} />
          {professional.service_name}
        </span>
      </div>

      {/* ================================================================
          ACTIONS
      ================================================================ */}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          to={`/customer/professionals/${professional.id}/request?service_id=${professional.service_id}`}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[var(--fixit-radius-md)] bg-[var(--fixit-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--fixit-primary-ring)]"
        >
          Request service
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </Card>
  );
}

/* ==========================================================================
   FILTER PILL
   ========================================================================== */

function FilterPill({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-full border border-[var(--fixit-border)] bg-[var(--fixit-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--fixit-text-muted)] shadow-[var(--fixit-shadow-sm)]">
      {label}
    </span>
  );
}

/* ==========================================================================
   LOADING
   ========================================================================== */

function ProfessionalGridSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {Array.from({ length: 4 }).map(
        (_, index) => (
          <div
            key={index}
            className="rounded-[var(--fixit-radius-lg)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-6"
          >
            <div className="animate-pulse">
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-[var(--fixit-radius-lg)] bg-[var(--fixit-border)]" />

                <div className="flex-1">
                  <div className="h-5 w-2/3 rounded bg-[var(--fixit-border)]" />

                  <div className="mt-3 h-4 w-1/3 rounded bg-[var(--fixit-border)]" />
                </div>
              </div>

              <div className="mt-6 h-28 rounded-[var(--fixit-radius-lg)] bg-[var(--fixit-border)]" />

              <div className="mt-5 h-4 w-1/3 rounded bg-[var(--fixit-border)]" />

              <div className="mt-6 h-11 rounded-[var(--fixit-radius-md)] bg-[var(--fixit-border)]" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

/* ==========================================================================
   EMPTY
   ========================================================================== */

function EmptyProfessionals({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="rounded-[var(--fixit-radius-xl)] border border-dashed border-[var(--fixit-border)] bg-[var(--fixit-surface)] px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
        <MapPin size={19} />
      </div>

      <h3 className="mt-5 text-base font-bold text-[var(--fixit-text)]">
        No professionals found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
        We couldn't find a professional matching
        your current selection. Try another location
        or browse again without location filters.
      </p>

      {hasFilters && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-5"
          onClick={onClear}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}

/* ==========================================================================
   PRICE
   ========================================================================== */

function formatPrice(
  value: string
) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return value;
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  ).format(numericValue);
}