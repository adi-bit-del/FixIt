import {
  CheckCircle2,
  MessageSquareText,
  Star,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getProfessionalProfile,
} from "./professionalProfileApi";

import {
  getProfessionalReviews,
} from "./professionalReviewsApi";

/*
|--------------------------------------------------------------------------
| Local View Models
|--------------------------------------------------------------------------
*/

type ReviewViewModel = {
  id: number;
  rating: number;
  bookingId: number;
  createdAt: string;
  comment: string;
};

type ProfileViewModel = {
  id: number;
  businessName: string;
};

/*
|--------------------------------------------------------------------------
| Safe Normalizers
|--------------------------------------------------------------------------
*/

function asNumber(
  value: unknown,
): number {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed)
      ? parsed
      : 0;
  }

  return 0;
}

function asString(
  value: unknown,
  fallback = "",
): string {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return fallback;
}

function normalizeReview(
  review: {
    id: unknown;
    rating: unknown;
    booking_id: unknown;
    created_at: unknown;
    comment?: unknown;
  },
): ReviewViewModel {
  return {
    id: asNumber(review.id),
    rating: asNumber(review.rating),
    bookingId: asNumber(
      review.booking_id,
    ),
    createdAt: asString(
      review.created_at,
    ),
    comment: asString(
      review.comment,
    ),
  };
}

function normalizeProfile(
  profile: {
    id: unknown;
    business_name?: unknown;
  },
): ProfileViewModel {
  return {
    id: asNumber(profile.id),
    businessName: asString(
      profile.business_name,
      "Professional profile",
    ),
  };
}

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

