import {
  AlertCircle,
  CalendarDays,
  Check,
  ClipboardList,
  Mail,
  Phone,
  RefreshCw,
  Search,
  UserCheck,
  UserRound,
  UserX,
  X,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAdminCustomers,
  updateAdminCustomerStatus,
  type AdminCustomer,
} from "./adminApi";


type CustomerFilter = "ALL" | "ACTIVE" | "INACTIVE";


function getCustomerName(customer: AdminCustomer) {
  const name = [
    customer.first_name,
    customer.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || `Customer #${customer.id}`;
}


function getInitials(customer: AdminCustomer) {
  const name = getCustomerName(customer);

  const parts = name
    .split(" ")
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}


function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}


function getApiErrorMessage(error: unknown) {
  const apiError = error as {
    response?: {
      data?: {
        detail?: string;
      };
    };
  };

  return (
    apiError.response?.data?.detail ??
    "Something went wrong. Please try again."
  );
}


/* ============================================================================
 * SKELETON
 * ========================================================================== */

function CustomersSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-surface)]">
      <div className="animate-pulse">
        <div className="h-14 border-b border-[var(--fixit-border)] bg-slate-50" />

        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[minmax(240px,1.7fr)_minmax(180px,1.1fr)_110px_110px_130px_120px] gap-4 border-b border-[var(--fixit-border)] px-5 py-5 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100" />

              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-slate-100" />
                <div className="h-3 w-24 rounded bg-slate-100" />
              </div>
            </div>

            <div className="h-4 w-36 rounded bg-slate-100" />

            <div className="h-4 w-12 rounded bg-slate-100" />

            <div className="h-4 w-12 rounded bg-slate-100" />

            <div className="h-6 w-20 rounded-full bg-slate-100" />

            <div className="h-9 w-24 rounded-lg bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}


/* ============================================================================
 * EMPTY
 * ========================================================================== */

function EmptyCustomersState({
  hasFilters,
}: {
  hasFilters: boolean;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--fixit-border)] bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--fixit-primary-soft)]">
        <UserRound
          size={22}
          className="text-[var(--fixit-primary)]"
        />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-[var(--fixit-text)]">
        {hasFilters
          ? "No customers match your filters"
          : "No customers yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-muted)]">
        {hasFilters
          ? "Try adjusting your search or status filter to find the customer you're looking for."
          : "Customer accounts will appear here once users start registering on FixIt."}
      </p>
    </div>
  );
}


/* ============================================================================
 * ERROR
 * ========================================================================== */

function CustomersErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertCircle
          size={21}
          className="text-red-600"
        />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-red-900">
        We couldn't load the customers
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-700">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
      >
        <RefreshCw size={15} />
        Try again
      </button>
    </div>
  );
}


/* ============================================================================
 * STATUS BADGE
 * ========================================================================== */

function StatusBadge({
  isActive,
}: {
  isActive: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          isActive
            ? "bg-emerald-500"
            : "bg-slate-400",
        ].join(" ")}
      />

      {isActive ? "Active" : "Inactive"}
    </span>
  );
}


/* ============================================================================
 * STATUS DIALOG
 * ========================================================================== */

