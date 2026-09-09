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
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  MessageSquareText,
  Search,
  Star,
  UserRound,
} from "lucide-react";

import {
  createCustomerReview,
  getCustomerReviews,
  type ReviewResponse,
} from "./reviewsApi";

import {
  getCustomerBookings,
  type BookingResponse,
} from "./bookingsApi";


/*
|--------------------------------------------------------------------------
| Customer Reviews Page
|--------------------------------------------------------------------------
|
| URL:
|
| /customer/reviews
|
| Features:
|
| - Display existing customer reviews
| - Find completed bookings that have not been reviewed
| - Submit a 1–5 star review
| - Add an optional comment
| - Search existing reviews
| - Responsive layout
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function CustomerReviewsPage() {
  const queryClient =
    useQueryClient();


  /*
  |--------------------------------------------------------------------------
  | Local state
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] =
    useState("");

  const [activeBookingId, setActiveBookingId] =
    useState<number | null>(null);

  const [rating, setRating] =
    useState(0);

  const [comment, setComment] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | Reviews query
  |--------------------------------------------------------------------------
  */

  const reviewsQuery =
    useQuery<ReviewResponse[]>({
      queryKey: [
        "customer",
        "reviews",
      ],
      queryFn:
        getCustomerReviews,
    });


  /*
  |--------------------------------------------------------------------------
  | Bookings query
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
  | Data
  |--------------------------------------------------------------------------
  */

  const reviews =
    reviewsQuery.data ?? [];

  const bookings =
    bookingsQuery.data ?? [];


  /*
  |--------------------------------------------------------------------------
  | Reviewed booking IDs
  |--------------------------------------------------------------------------
  */

  const reviewedBookingIds =
    useMemo(() => {
      return new Set(
        reviews.map(
          (review) =>
            review.booking_id,
        ),
      );
    }, [reviews]);


  /*
  |--------------------------------------------------------------------------
  | Completed bookings eligible for review
  |--------------------------------------------------------------------------
  */

  const reviewableBookings =
    useMemo(() => {
      return bookings
        .filter(
          (booking) =>
            booking.status ===
              "COMPLETED" &&
            !reviewedBookingIds.has(
              booking.id,
            ),
        )
        .sort(
          (first, second) =>
            new Date(
              second.scheduled_at,
            ).getTime() -
            new Date(
              first.scheduled_at,
            ).getTime(),
        );
    }, [
      bookings,
      reviewedBookingIds,
    ]);


  /*
  |--------------------------------------------------------------------------
  | Filter reviews
  |--------------------------------------------------------------------------
  */

  const filteredReviews =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();


      return [...reviews]
        .sort(
          (first, second) =>
            new Date(
              second.created_at,
            ).getTime() -
            new Date(
              first.created_at,
            ).getTime(),
        )
        .filter((review) => {

          if (
            normalizedSearch.length ===
            0
          ) {
            return true;
          }


          const searchableText = [
            `review ${review.id}`,
            `booking ${review.booking_id}`,
            `professional ${review.professional_profile_id}`,
            review.rating.toString(),
            review.comment ?? "",
          ]
            .join(" ")
            .toLowerCase();


          return searchableText.includes(
            normalizedSearch,
          );
        });
    }, [
      reviews,
      search,
    ]);


  /*
  |--------------------------------------------------------------------------
  | Create review mutation
  |--------------------------------------------------------------------------
  */

  const reviewMutation =
    useMutation<
      ReviewResponse,
      Error,
      {
        bookingId: number;
        rating: number;
        comment: string;
      }
    >({
      mutationFn: ({
        bookingId,
        rating,
        comment,
      }) =>
        createCustomerReview(
          bookingId,
          {
            rating,
            comment:
              comment.trim() ||
              null,
          },
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "customer",
            "reviews",
          ],
        });

        setActiveBookingId(
          null,
        );

        setRating(0);

        setComment("");
      },
    });


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (
    reviewsQuery.isLoading ||
    bookingsQuery.isLoading
  ) {
    return (
      <ReviewsLoadingState />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (
    reviewsQuery.isError ||
    bookingsQuery.isError
  ) {
    return (
      <ReviewsErrorState
        onRetry={() => {
          void reviewsQuery.refetch();
          void bookingsQuery.refetch();
        }}
      />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Open review form
  |--------------------------------------------------------------------------
  */

  function openReviewForm(
    bookingId: number,
  ) {
    setActiveBookingId(
      bookingId,
    );

    setRating(0);

    setComment("");

    reviewMutation.reset();
  }


  /*
  |--------------------------------------------------------------------------
  | Close review form
  |--------------------------------------------------------------------------
  */

  function closeReviewForm() {
    if (
      reviewMutation.isPending
    ) {
      return;
    }

    setActiveBookingId(
      null,
    );

    setRating(0);

    setComment("");

    reviewMutation.reset();
  }


  /*
  |--------------------------------------------------------------------------
  | Submit review
  |--------------------------------------------------------------------------
  */

  function handleSubmitReview() {
    if (
      activeBookingId ===
      null
    ) {
      return;
    }


    if (
      rating < 1 ||
      rating > 5
    ) {
      return;
    }


    reviewMutation.mutate({
      bookingId:
        activeBookingId,
      rating,
      comment,
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

            <Star
              size={13}
            />

            <span>
              Reviews
            </span>

          </div>


          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            Your experience
            <span className="block text-[var(--fixit-secondary)]">
              helps FixIt grow.
            </span>
          </h1>


          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
            Share honest feedback about your
            completed services and help other
            customers make confident choices.
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
              placeholder="Search your reviews..."
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
          REVIEWABLE BOOKINGS
          ================================================================ */}

      <section>

        <div className="mb-5">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
            Completed services
          </p>


          <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">

            <h2 className="text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
              {reviewableBookings.length}{" "}
              {reviewableBookings.length ===
              1
                ? "service ready"
                : "services ready"}{" "}
              for review
            </h2>


            {reviews.length > 0 && (
              <p className="text-xs text-[var(--fixit-text-muted)]">
                Thank you for helping keep
                FixIt trusted.
              </p>
            )}

          </div>

        </div>


        {reviewableBookings.length ===
        0 ? (

          <div className="overflow-hidden rounded-[26px] border border-dashed border-[var(--fixit-border)] bg-white px-6 py-12">

            <div className="mx-auto flex max-w-lg flex-col items-center text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-success-soft)] text-[var(--fixit-success)]">

                <CheckCircle2
                  size={24}
                />

              </div>


              <h3 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">
                You're all caught up
              </h3>


              <p className="mt-2 text-sm leading-6 text-[var(--fixit-text-muted)]">
                There are no completed services
                waiting for a review right now.
              </p>

            </div>

          </div>

        ) : (

          <div className="grid gap-5 xl:grid-cols-2">

            {reviewableBookings.map(
              (booking) => (

                <ReviewableBookingCard
                  key={booking.id}
                  booking={booking}
                  active={
                    activeBookingId ===
                    booking.id
                  }
                  rating={
                    activeBookingId ===
                    booking.id
                      ? rating
                      : 0
                  }
                  comment={
                    activeBookingId ===
                    booking.id
                      ? comment
                      : ""
                  }
                  isSubmitting={
                    activeBookingId ===
                      booking.id &&
                    reviewMutation.isPending
                  }
                  error={
                    activeBookingId ===
                      booking.id &&
                    reviewMutation.isError
                      ? reviewMutation.error
                      : null
                  }
                  onOpen={() =>
                    openReviewForm(
                      booking.id,
                    )
                  }
                  onClose={
                    closeReviewForm
                  }
                  onRatingChange={
                    setRating
                  }
                  onCommentChange={
                    setComment
                  }
                  onSubmit={
                    handleSubmitReview
                  }
                />

              ),
            )}

          </div>

        )}

      </section>


      {/* ================================================================
          EXISTING REVIEWS
          ================================================================ */}

      <section>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
              Review history
            </p>


            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
              {filteredReviews.length}{" "}
              {filteredReviews.length ===
              1
                ? "review"
                : "reviews"}
            </h2>

          </div>

        </div>


        {filteredReviews.length ===
        0 ? (

          <ReviewsEmptyState
            hasSearch={
              search.trim().length > 0
            }
            onClear={() =>
              setSearch("")
            }
          />

        ) : (

          <div className="space-y-4">

            {filteredReviews.map(
              (review) => (

                <ReviewCard
                  key={review.id}
                  review={review}
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
| Reviewable Booking Card
|--------------------------------------------------------------------------
*/

function ReviewableBookingCard({
  booking,
  active,
  rating,
  comment,
  isSubmitting,
  error,
  onOpen,
  onClose,
  onRatingChange,
  onCommentChange,
  onSubmit,
}: {
  booking: BookingResponse;
  active: boolean;
  rating: number;
  comment: string;
  isSubmitting: boolean;
  error: Error | null;
  onOpen: () => void;
  onClose: () => void;
  onRatingChange: (
    rating: number,
  ) => void;
  onCommentChange: (
    comment: string,
  ) => void;
  onSubmit: () => void;
}) {
  return (
    <article className="group rounded-[26px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--fixit-primary)]/30 hover:shadow-lg sm:p-6">

      <div className="flex flex-col">


        {/* ============================================================
            HEADER
            ============================================================ */}

        <div className="flex items-start gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--fixit-success-soft)] text-[var(--fixit-success)]">

            <CheckCircle2
              size={20}
            />

          </div>


          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="text-base font-semibold text-[var(--fixit-text-dark)]">
                Booking #{booking.id}
              </h3>


              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--fixit-success)]">

                <span className="h-1.5 w-1.5 rounded-full bg-[var(--fixit-success)]" />

                Completed

              </span>

            </div>


            <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
              Service request #
              {booking.service_request_id}
            </p>

          </div>

        </div>


        {/* ============================================================
            BOOKING DETAILS
            ============================================================ */}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">

          <ReviewInfo
            icon={
              <CalendarDays
                size={15}
              />
            }
            label="Service date"
            value={formatDateTime(
              booking.scheduled_at,
            )}
          />


          <ReviewInfo
            icon={
              <FileText
                size={15}
              />
            }
            label="Amount"
            value={`₹${formatPrice(
              booking.amount,
            )}`}
          />

        </div>


        {/* ============================================================
            REVIEW ACTION / FORM
            ============================================================ */}

        {!active ? (

          <button
            type="button"
            onClick={onOpen}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)]"
          >

            <Star
              size={16}
              className="text-white"
            />

            Write a review

          </button>

        ) : (

          <div className="mt-6 border-t border-[var(--fixit-border)] pt-5">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                  How was your service?
                </p>

                <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                  Your feedback helps other
                  customers choose confidently.
                </p>

              </div>


              <Star
                size={20}
                className="shrink-0 text-[var(--fixit-secondary)]"
                fill="currentColor"
              />

            </div>


            {/* Stars */}

            <div className="mt-4 flex items-center gap-1">

              {[1, 2, 3, 4, 5].map(
                (star) => {

                  const selected =
                    star <=
                    rating;

                  return (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} star${star === 1 ? "" : "s"}`}
                      onClick={() =>
                        onRatingChange(
                          star,
                        )
                      }
                      className="rounded-lg p-1.5 transition hover:bg-[var(--fixit-secondary-soft)]"
                    >

                      <Star
                        size={27}
                        fill={
                          selected
                            ? "currentColor"
                            : "none"
                        }
                        className={
                          selected
                            ? "text-[var(--fixit-secondary)]"
                            : "text-[var(--fixit-border)]"
                        }
                      />

                    </button>
                  );
                },
              )}

            </div>


            <p className="mt-2 text-xs text-[var(--fixit-text-muted)]">
              {rating === 0
                ? "Select a rating from 1 to 5"
                : `${rating} out of 5`}
            </p>


            {/* Comment */}

            <div className="mt-5">

              <label
                htmlFor={`review-comment-${booking.id}`}
                className="mb-2 block text-sm font-semibold text-[var(--fixit-text-dark)]"
              >
                Comment
                <span className="ml-1 font-normal text-[var(--fixit-text-muted)]">
                  (optional)
                </span>
              </label>


              <textarea
                id={`review-comment-${booking.id}`}
                value={comment}
                onChange={(event) =>
                  onCommentChange(
                    event.target.value,
                  )
                }
                maxLength={2000}
                rows={4}
                placeholder="Tell us what went well or what could be improved..."
                className="w-full resize-none rounded-xl border border-[var(--fixit-border)] bg-white px-4 py-3 text-sm text-[var(--fixit-text-dark)] outline-none transition placeholder:text-[var(--fixit-text-muted)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-soft)]"
              />


              <div className="mt-1 text-right text-[10px] text-[var(--fixit-text-muted)]">
                {comment.length}/2000
              </div>

            </div>


            {/* Error */}

            {error && (

              <div className="mt-4 rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-4 py-3">

                <div className="flex items-start gap-3">

                  <XCircleIcon />

                  <div>

                    <p className="text-sm font-semibold text-[var(--fixit-error)]">
                      We couldn't submit your
                      review.
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


            {/* Actions */}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">

              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={
                  onClose
                }
                className="h-11 rounded-xl border border-[var(--fixit-border)] bg-white px-5 text-sm font-semibold text-[var(--fixit-text-dark)] transition hover:bg-[var(--fixit-background)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                type="button"
                disabled={
                  rating === 0 ||
                  isSubmitting
                }
                onClick={
                  onSubmit
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {isSubmitting ? (

                  <>
                    <LoaderCircle
                      size={16}
                      className="animate-spin text-white"
                    />

                    <span>
                      Submitting...
                    </span>
                  </>

                ) : (

                  <>
                    <CheckCircle2
                      size={16}
                      className="text-white"
                    />

                    <span>
                      Submit review
                    </span>
                  </>

                )}

              </button>

            </div>

          </div>

        )}

      </div>

    </article>
  );
}


/*
|--------------------------------------------------------------------------
| Review Card
|--------------------------------------------------------------------------
*/

function ReviewCard({
  review,
}: {
  review: ReviewResponse;
}) {
  return (
    <article className="group rounded-[26px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--fixit-primary)]/30 hover:shadow-lg sm:p-6">

      <div className="flex flex-col">


        {/* ============================================================
            HEADER
            ============================================================ */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div className="flex min-w-0 gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">

              <UserRound
                size={20}
              />

            </div>


            <div className="min-w-0">

              <h3 className="text-base font-semibold text-[var(--fixit-text-dark)]">
                Professional #
                {review.professional_profile_id}
              </h3>


              <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                Booking #
                {review.booking_id}
              </p>

            </div>

          </div>


          {/* Rating */}

          <div className="inline-flex w-fit items-center gap-1 rounded-xl bg-[var(--fixit-secondary-soft)] px-3 py-2">

            <span className="mr-1 text-xs font-semibold text-[var(--fixit-text-dark)]">
              {review.rating}.0
            </span>


            {[1, 2, 3, 4, 5].map(
              (star) => (

                <Star
                  key={star}
                  size={14}
                  fill={
                    star <=
                    review.rating
                      ? "currentColor"
                      : "none"
                  }
                  className={
                    star <=
                    review.rating
                      ? "text-[var(--fixit-secondary)]"
                      : "text-[var(--fixit-border)]"
                  }
                />

              ),
            )}

          </div>

        </div>


        {/* ============================================================
            COMMENT
            ============================================================ */}

        {review.comment ? (

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-4">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--fixit-text-muted)] shadow-sm">

              <MessageSquareText
                size={16}
              />

            </div>


            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--fixit-text-muted)]">
              {review.comment}
            </p>

          </div>

        ) : (

          <div className="mt-5 flex items-center gap-2 text-xs text-[var(--fixit-text-muted)]">

            <MessageSquareText
              size={15}
              className="shrink-0"
            />

            <span>
              No written comment was added.
            </span>

          </div>

        )}


        {/* ============================================================
            FOOTER
            ============================================================ */}

        <div className="mt-4 flex items-center gap-2 border-t border-[var(--fixit-border)] pt-4 text-xs text-[var(--fixit-text-muted)]">

          <Clock3
            size={14}
            className="shrink-0"
          />

          <span>
            Reviewed{" "}
            {formatDateTime(
              review.created_at,
            )}
          </span>

        </div>

      </div>

    </article>
  );
}


/*
|--------------------------------------------------------------------------
| Review Info
|--------------------------------------------------------------------------
*/

function ReviewInfo({
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
| Loading State
|--------------------------------------------------------------------------
*/

function ReviewsLoadingState() {
  return (
    <div className="space-y-7">

      <section className="rounded-[28px] bg-[var(--fixit-primary-active)] px-6 py-10 sm:px-8 lg:px-10">

        <div className="animate-pulse">

          <div className="h-7 w-20 rounded-full bg-white/10" />

          <div className="mt-5 h-10 w-3/4 max-w-2xl rounded-xl bg-white/10" />

          <div className="mt-3 h-5 w-1/2 max-w-xl rounded bg-white/10" />

          <div className="mt-7 h-14 w-full max-w-2xl rounded-2xl bg-white/10" />

        </div>

      </section>


      <div className="grid gap-5 xl:grid-cols-2">

        {Array.from({
          length: 2,
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


              <div className="mt-5 h-11 rounded-xl bg-[var(--fixit-background)]" />

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

function ReviewsEmptyState({
  hasSearch,
  onClear,
}: {
  hasSearch: boolean;
  onClear: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-dashed border-[var(--fixit-border)] bg-white px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-secondary-soft)] text-[var(--fixit-secondary)]">

        <Star
          size={23}
        />

      </div>


      <h3 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">

        {hasSearch
          ? "No matching reviews"
          : "No reviews yet"}

      </h3>


      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">

        {hasSearch
          ? "Try a different search term."
          : "Once you review a completed service, your feedback will appear here."}

      </p>


      {hasSearch && (

        <button
          type="button"
          onClick={
            onClear
          }
          className="mt-5 inline-flex items-center justify-center rounded-xl border border-[var(--fixit-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--fixit-text-dark)] transition hover:border-[var(--fixit-primary)] hover:text-[var(--fixit-primary)]"
        >
          Clear search
        </button>

      )}

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Error State
|--------------------------------------------------------------------------
*/

function ReviewsErrorState({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--fixit-error)] shadow-sm">

        <Star
          size={22}
        />

      </div>


      <h2 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">
        We couldn't load your reviews
      </h2>


      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
        Something went wrong while loading
        your review history. Please try again.
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
| Formatting
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Small error icon
|--------------------------------------------------------------------------
*/

function XCircleIcon() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--fixit-error)] shadow-sm">

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
        aria-hidden="true"
      >

        <circle
          cx="12"
          cy="12"
          r="9"
        />

        <path
          d="m9 9 6 6"
        />

        <path
          d="m15 9-6 6"
        />

      </svg>

    </div>
  );
}