function formatDate(
  value: string,
): string {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

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
    },
  ).format(date);
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: unknown;
          };
        };
      }
    ).response;

    const detail =
      response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (
      typeof detail === "number" ||
      typeof detail === "boolean"
    ) {
      return String(detail);
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

/*
|--------------------------------------------------------------------------
| Rating Stars
|--------------------------------------------------------------------------
*/

function RatingStars({
  rating,
}: {
  rating: number;
}) {
  const roundedRating = Math.max(
    0,
    Math.min(
      5,
      Math.round(rating),
    ),
  );

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${roundedRating} out of 5 stars`}
    >
      {[0, 1, 2, 3, 4].map(
        (index) => (
          <Star
            key={index}
            className={[
              "h-4 w-4",
              index < roundedRating
                ? "fill-current text-[var(--fixit-warning)]"
                : "text-slate-300",
            ].join(" ")}
          />
        ),
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Professional Reviews Page
|--------------------------------------------------------------------------
*/

export default function ProfessionalReviewsPage() {
  /*
  |--------------------------------------------------------------------------
  | Profile
  |--------------------------------------------------------------------------
  */

  const profileQuery =
    useQuery({
      queryKey: [
        "professional-profile",
      ],
      queryFn:
        getProfessionalProfile,
    });

  const profileId =
    profileQuery.data?.id;

  /*
  |--------------------------------------------------------------------------
  | Reviews
  |--------------------------------------------------------------------------
  */

  const reviewsQuery =
    useQuery({
      queryKey: [
        "professional-reviews",
        profileId,
      ],
      queryFn: () =>
        getProfessionalReviews(
          Number(profileId),
        ),
      enabled:
        typeof profileId === "number" &&
        Number.isFinite(profileId),
    });

  /*
  |--------------------------------------------------------------------------
  | Normalize
  |--------------------------------------------------------------------------
  */

  const profile: ProfileViewModel | null =
    profileQuery.data
      ? normalizeProfile(
          profileQuery.data,
        )
      : null;

  const reviews: ReviewViewModel[] =
    (
      reviewsQuery.data ?? []
    ).map(
      (review) =>
        normalizeReview(
          review,
        ),
    );

  /*
  |--------------------------------------------------------------------------
  | Calculations
  |--------------------------------------------------------------------------
  */

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (
            total,
            review,
          ) =>
            total +
            review.rating,
          0,
        ) /
        reviews.length
      : 0;

  const roundedAverage =
    Math.round(
      averageRating,
    );

  /*
  |--------------------------------------------------------------------------
  | Profile Loading
  |--------------------------------------------------------------------------
  */

  if (
    profileQuery.isLoading
  ) {
    return (
      <ReviewsLoadingState />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Profile Error
  |--------------------------------------------------------------------------
  */

  if (
    profileQuery.isError ||
    profile === null
  ) {
    return (
      <ReviewsErrorState
        message={getErrorMessage(
          profileQuery.error,
        )}
        onRetry={() =>
          profileQuery.refetch()
        }
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-7">
      {/* ================================================================
          HERO
          ================================================================ */}

      <section className="relative overflow-hidden rounded-[30px] bg-[var(--fixit-primary-active)] px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10 lg:px-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--fixit-secondary)] opacity-20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-[var(--fixit-primary-hover)] opacity-20 blur-3xl" />

        <div className="relative max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">
            <MessageSquareText
              size={13}
            />

            Customer feedback
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
            Your work gets
            <span className="block text-[var(--fixit-secondary)]">
              a voice.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
            See how customers have rated your
            completed services and use their
            feedback to understand the experience
            you're delivering.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Average rating
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {reviews.length > 0
                  ? averageRating.toFixed(
                      1,
                    )
                  : "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-[var(--fixit-secondary)]/15 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Total reviews
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {reviews.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Profile
              </p>

              <p className="mt-1 max-w-[180px] truncate text-sm font-bold text-white">
                {profile.businessName}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SUMMARY
          ================================================================ */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Rating */}

        <div className="rounded-[24px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
            Overall rating
          </p>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-warning-soft)]">
              <Star
                size={25}
                className="fill-current text-[var(--fixit-warning)]"
              />
            </div>

            <div>
              <p className="text-3xl font-bold tracking-tight text-[var(--fixit-text-dark)]">
                {reviews.length > 0
                  ? averageRating.toFixed(
                      1,
                    )
                  : "—"}
              </p>

              <div className="mt-1">
                <RatingStars
                  rating={
                    roundedAverage
                  }
                />
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-[var(--fixit-text-muted)]">
            Based on reviews currently
            associated with your professional
            profile.
          </p>
        </div>

        {/* Review Count */}

        <div className="rounded-[24px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
            Review volume
          </p>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
              <MessageSquareText
                size={23}
              />
            </div>

            <div>
              <p className="text-3xl font-bold tracking-tight text-[var(--fixit-text-dark)]">
                {reviews.length}
              </p>

              <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                customer{" "}
                {reviews.length ===
                1
                  ? "review"
                  : "reviews"}
              </p>
            </div>
          </div>
        </div>

        {/* Profile */}

        <div className="rounded-[24px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
            Professional profile
          </p>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
              <UserRound
                size={23}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-[var(--fixit-text-dark)]">
                {profile.businessName}
              </p>

              <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                Professional #
                {String(
                  profile.id,
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          REVIEWS
          ================================================================ */}

      <section className="rounded-[26px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
              Recent feedback
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
              Customer reviews
            </h2>

            <p className="mt-1 text-sm leading-5 text-[var(--fixit-text-muted)]">
              Ratings and comments left after
              completed services.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
            <MessageSquareText
              size={18}
            />
          </div>
        </div>

        {/* Review query error */}

        {reviewsQuery.isError && (
          <div className="mt-6 rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
              We couldn't load customer reviews.
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
              {getErrorMessage(
                reviewsQuery.error,
              )}
            </p>

            <button
              type="button"
              onClick={() =>
                reviewsQuery.refetch()
              }
              className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-[var(--fixit-primary)] px-3 text-xs font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)]"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading */}

        {reviewsQuery.isLoading ? (
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-[var(--fixit-border)] p-5"
                >
                  <div className="h-4 w-28 rounded bg-[var(--fixit-background)]" />

                  <div className="mt-3 h-3 w-40 rounded bg-[var(--fixit-background)]" />

                  <div className="mt-5 h-16 rounded-xl bg-[var(--fixit-background)]" />
                </div>
              ),
            )}
          </div>
        ) : reviews.length ===
          0 && !reviewsQuery.isError ? (
          /* Empty */

          <div className="mt-6 rounded-[22px] border border-dashed border-[var(--fixit-border)] px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
              <UserRound
                size={23}
              />
            </div>

            <h3 className="mt-5 text-base font-semibold text-[var(--fixit-text-dark)]">
              No reviews yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
              Customer reviews will appear here
              after customers leave feedback on
              your completed services.
            </p>
          </div>
        ) : (
          /* Review List */

          <div className="mt-6 space-y-4">
            {reviews.map(
              (review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-[var(--fixit-border)] p-5 transition hover:border-[var(--fixit-primary)]/25 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <RatingStars
                          rating={
                            review.rating
                          }
                        />

                        <span className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                          {String(
                            review.rating,
                          )}
                          /5
                        </span>

                        {review.rating >=
                          4 && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--fixit-success)]">
                            <CheckCircle2
                              size={11}
                            />
                            Positive
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-xs text-[var(--fixit-text-muted)]">
                        {`Booking #${String(
                          review.bookingId,
                        )}`}{" "}
                        ·{" "}
                        {formatDate(
                          review.createdAt,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[var(--fixit-background)] px-4 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                      Customer comment
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--fixit-text-muted)]">
                      {review.comment.trim() !==
                      ""
                        ? review.comment
                        : "The customer did not leave a written comment."}
                    </p>
                  </div>
                </article>
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
| Loading State
|--------------------------------------------------------------------------
*/

function ReviewsLoadingState() {
  return (
    <div className="space-y-7">
      <section className="rounded-[30px] bg-[var(--fixit-primary-active)] px-6 py-10 sm:px-8 lg:px-10">
        <div className="animate-pulse">
          <div className="h-7 w-40 rounded-full bg-white/10" />

          <div className="mt-5 h-11 w-3/4 max-w-2xl rounded-xl bg-white/10" />

          <div className="mt-3 h-5 w-1/2 max-w-xl rounded bg-white/10" />

          <div className="mt-7 h-14 w-64 rounded-2xl bg-white/10" />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="animate-pulse rounded-[24px] border border-[var(--fixit-border)] bg-white p-5"
            >
              <div className="h-3 w-28 rounded bg-[var(--fixit-background)]" />

              <div className="mt-5 h-14 w-32 rounded-2xl bg-[var(--fixit-background)]" />
            </div>
          ),
        )}
      </section>

      <section className="rounded-[26px] border border-[var(--fixit-border)] bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-[var(--fixit-background)]" />

          <div className="h-3 w-64 rounded bg-[var(--fixit-background)]" />

          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="h-28 rounded-2xl bg-[var(--fixit-background)]"
              />
            ),
          )}
        </div>
      </section>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Error State
|--------------------------------------------------------------------------
*/

function ReviewsErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--fixit-error)] shadow-sm">
        <XCircle size={24} />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">
        Unable to load professional profile
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--fixit-text-muted)]">
        {message}
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