function StatusDialog({
  customer,
  isUpdating,
  onCancel,
  onConfirm,
}: {
  customer: AdminCustomer;
  isUpdating: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const customerName = getCustomerName(customer);
  const nextStatus = !customer.is_active;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl border border-[var(--fixit-border)] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={[
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                nextStatus
                  ? "bg-emerald-50"
                  : "bg-amber-50",
              ].join(" ")}
            >
              {nextStatus ? (
                <UserCheck
                  size={19}
                  className="text-emerald-600"
                />
              ) : (
                <UserX
                  size={19}
                  className="text-amber-600"
                />
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--fixit-text)]">
                {nextStatus
                  ? "Activate customer?"
                  : "Deactivate customer?"}
              </h2>

              <p className="mt-1 text-sm leading-6 text-[var(--fixit-muted)]">
                {nextStatus
                  ? `${customerName} will be able to use their FixIt account again.`
                  : `${customerName} will no longer be able to sign in to FixIt while the account is inactive.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isUpdating}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-800">
            {customerName}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {customer.email}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isUpdating}
            className="rounded-lg border border-[var(--fixit-border)] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isUpdating}
            className={[
              "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60",
              nextStatus
                ? "bg-[var(--fixit-primary)] hover:bg-[var(--fixit-primary-hover)]"
                : "bg-amber-600 hover:bg-amber-700",
            ].join(" ")}
          >
            {isUpdating ? (
              <>
                <RefreshCw
                  size={15}
                  className="animate-spin"
                />
                Updating...
              </>
            ) : nextStatus ? (
              <>
                <Check size={15} />
                Activate
              </>
            ) : (
              <>
                <UserX size={15} />
                Deactivate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ============================================================================
 * PAGE
 * ========================================================================== */

export default function AdminCustomersPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] =
    useState<CustomerFilter>("ALL");
  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminCustomer | null>(null);

  const customersQuery = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: getAdminCustomers,
  });

  const statusMutation = useMutation({
    mutationFn: ({
      customerProfileId,
      isActive,
    }: {
      customerProfileId: number;
      isActive: boolean;
    }) =>
      updateAdminCustomerStatus(
        customerProfileId,
        isActive,
      ),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "customers"],
      });

      setSelectedCustomer(null);
    },
  });

  const customers = customersQuery.data ?? [];

  const counts = useMemo(() => {
    let active = 0;
    let inactive = 0;

    for (const customer of customers) {
      if (customer.is_active) {
        active += 1;
      } else {
        inactive += 1;
      }
    }

    return {
      total: customers.length,
      active,
      inactive,
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    return customers.filter((customer) => {
      const name = getCustomerName(customer)
        .toLowerCase();

      const email = customer.email.toLowerCase();

      const phone =
        customer.phone?.toLowerCase() ?? "";

      const matchesSearch =
        normalizedSearch.length === 0 ||
        name.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        phone.includes(normalizedSearch);

      const matchesStatus =
        filter === "ALL" ||
        (filter === "ACTIVE" &&
          customer.is_active) ||
        (filter === "INACTIVE" &&
          !customer.is_active);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    customers,
    filter,
    searchQuery,
  ]);

  const hasFilters =
    searchQuery.trim().length > 0 ||
    filter !== "ALL";

  const handleStatusConfirm = () => {
    if (!selectedCustomer) {
      return;
    }

    statusMutation.mutate({
      customerProfileId:
        selectedCustomer.id,
      isActive:
        !selectedCustomer.is_active,
    });
  };

  return (
    <>
      <div className="min-h-full bg-[var(--fixit-background)]">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          {/* HEADER */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fixit-primary)]">
                User Management
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--fixit-text)] sm:text-3xl">
                Customers
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fixit-muted)]">
                Manage customer accounts, monitor marketplace activity, and control account access.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                void customersQuery.refetch();
              }}
              disabled={customersQuery.isFetching}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--fixit-border)] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  customersQuery.isFetching
                    ? "animate-spin"
                    : undefined
                }
              />

              Refresh
            </button>
          </div>

          {/* KPI CARDS */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--fixit-border)] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--fixit-muted)]">
                    Total Customers
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[var(--fixit-text)]">
                    {customersQuery.isLoading
                      ? "—"
                      : counts.total}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)]">
                  <UserRound
                    size={20}
                    className="text-[var(--fixit-primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--fixit-border)] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--fixit-muted)]">
                    Active
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[var(--fixit-text)]">
                    {customersQuery.isLoading
                      ? "—"
                      : counts.active}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <UserCheck
                    size={20}
                    className="text-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--fixit-border)] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--fixit-muted)]">
                    Inactive
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[var(--fixit-text)]">
                    {customersQuery.isLoading
                      ? "—"
                      : counts.inactive}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <UserX
                    size={20}
                    className="text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TOOLBAR */}
          <div className="mt-6 rounded-2xl border border-[var(--fixit-border)] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(
                      event.target.value,
                    );
                  }}
                  placeholder="Search by name, email or phone..."
                  className="h-11 w-full rounded-lg border border-[var(--fixit-border)] bg-white pl-10 pr-4 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    ["ALL", "All"],
                    ["ACTIVE", "Active"],
                    ["INACTIVE", "Inactive"],
                  ] as const
                ).map(([value, label]) => {
                  const isSelected =
                    filter === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setFilter(value);
                      }}
                      className={[
                        "rounded-lg px-3.5 py-2 text-sm font-medium transition",
                        isSelected
                          ? "bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {filteredCustomers.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {customers.length}
                </span>{" "}
                customers
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setFilter("ALL");
                  }}
                  className="text-xs font-medium text-[var(--fixit-primary)] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* CONTENT */}
          <div className="mt-5">
            {customersQuery.isLoading ? (
              <CustomersSkeleton />
            ) : customersQuery.isError ? (
              <CustomersErrorState
                message={getApiErrorMessage(
                  customersQuery.error,
                )}
                onRetry={() => {
                  void customersQuery.refetch();
                }}
              />
            ) : filteredCustomers.length === 0 ? (
              <EmptyCustomersState
                hasFilters={hasFilters}
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[var(--fixit-border)] bg-white shadow-sm">
                {/* DESKTOP TABLE HEADER */}
                <div className="hidden overflow-x-auto lg:block">
                  <div className="min-w-[1100px]">
                    <div className="grid grid-cols-[minmax(260px,1.7fr)_minmax(200px,1.15fr)_110px_110px_120px_130px] gap-4 border-b border-[var(--fixit-border)] bg-slate-50/80 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <div>Customer</div>
                      <div>Contact</div>
                      <div>Requests</div>
                      <div>Bookings</div>
                      <div>Status</div>
                      <div className="text-right">
                        Action
                      </div>
                    </div>

                    {filteredCustomers.map(
                      (customer) => {
                        const name =
                          getCustomerName(
                            customer,
                          );

                        return (
                          <div
                            key={customer.id}
                            className="grid grid-cols-[minmax(260px,1.7fr)_minmax(200px,1.15fr)_110px_110px_120px_130px] items-center gap-4 border-b border-[var(--fixit-border)] px-5 py-4 last:border-b-0"
                          >
                            {/* CUSTOMER */}
                            <div className="flex min-w-0 items-center gap-3">
                              {customer.profile_image_url ? (
                                <img
                                  src={
                                    customer.profile_image_url
                                  }
                                  alt={name}
                                  className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                                />
                              ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--fixit-primary-soft)] text-xs font-semibold text-[var(--fixit-primary)]">
                                  {getInitials(
                                    customer,
                                  )}
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[var(--fixit-text)]">
                                  {name}
                                </p>

                                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                  <CalendarDays
                                    size={12}
                                  />
                                  Joined{" "}
                                  {formatDate(
                                    customer.created_at,
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* CONTACT */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <Mail
                                  size={14}
                                  className="shrink-0 text-slate-400"
                                />

                                <span className="truncate text-sm text-slate-700">
                                  {customer.email}
                                </span>
                              </div>

                              <div className="mt-1.5 flex items-center gap-2">
                                <Phone
                                  size={14}
                                  className="shrink-0 text-slate-400"
                                />

                                <span className="truncate text-xs text-slate-500">
                                  {customer.phone ||
                                    "No phone added"}
                                </span>
                              </div>
                            </div>

                            {/* REQUESTS */}
                            <div>
                              <div className="flex items-center gap-2">
                                <ClipboardList
                                  size={15}
                                  className="text-slate-400"
                                />

                                <span className="text-sm font-semibold text-slate-800">
                                  {customer.requests_count}
                                </span>
                              </div>
                            </div>

                            {/* BOOKINGS */}
                            <div>
                              <div className="flex items-center gap-2">
                                <UserCheck
                                  size={15}
                                  className="text-slate-400"
                                />

                                <span className="text-sm font-semibold text-slate-800">
                                  {customer.bookings_count}
                                </span>
                              </div>
                            </div>

                            {/* STATUS */}
                            <div>
                              <StatusBadge
                                isActive={
                                  customer.is_active
                                }
                              />
                            </div>

                            {/* ACTION */}
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCustomer(
                                    customer,
                                  );
                                }}
                                className={[
                                  "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition",
                                  customer.is_active
                                    ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                    : "bg-[var(--fixit-primary)] text-white hover:bg-[var(--fixit-primary-hover)]",
                                ].join(" ")}
                              >
                                {customer.is_active ? (
                                  <>
                                    <UserX
                                      size={14}
                                    />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck
                                      size={14}
                                    />
                                    Activate
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* MOBILE / TABLET CARDS */}
                <div className="divide-y divide-[var(--fixit-border)] lg:hidden">
                  {filteredCustomers.map(
                    (customer) => {
                      const name =
                        getCustomerName(customer);

                      return (
                        <div
                          key={customer.id}
                          className="p-4 sm:p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              {customer.profile_image_url ? (
                                <img
                                  src={
                                    customer.profile_image_url
                                  }
                                  alt={name}
                                  className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                                />
                              ) : (
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--fixit-primary-soft)] text-xs font-semibold text-[var(--fixit-primary)]">
                                  {getInitials(
                                    customer,
                                  )}
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[var(--fixit-text)]">
                                  {name}
                                </p>

                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                  {customer.email}
                                </p>
                              </div>
                            </div>

                            <StatusBadge
                              isActive={
                                customer.is_active
                              }
                            />
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-xl bg-slate-50 px-3 py-3">
                              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Requests
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                {customer.requests_count}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 px-3 py-3">
                              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Bookings
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                {customer.bookings_count}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 px-3 py-3">
                              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Phone
                              </p>

                              <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                {customer.phone ||
                                  "—"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 px-3 py-3">
                              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Joined
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                {formatDate(
                                  customer.created_at,
                                )}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(
                                customer,
                              );
                            }}
                            className={[
                              "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition",
                              customer.is_active
                                ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "bg-[var(--fixit-primary)] text-white hover:bg-[var(--fixit-primary-hover)]",
                            ].join(" ")}
                          >
                            {customer.is_active ? (
                              <>
                                <UserX
                                  size={15}
                                />
                                Deactivate Customer
                              </>
                            ) : (
                              <>
                                <UserCheck
                                  size={15}
                                />
                                Activate Customer
                              </>
                            )}
                          </button>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <StatusDialog
          customer={selectedCustomer}
          isUpdating={statusMutation.isPending}
          onCancel={() => {
            if (!statusMutation.isPending) {
              setSelectedCustomer(null);
            }
          }}
          onConfirm={handleStatusConfirm}
        />
      )}
    </>
  );
}