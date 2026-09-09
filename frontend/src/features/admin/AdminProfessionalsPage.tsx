import {
  BadgeCheck,
  Check,
  Clock3,
  Search,
  ShieldX,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAdminProfessionals,
  updateProfessionalVerification,
} from "./adminApi";

import emptyVerificationImage from "../../assets/empty-verification.png";

type VerificationFilter =
  | "ALL"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

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

  return "Something went wrong.";
}

const filterOptions: {
  label: string;
  value: VerificationFilter;
}[] = [
  {
    label: "All",
    value: "ALL",
  },
  {
    label: "Pending",
    value: "PENDING",
  },
  {
    label: "Verified",
    value: "VERIFIED",
  },
  {
    label: "Rejected",
    value: "REJECTED",
  },
];

export default function AdminProfessionalsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<VerificationFilter>("ALL");

  const professionalsQuery = useQuery({
    queryKey: ["admin-professionals"],
    queryFn: getAdminProfessionals,
  });

  const verificationMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: "VERIFIED" | "REJECTED";
    }) => updateProfessionalVerification(id, status),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-professionals"],
      });
    },
  });

  const professionals = professionalsQuery.data ?? [];

  const counts = useMemo(() => {
    return {
      all: professionals.length,
      pending: professionals.filter(
        (professional) =>
          professional.verification_status.toUpperCase() ===
          "PENDING",
      ).length,
      verified: professionals.filter(
        (professional) =>
          professional.verification_status.toUpperCase() ===
          "VERIFIED",
      ).length,
      rejected: professionals.filter(
        (professional) =>
          professional.verification_status.toUpperCase() ===
          "REJECTED",
      ).length,
    };
  }, [professionals]);

  const filteredProfessionals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return professionals.filter((professional) => {
      const status =
        professional.verification_status.toUpperCase();

      const matchesFilter =
        filter === "ALL" || status === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        professional.business_name,
        professional.phone ?? "",
        String(professional.id),
        String(professional.user_id),
        professional.bio ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [professionals, search, filter]);

  const clearFilters = () => {
    setSearch("");
    setFilter("ALL");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <header className="mb-8">
        <p className="text-sm font-medium text-[var(--fixit-primary)]">
          Marketplace
        </p>

        <div className="mt-1 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--fixit-text)] sm:text-3xl">
              Professionals
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)] sm:text-base">
              Review professional accounts and manage their verification
              status.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--fixit-text-muted)]">
            <Users className="h-4 w-4" />
            <span>
              {counts.all} professional
              {counts.all === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </header>

      {/* Summary */}
      <section
        aria-label="Professional summary"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={[
            "rounded-2xl border bg-white p-4 text-left shadow-sm transition",
            filter === "ALL"
              ? "border-[var(--fixit-primary-ring)] bg-[var(--fixit-primary-soft)]"
              : "border-[var(--fixit-border)] hover:border-[var(--fixit-primary-ring)]",
          ].join(" ")}
        >
          <p className="text-sm font-medium text-[var(--fixit-text-muted)]">
            All professionals
          </p>

          <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
            {professionalsQuery.isLoading ? "—" : counts.all}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter("PENDING")}
          className={[
            "rounded-2xl border bg-white p-4 text-left shadow-sm transition",
            filter === "PENDING"
              ? "border-amber-200 bg-amber-50"
              : "border-[var(--fixit-border)] hover:border-amber-200",
          ].join(" ")}
        >
          <p className="text-sm font-medium text-[var(--fixit-text-muted)]">
            Pending
          </p>

          <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
            {professionalsQuery.isLoading ? "—" : counts.pending}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter("VERIFIED")}
          className={[
            "rounded-2xl border bg-white p-4 text-left shadow-sm transition",
            filter === "VERIFIED"
              ? "border-emerald-200 bg-emerald-50"
              : "border-[var(--fixit-border)] hover:border-emerald-200",
          ].join(" ")}
        >
          <p className="text-sm font-medium text-[var(--fixit-text-muted)]">
            Verified
          </p>

          <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
            {professionalsQuery.isLoading ? "—" : counts.verified}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter("REJECTED")}
          className={[
            "rounded-2xl border bg-white p-4 text-left shadow-sm transition",
            filter === "REJECTED"
              ? "border-red-200 bg-red-50"
              : "border-[var(--fixit-border)] hover:border-red-200",
          ].join(" ")}
        >
          <p className="text-sm font-medium text-[var(--fixit-text-muted)]">
            Rejected
          </p>

          <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
            {professionalsQuery.isLoading ? "—" : counts.rejected}
          </p>
        </button>
      </section>

      {/* Search and filters */}
      <section className="mt-6 rounded-2xl border border-[var(--fixit-border)] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fixit-text-muted)]" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by business, phone or ID..."
              aria-label="Search professionals"
              className="w-full rounded-xl border border-[var(--fixit-border)] bg-white py-2.5 pl-10 pr-3 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-disabled)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const active = filter === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={[
                    "rounded-full px-3.5 py-2 text-xs font-semibold transition",
                    active
                      ? "bg-[var(--fixit-primary)] text-white"
                      : "border border-[var(--fixit-border)] bg-white text-[var(--fixit-text-muted)] hover:border-[var(--fixit-primary-ring)] hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)]",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Query error */}
      {professionalsQuery.isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldX className="mt-0.5 h-5 w-5 shrink-0 text-[var(--fixit-danger)]" />

            <div>
              <p className="font-semibold text-[var(--fixit-danger)]">
                Unable to load professionals
              </p>

              <p className="mt-1 text-sm leading-6 text-red-700">
                {getErrorMessage(professionalsQuery.error)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {professionalsQuery.isLoading && (
        <div className="mt-6 grid gap-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[var(--fixit-border)] bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="animate-pulse">
                <div className="flex gap-4">
                  <div className="h-14 w-14 rounded-xl bg-slate-100" />

                  <div className="flex-1">
                    <div className="h-4 w-48 rounded bg-slate-100" />
                    <div className="mt-3 h-3 w-32 rounded bg-slate-100" />
                    <div className="mt-3 h-3 w-56 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!professionalsQuery.isLoading &&
        !professionalsQuery.isError &&
        filteredProfessionals.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--fixit-border)] bg-white px-6 py-12 text-center shadow-sm">
            {professionals.length === 0 ? (
              <>
                <img
                  src={emptyVerificationImage}
                  alt=""
                  aria-hidden="true"
                  className="mx-auto h-36 w-auto object-contain"
                />

                <p className="mt-5 font-semibold text-[var(--fixit-text)]">
                  No professionals yet
                </p>

                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
                  Professional accounts will appear here as they join the
                  FixIt marketplace.
                </p>
              </>
            ) : (
              <>
                <Search className="mx-auto h-10 w-10 text-[var(--fixit-disabled)]" />

                <p className="mt-4 font-semibold text-[var(--fixit-text)]">
                  No matching professionals
                </p>

                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
                  Try another search term or clear the current filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-[var(--fixit-primary-hover)]"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}

      {/* Professional list */}
      {!professionalsQuery.isLoading &&
        !professionalsQuery.isError &&
        filteredProfessionals.length > 0 && (
          <section className="mt-6 space-y-4">
            {filteredProfessionals.map((professional) => {
              const status =
                professional.verification_status.toUpperCase();

              const updating =
                verificationMutation.isPending &&
                verificationMutation.variables?.id ===
                  professional.id;

              return (
                <article
                  key={professional.id}
                  className="rounded-2xl border border-[var(--fixit-border)] bg-white p-5 shadow-sm transition hover:border-[var(--fixit-primary-ring)] sm:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      {professional.profile_image_url ? (
                        <img
                          src={professional.profile_image_url}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-[var(--fixit-border)]"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)]">
                          <BadgeCheck className="h-6 w-6 text-[var(--fixit-primary)]" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-[var(--fixit-text)]">
                            {professional.business_name}
                          </h2>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                              professional.verification_status,
                            )}`}
                          >
                            {professional.verification_status}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
                          Professional #{professional.id} · User #
                          {professional.user_id}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--fixit-text-muted)]">
                          <span>
                            {professional.experience_years} years experience
                          </span>

                          {professional.phone && (
                            <span>{professional.phone}</span>
                          )}
                        </div>

                        {professional.bio && (
                          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--fixit-text-muted)]">
                            {professional.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex w-full flex-wrap gap-2 xl:w-auto xl:shrink-0 xl:justify-end">
                      {status !== "VERIFIED" && (
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() =>
                            verificationMutation.mutate({
                              id: professional.id,
                              status: "VERIFIED",
                            })
                          }
                          className="inline-flex min-w-28 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--fixit-disabled)] disabled:!text-white sm:flex-none"
                        >
                          <Check className="h-4 w-4" />
                          {updating ? "Updating..." : "Verify"}
                        </button>
                      )}

                      {status !== "REJECTED" && (
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() =>
                            verificationMutation.mutate({
                              id: professional.id,
                              status: "REJECTED",
                            })
                          }
                          className="inline-flex min-w-28 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--fixit-danger)] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-[var(--fixit-border)] disabled:bg-white disabled:text-[var(--fixit-disabled)] sm:flex-none"
                        >
                          <X className="h-4 w-4" />
                          {updating ? "Updating..." : "Reject"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

      {/* Footer summary */}
      {!professionalsQuery.isLoading &&
        !professionalsQuery.isError &&
        professionals.length > 0 && (
          <div className="mt-6 flex flex-col gap-2 text-sm text-[var(--fixit-text-muted)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              <span>
                Showing {filteredProfessionals.length} of{" "}
                {professionals.length} professional
                {professionals.length === 1 ? "" : "s"}
              </span>
            </div>

            {verificationMutation.isError && (
              <div className="flex items-center gap-2 text-[var(--fixit-danger)]">
                <ShieldX className="h-4 w-4" />
                <span>
                  {getErrorMessage(verificationMutation.error)}
                </span>
              </div>
            )}
          </div>
        )}
    </div>
  );
}