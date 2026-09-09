import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  Hammer,
  Home,
  Paintbrush,
  Search,
  SlidersHorizontal,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getServiceCategories,
  getServices,
} from "./servicesApi";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

import findProfessional from "../../assets/find-professional.png";

const serviceVisuals = [
  {
    background: "bg-[var(--fixit-primary-soft)]",
    color: "text-[var(--fixit-primary)]",
    icon: Wrench,
  },
  {
    background: "bg-[var(--fixit-secondary-soft)]",
    color: "text-[var(--fixit-secondary)]",
    icon: Zap,
  },
  {
    background: "bg-[var(--fixit-info-soft)]",
    color: "text-[var(--fixit-info)]",
    icon: Droplets,
  },
  {
    background: "bg-[var(--fixit-success-soft)]",
    color: "text-[var(--fixit-success)]",
    icon: Home,
  },
  {
    background: "bg-[var(--fixit-warning-soft)]",
    color: "text-[var(--fixit-warning)]",
    icon: Hammer,
  },
  {
    background: "bg-[var(--fixit-primary-soft)]",
    color: "text-[var(--fixit-primary)]",
    icon: Paintbrush,
  },
];

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<number | undefined>(undefined);

  const [search, setSearch] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["service-categories"],
    queryFn: getServiceCategories,
  });

  const servicesQuery = useQuery({
    queryKey: ["services", selectedCategory],
    queryFn: () => getServices(selectedCategory),
  });

  const categories = useMemo(
    () =>
      (categoriesQuery.data ?? []).filter(
        (category) => category.is_active
      ),
    [categoriesQuery.data]
  );

  const services = useMemo(() => {
    const activeServices = (
      servicesQuery.data ?? []
    ).filter((service) => service.is_active);

    const normalizedSearch = search
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return activeServices;
    }

    return activeServices.filter((service) => {
      const searchableText = [
        service.name,
        service.description ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedSearch
      );
    });
  }, [servicesQuery.data, search]);

  const isLoading =
    categoriesQuery.isLoading ||
    servicesQuery.isLoading;

  const hasError =
    categoriesQuery.isError ||
    servicesQuery.isError;

  return (
    <div className="space-y-8">
      {/* ============================================================
          PAGE HEADER
      ============================================================ */}

      <section className="overflow-hidden rounded-[var(--fixit-radius-xl)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] shadow-[var(--fixit-shadow-sm)]">
        <div className="grid items-center lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative z-10 p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
              FIXIT SERVICES
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              What can we help you fix?
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--fixit-text-muted)] sm:text-base">
              Browse available services, find the right
              category and connect with a professional who
              can help.
            </p>

            <div className="mt-7 flex max-w-2xl items-center rounded-[var(--fixit-radius-lg)] border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-1.5 shadow-[var(--fixit-shadow-sm)]">
              <Search
                size={18}
                className="ml-3 shrink-0 text-[var(--fixit-text-muted)]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search services..."
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--fixit-text)] outline-none placeholder:text-[var(--fixit-text-muted)]"
                aria-label="Search services"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mr-1 rounded-lg px-3 py-2 text-xs font-semibold text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-surface)] hover:text-[var(--fixit-text)]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--fixit-primary)]/10 bg-[var(--fixit-primary-soft)] px-3 py-1.5 text-xs font-medium text-[var(--fixit-primary)]">
                <CheckCircle2 size={14} />
                Service catalog
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-3 py-1.5 text-xs font-medium text-[var(--fixit-text-muted)]">
                <Sparkles size={14} />
                Professional discovery
              </div>
            </div>
          </div>

          <div className="hidden min-h-[350px] items-center justify-center overflow-hidden bg-[var(--fixit-primary-soft)] p-5 sm:p-8 lg:flex">
            <img
              src={findProfessional}
              alt="Find a professional through FixIt"
              className="h-auto w-full max-w-2xl object-contain"
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          CATEGORY FILTERS
      ============================================================ */}

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
              EXPLORE
            </p>

            <h2 className="mt-2 text-xl font-bold tracking-tight">
              Service categories
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[var(--fixit-text-muted)]">
            <SlidersHorizontal size={15} />

            <span>
              {services.length}{" "}
              {services.length === 1
                ? "service"
                : "services"}
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          <CategoryChip
            label="All services"
            active={
              selectedCategory === undefined
            }
            onClick={() =>
              setSelectedCategory(undefined)
            }
          />

          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              label={category.name}
              active={
                selectedCategory === category.id
              }
              onClick={() =>
                setSelectedCategory(category.id)
              }
            />
          ))}
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
            We couldn't load the service catalog.
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
            Make sure the FixIt backend is running and
            refresh the page.
          </p>
        </section>
      )}

      {/* ============================================================
          SERVICES
      ============================================================ */}

      <section>
        {isLoading ? (
          <ServiceGridSkeleton />
        ) : services.length === 0 ? (
          <EmptyServices
            search={search}
            onClear={() => setSearch("")}
          />
        ) : (
          <>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
                  AVAILABLE NOW
                </p>

                <h2 className="mt-2 text-xl font-bold tracking-tight">
                  Choose a service
                </h2>
              </div>

              <span className="text-xs font-medium text-[var(--fixit-text-muted)]">
                {services.length} available
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {services.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  visualIndex={index}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ============================================================
          LOWER CTA
      ============================================================ */}

      {!isLoading && services.length > 0 && (
        <section className="overflow-hidden rounded-[var(--fixit-radius-xl)] border border-[var(--fixit-border)] bg-[var(--fixit-background)]">
          <div className="grid items-center lg:grid-cols-[0.8fr_1.2fr]">
            <div className="order-2 p-6 sm:p-8 lg:order-1 lg:p-10">
              <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
                NEED SOMEONE FOR THE JOB?
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
                Find a professional when you are ready.
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--fixit-text-muted)]">
                Choose a service above and FixIt will take
                you to professionals who can help with it.
              </p>

              <Link
                to="/customer/professionals"
                className="mt-7 inline-flex"
              >
                <Button variant="primary">
                  Browse professionals
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            <div className="order-1 flex items-center justify-center bg-[var(--fixit-surface)] p-5 sm:p-8 lg:order-2">
              <img
                src={findProfessional}
                alt="FixIt professional discovery"
                className="h-auto w-full max-w-xl object-contain"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--fixit-primary-ring)]",
        active
          ? "border-[var(--fixit-primary)] bg-[var(--fixit-primary)] text-white"
          : "border-[var(--fixit-border)] bg-[var(--fixit-surface)] text-[var(--fixit-text-muted)] hover:border-[var(--fixit-primary)]/30 hover:text-[var(--fixit-primary)]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function ServiceCard({
  service,
  visualIndex,
}: {
  service: {
    id: number;
    name: string;
    description: string | null;
    base_price: string;
  };
  visualIndex: number;
}) {
  const visual =
    serviceVisuals[
      visualIndex % serviceVisuals.length
    ];

  const Icon = visual.icon;

  return (
    <Card
      variant="interactive"
      className="group flex h-full flex-col p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-[var(--fixit-radius-lg)] ${visual.background} ${visual.color}`}
        >
          <Icon
            size={20}
            strokeWidth={1.9}
          />
        </div>

        <span className="rounded-full border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-3 py-1.5 text-[11px] font-semibold text-[var(--fixit-text-muted)]">
          Starting price
        </span>
      </div>

      <div className="mt-6 flex-1">
        <h3 className="text-lg font-bold tracking-tight text-[var(--fixit-text)]">
          {service.name}
        </h3>

        <p className="mt-2 min-h-[48px] text-sm leading-6 text-[var(--fixit-text-muted)]">
          {service.description ||
            "Professional help for your home."}
        </p>
      </div>

      <div className="mt-7 flex items-end justify-between gap-4 border-t border-[var(--fixit-border)] pt-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
            From
          </p>

          <p className="mt-1 text-lg font-bold text-[var(--fixit-text)]">
            ₹{formatPrice(service.base_price)}
          </p>
        </div>

        <Link
          to={`/customer/professionals?service_id=${service.id}`}
          className="inline-flex items-center gap-2 rounded-[var(--fixit-radius-md)] bg-[var(--fixit-primary)] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--fixit-primary-ring)]"
        >
          Find professionals
          <ArrowRight size={15} />
        </Link>
      </div>
    </Card>
  );
}

function ServiceGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="rounded-[var(--fixit-radius-lg)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-6"
          >
            <div className="animate-pulse">
              <div className="h-12 w-12 rounded-[var(--fixit-radius-lg)] bg-[var(--fixit-border)]" />

              <div className="mt-6 h-5 w-2/3 rounded bg-[var(--fixit-border)]" />

              <div className="mt-3 h-4 w-full rounded bg-[var(--fixit-border)]" />

              <div className="mt-2 h-4 w-4/5 rounded bg-[var(--fixit-border)]" />

              <div className="mt-7 border-t border-[var(--fixit-border)] pt-5">
                <div className="flex justify-between gap-4">
                  <div className="h-8 w-20 rounded bg-[var(--fixit-border)]" />

                  <div className="h-10 w-36 rounded-[var(--fixit-radius-md)] bg-[var(--fixit-border)]" />
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function EmptyServices({
  search,
  onClear,
}: {
  search: string;
  onClear: () => void;
}) {
  return (
    <div className="rounded-[var(--fixit-radius-xl)] border border-dashed border-[var(--fixit-border)] bg-[var(--fixit-surface)] px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
        <Search size={19} />
      </div>

      <h3 className="mt-5 text-base font-bold text-[var(--fixit-text)]">
        {search
          ? "No services found"
          : "No services available"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
        {search
          ? "Try a different search term or clear the search to browse the full catalog."
          : "There are currently no active services in the catalog."}
      </p>

      {search && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-5"
          onClick={onClear}
        >
          Clear search
        </Button>
      )}
    </div>
  );
}

function formatPrice(value: string) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return value;
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(numericValue);
}