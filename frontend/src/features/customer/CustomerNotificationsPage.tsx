import {
  Bell,
  Check,
  CheckCircle2,
  Info,
  Loader2,
  ServerOff,
} from "lucide-react";
import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from "./notificationsApi";

export default function CustomerNotificationsPage() {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery<Notification[]>({
    queryKey: ["customer", "notifications"],
    queryFn: () => getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["customer", "notifications"],
      });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["customer", "notifications"],
      });
    },
  });

  const notifications = notificationsQuery.data ?? [];

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.is_read,
      ).length,
    [notifications],
  );

  const groupedNotifications = useMemo(() => {
    const groups = new Map<string, Notification[]>();

    for (const notification of notifications) {
      const date = new Date(
        notification.created_at,
      );

      const key = date.toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      );

      const existing = groups.get(key);

      if (existing) {
        existing.push(notification);
      } else {
        groups.set(key, [notification]);
      }
    }

    return Array.from(groups.entries());
  }, [notifications]);

  const formatTime = (value: string): string =>
    new Date(value).toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      },
    );

  const getNotificationIcon = (
    type: string,
  ) => {
    switch (type) {
      case "PAYMENT_SUCCESSFUL":
      case "ACCOUNT_VERIFIED":
      case "REVIEW_RECEIVED":
        return <CheckCircle2 size={19} />;

      default:
        return <Info size={19} />;
    }
  };

  const isLoading = notificationsQuery.isLoading;
  const isError = notificationsQuery.isError;

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[28px] border border-[var(--fixit-border)] bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10 lg:px-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--fixit-secondary-soft)] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 right-32 h-56 w-56 rounded-full bg-[var(--fixit-primary-soft)] blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-[var(--fixit-secondary)]/20 bg-[var(--fixit-secondary-soft)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--fixit-secondary)]">
                Notifications
              </div>

              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                  <Bell size={21} />
                </div>

                <div>
                  <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--fixit-text)] sm:text-4xl lg:text-5xl">
                    Stay informed.
                    <span className="block text-[var(--fixit-secondary)]">
                      Stay on track.
                    </span>
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)] sm:text-base">
                    Keep track of important updates
                    across your requests, quotes,
                    bookings, payments, and services.
                  </p>
                </div>
              </div>
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                    Unread
                  </p>

                  <p className="mt-1 text-xl font-semibold text-[var(--fixit-text)]">
                    {unreadCount}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    markAllReadMutation.mutate()
                  }
                  disabled={
                    unreadCount === 0 ||
                    markAllReadMutation.isPending
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-[var(--fixit-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--fixit-disabled)]"
                >
                  {markAllReadMutation.isPending ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Check size={16} />
                  )}

                  Mark all read
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {isLoading && (
        <section className="overflow-hidden rounded-[26px] border border-[var(--fixit-border)] bg-white shadow-sm">
          <div className="flex min-h-[320px] items-center justify-center p-8">
            <div className="flex flex-col items-center text-center">
              <Loader2
                size={28}
                className="animate-spin text-[var(--fixit-primary)]"
              />

              <p className="mt-4 text-sm font-medium text-[var(--fixit-text)]">
                Loading notifications
              </p>

              <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
                Fetching your latest FixIt updates.
              </p>
            </div>
          </div>
        </section>
      )}

      {isError && !isLoading && (
        <section className="overflow-hidden rounded-[26px] border border-[var(--fixit-border)] bg-white shadow-sm">
          <div className="p-8 text-center sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--fixit-background)] text-[var(--fixit-text-muted)]">
              <ServerOff size={25} />
            </div>

            <h2 className="mt-5 text-xl font-semibold tracking-tight text-[var(--fixit-text)] sm:text-2xl">
              We couldn't load your notifications
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--fixit-text-muted)]">
              There was a problem connecting to the
              notification service. Please try again.
            </p>

            <button
              type="button"
              onClick={() =>
                void notificationsQuery.refetch()
              }
              className="mt-6 rounded-2xl bg-[var(--fixit-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)]"
            >
              Try again
            </button>
          </div>
        </section>
      )}

      {!isLoading &&
        !isError &&
        notifications.length === 0 && (
          <section className="overflow-hidden rounded-[26px] border border-[var(--fixit-border)] bg-white shadow-sm">
            <div className="p-8 text-center sm:p-10 lg:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--fixit-background)] text-[var(--fixit-primary)]">
                <Bell size={26} />
              </div>

              <h2 className="mt-5 text-xl font-semibold tracking-tight text-[var(--fixit-text)] sm:text-2xl">
                You're all caught up
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--fixit-text-muted)]">
                New updates about your FixIt activity
                will appear here automatically.
              </p>
            </div>
          </section>
        )}

      {!isLoading &&
        !isError &&
        notifications.length > 0 && (
          <section className="overflow-hidden rounded-[26px] border border-[var(--fixit-border)] bg-white shadow-sm">
            <div className="border-b border-[var(--fixit-border)] px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--fixit-text)]">
                    Recent activity
                  </p>

                  <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                    Your latest FixIt updates and milestones.
                  </p>
                </div>

                <div className="hidden items-center gap-2 text-xs font-medium text-[var(--fixit-text-muted)] sm:flex">
                  <span className="h-2 w-2 rounded-full bg-[var(--fixit-primary)]" />
                  {unreadCount} unread
                </div>
              </div>
            </div>

            <div className="divide-y divide-[var(--fixit-border)]">
              {groupedNotifications.map(
                ([date, items]) => (
                  <div key={date}>
                    <div className="bg-[var(--fixit-background)] px-6 py-3 sm:px-8">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                        {date}
                      </p>
                    </div>

                    <div>
                      {items.map((notification) => (
                        <article
                          key={notification.id}
                          className={[
                            "flex gap-4 px-6 py-5 sm:px-8",
                            notification.is_read
                              ? "bg-white"
                              : "bg-[var(--fixit-primary-soft)]/35",
                          ].join(" ")}
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--fixit-primary)] shadow-sm ring-1 ring-[var(--fixit-border)]">
                            {getNotificationIcon(
                              notification.type,
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-sm font-semibold text-[var(--fixit-text)] sm:text-base">
                                    {notification.title}
                                  </h3>

                                  {!notification.is_read && (
                                    <span className="rounded-full bg-[var(--fixit-primary)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                                      New
                                    </span>
                                  )}
                                </div>

                                <p className="mt-2 text-sm leading-6 text-[var(--fixit-text-muted)]">
                                  {notification.message}
                                </p>
                              </div>

                              <div className="flex shrink-0 items-center gap-3 sm:pt-1">
                                <span className="text-xs font-medium text-[var(--fixit-text-muted)]">
                                  {formatTime(
                                    notification.created_at,
                                  )}
                                </span>

                                {!notification.is_read && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      markReadMutation.mutate(
                                        notification.id,
                                      )
                                    }
                                    disabled={
                                      markReadMutation.isPending
                                    }
                                    className="rounded-xl px-3 py-2 text-xs font-semibold text-[var(--fixit-primary)] transition hover:bg-[var(--fixit-primary-soft)] disabled:cursor-not-allowed disabled:text-[var(--fixit-disabled)]"
                                  >
                                    {markReadMutation.isPending
                                      ? "Saving..."
                                      : "Mark read"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        )}
    </div>
  );
}