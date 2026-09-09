import {
  Eye,
  EyeOff,
  MessageSquareText,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAdminReviews,
  updateAdminReviewModeration,
} from "./adminApi";

import emptyModerationImage from "../../assets/empty-moderation.png";

type ReviewFilter = "ALL" | "VISIBLE" | "HIDDEN";

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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status: "VISIBLE" | "HIDDEN") {
  if (status === "HIDDEN") {
    return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }

  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<ReviewFilter>("ALL");

  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: getAdminReviews,
  });

  const moderationMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: "VISIBLE" | "HIDDEN";
    }) => updateAdminReviewModeration(id, status),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-reviews"],
      });
    },
  });

  const reviews = reviewsQuery.data ?? [];

  const visibleCount = reviews.filter(
    (review) => review.moderation_status === "VISIBLE",
  ).length;

  const hiddenCount = reviews.filter(
    (review) => review.moderation_status === "HIDDEN",
  ).length;

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesFilter =
        filter === "ALL" ||
        review.moderation_status === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        review.customer_name,
        review.professional_name,
        review.service_name,
        review.comment ?? "",
        String(review.id),
        String(review.booking_id),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [filter, reviews, search]);

  const clearFilters = () => {
    setSearch("");
    setFilter("ALL");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <header className="mb-8">
        <p className="text-sm font-medium text-[var(--fixit-primary)]">
          Trust & Moderation
        </p>

        <div className="mt-1 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--fixit-text)] sm:text-3xl">
              Reviews
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)] sm:text-base">
              Review customer feedback and moderate inappropriate
              content without deleting the original record.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--fixit-text-muted)]">
            <MessageSquareText className="h-4 w-4" />

            <span>
              {reviews.length} review
              {reviews.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </header>

      {/* Summary */}
      <section
        aria-label="Review summary"
        className="grid gap-3 sm:grid-cols-3"
      >
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={[
            "rounded-2xl border p-4 text-left shadow-sm transition",
            filter === "ALL"
              ? "border-[var(--fixit-primary-ring)] bg-[var(--fixit-primary-soft)]"
              : "border-[var(--fixit-border)] bg-white hover:border-[var(--fixit-primary-ring)]",
          ].join(" ")}
        >
          <p className="text-sm font-medium text-[var(--fixit-text-muted)]">
            All reviews
          </p>

          <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
            {reviewsQuery.isLoading ? "—" : reviews.length}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter("VISIBLE")}
          className={[
            "rounded-2xl border p-4 text-left shadow-sm transition",
            filter === "VISIBLE"
              ? "border-emerald-200 bg-emerald-50"
              : "border-[var(--fixit-border)] bg-white hover:border-emerald-200",
          ].join(" ")}
        >
          <p className="text-sm font-medium text-[var(--fixit-text-muted)]">
            Visible
          </p>

          <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
            {reviewsQuery.isLoading ? "—" : visibleCount}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter("HIDDEN")}
          className={[
            "rounded-2xl border p-4 text-left shadow-sm transition",
            filter === "HIDDEN"
              ? "border-slate-300 bg-slate-100"
              : "border-[var(--fixit-border)] bg-white hover:border-slate-300",
          ].join(" ")}
        >
          <p className="text-sm font-medium text-[var(--fixit-text-muted)]">
            Hidden
          </p>

          <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
            {reviewsQuery.isLoading ? "—" : hiddenCount}
          </p>
        </button>
      </section>

      {/* Search */}
      <section className="mt-6 rounded-2xl border border-[var(--fixit-border)] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fixit-text-muted)]" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search customer, professional, service..."
              aria-label="Search reviews"
              className="w-full rounded-xl border border-[var(--fixit-border)] bg-white py-2.5 pl-10 pr-3 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-disabled)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
            />
          </div>

          {(search || filter !== "ALL") && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-background)] hover:text-[var(--fixit-text)]"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Error */}
      {reviewsQuery.isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--fixit-danger)]" />

            <div>
              <p className="font-semibold text-[var(--fixit-danger)]">
                Unable to load reviews
              </p>

              <p className="mt-1 text-sm leading-6 text-red-700">
                {getErrorMessage(reviewsQuery.error)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {reviewsQuery.isLoading && (
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[var(--fixit-border)] bg-white p-6 shadow-sm"
            >
              <div className="animate-pulse space-y-4">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100" />
                  <div className="flex-1">
                    <div className="h-4 w-52 rounded bg-slate-100" />
                    <div className="mt-2 h-3 w-32 rounded bg-slate-100" />
                  </div>
                </div>

                <div className="h-16 w-full rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!reviewsQuery.isLoading &&
        !reviewsQuery.isError &&
        filteredReviews.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--fixit-border)] bg-white px-6 py-12 text-center shadow-sm">
            {reviews.length === 0 ? (
              <>
                <img
                  src={emptyModerationImage}
                  alt=""
                  aria-hidden="true"
                  className="mx-auto h-36 w-auto object-contain"
                />

                <p className="mt-5 font-semibold text-[var(--fixit-text)]">
                  No reviews to moderate
                </p>

                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
                  Reviews will appear here once customers begin sharing
                  feedback.
                </p>
              </>
            ) : (
              <>
                <Search className="mx-auto h-10 w-10 text-[var(--fixit-disabled)]" />

                <p className="mt-4 font-semibold text-[var(--fixit-text)]">
                  No matching reviews
                </p>

                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
                  Try another search term or clear your filters.
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

      {/* Reviews */}
      {!reviewsQuery.isLoading &&
        !reviewsQuery.isError &&
        filteredReviews.length > 0 && (
          <section className="mt-6 space-y-4">
            {filteredReviews.map((review) => {
              const updating =
                moderationMutation.isPending &&
                moderationMutation.variables?.id === review.id;

              return (
                <article
                  key={review.id}
                  className={[
                    "rounded-2xl border bg-white p-5 shadow-sm transition sm:p-6",
                    review.moderation_status === "HIDDEN"
                      ? "border-slate-200 bg-slate-50/60"
                      : "border-[var(--fixit-border)] hover:border-[var(--fixit-primary-ring)]",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={[
                                  "h-4 w-4",
                                  index < review.rating
                                    ? "fill-[var(--fixit-secondary)] text-[var(--fixit-secondary)]"
                                    : "text-[var(--fixit-disabled)]",
                                ].join(" ")}
                              />
                            ))}
                          </div>

                          <span className="text-sm font-semibold text-[var(--fixit-text)]">
                            {review.rating}/5
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                              review.moderation_status,
                            )}`}
                          >
                            {review.moderation_status}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                          <p className="text-[var(--fixit-text-muted)]">
                            <span className="font-medium text-[var(--fixit-text)]">
                              Customer:
                            </span>{" "}
                            {review.customer_name}
                          </p>

                          <p className="text-[var(--fixit-text-muted)]">
                            <span className="font-medium text-[var(--fixit-text)]">
                              Professional:
                            </span>{" "}
                            {review.professional_name}
                          </p>

                          <p className="text-[var(--fixit-text-muted)]">
                            <span className="font-medium text-[var(--fixit-text)]">
                              Service:
                            </span>{" "}
                            {review.service_name}
                          </p>

                          <p className="text-[var(--fixit-text-muted)]">
                            <span className="font-medium text-[var(--fixit-text)]">
                              Review:
                            </span>{" "}
                            #{review.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-1 text-sm lg:items-end">
                        <span className="text-[var(--fixit-text-muted)]">
                          {formatDate(review.created_at)}
                        </span>

                        <span className="text-xs text-[var(--fixit-disabled)]">
                          Booking #{review.booking_id}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-4">
                      <p className="text-sm leading-6 text-[var(--fixit-text-muted)]">
                        {review.comment
                          ? review.comment
                          : "No written comment was provided."}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-[var(--fixit-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-[var(--fixit-disabled)]">
                        Moderation action changes visibility without
                        deleting the original review.
                      </p>

                      {review.moderation_status === "VISIBLE" ? (
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() =>
                            moderationMutation.mutate({
                              id: review.id,
                              status: "HIDDEN",
                            })
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--fixit-danger)] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-[var(--fixit-border)] disabled:text-[var(--fixit-disabled)]"
                        >
                          <EyeOff className="h-4 w-4" />
                          {updating
                            ? "Hiding..."
                            : "Hide review"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() =>
                            moderationMutation.mutate({
                              id: review.id,
                              status: "VISIBLE",
                            })
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--fixit-primary)] transition hover:border-[var(--fixit-primary-ring)] hover:bg-[var(--fixit-primary-soft)] disabled:cursor-not-allowed disabled:text-[var(--fixit-disabled)]"
                        >
                          <RotateCcw className="h-4 w-4" />
                          {updating
                            ? "Restoring..."
                            : "Restore review"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

      {moderationMutation.isError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-[var(--fixit-danger)]">
          {getErrorMessage(moderationMutation.error)}
        </div>
      )}

      {!reviewsQuery.isLoading &&
        !reviewsQuery.isError &&
        reviews.length > 0 && (
          <div className="mt-6 flex items-center gap-2 text-sm text-[var(--fixit-text-muted)]">
            {filter === "HIDDEN" ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}

            <span>
              Showing {filteredReviews.length} of {reviews.length} review
              {reviews.length === 1 ? "" : "s"}
            </span>
          </div>
        )}
    </div>
  );
}