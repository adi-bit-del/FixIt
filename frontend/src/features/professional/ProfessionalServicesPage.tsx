import {
  CheckCircle2,
  Edit3,
  MoreHorizontal,
  Plus,
  Power,
  Wrench,
  XCircle,
} from "lucide-react";

import {
  useState,
  type SubmitEvent,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createProfessionalService,
  deleteProfessionalService,
  getProfessionalServices,
  updateProfessionalService,
} from "./professionalServicesApi";

/*
|--------------------------------------------------------------------------
| Local View Model
|--------------------------------------------------------------------------
*/

type ServiceViewModel = {
  id: number;
  serviceId: number;
  customPrice: number | null;
  isActive: boolean;
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

function asNullableNumber(
  value: unknown,
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function asBoolean(
  value: unknown,
): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  return false;
}

function normalizeService(
  service: {
    id: unknown;
    service_id: unknown;
    custom_price?: unknown;
    is_active: unknown;
  },
): ServiceViewModel {
  return {
    id: asNumber(service.id),
    serviceId: asNumber(
      service.service_id,
    ),
    customPrice:
      asNullableNumber(
        service.custom_price,
      ),
    isActive: asBoolean(
      service.is_active,
    ),
  };
}

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

function formatAmount(
  value: number,
): string {
  return value.toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
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

    if (
      typeof detail === "string" &&
      detail.trim()
    ) {
      return detail;
    }

    if (
      typeof detail === "number" ||
      typeof detail === "boolean"
    ) {
      return String(detail);
    }
  }

  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Something went wrong.";
}

/*
|--------------------------------------------------------------------------
| Professional Services Page
|--------------------------------------------------------------------------
*/

export default function ProfessionalServicesPage() {
  const queryClient =
    useQueryClient();

  /*
  |--------------------------------------------------------------------------
  | Form State
  |--------------------------------------------------------------------------
  */

  const [serviceId, setServiceId] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [
    editingId,
    setEditingId,
  ] = useState<number | null>(
    null,
  );

  const [
    editingPrice,
    setEditingPrice,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Services Query
  |--------------------------------------------------------------------------
  */

  const servicesQuery =
    useQuery({
      queryKey: [
        "professional-services",
      ],
      queryFn:
        getProfessionalServices,
    });

  /*
  |--------------------------------------------------------------------------
  | Create
  |--------------------------------------------------------------------------
  */

  const createMutation =
    useMutation({
      mutationFn: () =>
        createProfessionalService({
          service_id:
            Number(serviceId),
          custom_price: price
            ? Number(price)
            : null,
        }),

      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: [
            "professional-services",
          ],
        });

        void queryClient.invalidateQueries({
          queryKey: [
            "professional-dashboard",
          ],
        });

        setServiceId("");
        setPrice("");
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Update
  |--------------------------------------------------------------------------
  */

  const updateMutation =
    useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number;
        data: {
          custom_price?: number | null;
          is_active?: boolean | null;
        };
      }) =>
        updateProfessionalService(
          id,
          data,
        ),

      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: [
            "professional-services",
          ],
        });

        void queryClient.invalidateQueries({
          queryKey: [
            "professional-dashboard",
          ],
        });

        setEditingId(null);
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  const deleteMutation =
    useMutation({
      mutationFn:
        deleteProfessionalService,

      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: [
            "professional-services",
          ],
        });

        void queryClient.invalidateQueries({
          queryKey: [
            "professional-dashboard",
          ],
        });
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Normalize Response
  |--------------------------------------------------------------------------
  */

  const services: ServiceViewModel[] =
    (
      servicesQuery.data ?? []
    ).map(
      (service) =>
        normalizeService(
          service,
        ),
    );

  const activeCount =
    services.filter(
      (service) =>
        service.isActive,
    ).length;

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  function submit(
    event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const numericServiceId =
      Number(serviceId);

    const numericPrice =
      price
        ? Number(price)
        : null;

    if (
      !serviceId ||
      !Number.isInteger(
        numericServiceId,
      ) ||
      numericServiceId <= 0
    ) {
      return;
    }

    if (
      numericPrice !== null &&
      (!Number.isFinite(
        numericPrice,
      ) ||
        numericPrice <= 0)
    ) {
      return;
    }

    createMutation.mutate();
  }

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (
    servicesQuery.isLoading
  ) {
    return (
      <ServicesLoadingState />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (
    servicesQuery.isError
  ) {
    return (
      <ServicesErrorState
        message={getErrorMessage(
          servicesQuery.error,
        )}
        onRetry={() =>
          void servicesQuery.refetch()
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
      {/* HERO */}

      <section className="relative overflow-hidden rounded-[30px] bg-[var(--fixit-primary-active)] px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10 lg:px-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--fixit-secondary)] opacity-20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-[var(--fixit-primary-hover)] opacity-20 blur-3xl" />

        <div className="relative max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">
            <Wrench size={13} />
            Your expertise
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
            Build the services
            <span className="block text-[var(--fixit-secondary)]">
              customers can find you for.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
            Manage the services you offer,
            set custom pricing where needed,
            and control which services are
            currently available to customers.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
                Total services
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {services.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-[var(--fixit-secondary)]/15 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
                Active
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {activeCount}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
                Inactive
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {services.length -
                  activeCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}

      <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* ADD SERVICE */}

        <div className="h-fit rounded-[26px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
              <Plus size={19} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                Add offering
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--fixit-text)]">
                Add service
              </h2>

              <p className="mt-1 text-sm leading-5 text-[var(--fixit-text-muted)]">
                Add a FixIt service to your
                professional profile.
              </p>
            </div>
          </div>

          <form
            onSubmit={submit}
            className="mt-6 space-y-5"
          >
            <div>
              <label
                htmlFor="professional-service-id"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
              >
                Service ID
              </label>

              <input
                id="professional-service-id"
                type="number"
                min="1"
                step="1"
                value={serviceId}
                onChange={(event) =>
                  setServiceId(
                    event.target.value,
                  )
                }
                placeholder="Example: 4"
                className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-text-muted)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10"
              />

              <p className="mt-1.5 text-xs leading-5 text-[var(--fixit-text-muted)]">
                Use the ID of an existing
                FixIt service.
              </p>
            </div>

            <div>
              <label
                htmlFor="professional-service-price"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
              >
                Custom price
                <span className="ml-1 font-normal text-[var(--fixit-text-muted)]">
                  optional
                </span>
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--fixit-text-muted)]">
                  ₹
                </span>

                <input
                  id="professional-service-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(event) =>
                    setPrice(
                      event.target.value,
                    )
                  }
                  placeholder="Use default pricing"
                  className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white pl-8 pr-3 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-text-muted)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10"
                />
              </div>

              <p className="mt-1.5 text-xs leading-5 text-[var(--fixit-text-muted)]">
                Leave empty to use the service's
                default pricing.
              </p>
            </div>

            {createMutation.isError && (
              <div className="rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] p-4">
                <p className="text-sm font-semibold text-[var(--fixit-text)]">
                  We couldn't add this service.
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                  {getErrorMessage(
                    createMutation.error,
                  )}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                !serviceId
              }
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 text-sm font-semibold !text-white transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--fixit-disabled)] disabled:!text-white"
            >
              <Plus size={15} />

              {createMutation.isPending
                ? "Adding service..."
                : "Add service"}
            </button>
          </form>
        </div>

        {/* SERVICE LIST */}

        <div className="min-w-0 rounded-[26px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                  <Wrench size={17} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                    Service catalogue
                  </p>

                  <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-[var(--fixit-text)]">
                    Offered services
                  </h2>
                </div>
              </div>

              <p className="mt-2 text-sm leading-5 text-[var(--fixit-text-muted)]">
                Manage the services currently
                attached to your profile.
              </p>
            </div>

            <div className="w-fit rounded-xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                Total
              </p>

              <p className="mt-0.5 text-sm font-bold text-[var(--fixit-text)]">
                {services.length}
              </p>
            </div>
          </div>

          {services.length === 0 ? (
            <div className="mt-6 rounded-[22px] border border-dashed border-[var(--fixit-border)] px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                <Wrench size={23} />
              </div>

              <h3 className="mt-5 text-base font-semibold text-[var(--fixit-text)]">
                No services added yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--fixit-text-muted)]">
                Add your first FixIt service to
                start receiving relevant
                customer requests.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {services.map(
                (service) => {
                  const isEditing =
                    editingId ===
                    service.id;

                  const updateError =
                    updateMutation.isError
                      ? updateMutation.error
                      : null;

                  const deleteError =
                    deleteMutation.isError
                      ? deleteMutation.error
                      : null;

                  return (
                    <article
                      key={service.id}
                      className="rounded-2xl border border-[var(--fixit-border)] p-5 transition hover:border-[var(--fixit-primary)]/25 hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                              Service
                            </span>

                            <span className="text-sm font-semibold text-[var(--fixit-text)]">
                              #
                              {String(
                                service.serviceId,
                              )}
                            </span>

                            {service.isActive ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--fixit-success)]">
                                <CheckCircle2
                                  size={12}
                                />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--fixit-text-muted)]">
                                <XCircle
                                  size={12}
                                />
                                Inactive
                              </span>
                            )}
                          </div>

                          <h3 className="mt-2 text-base font-semibold text-[var(--fixit-text)]">
                            FixIt service
                          </h3>

                          <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                            Professional service #
                            {String(
                              service.id,
                            )}
                          </p>

                          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--fixit-background)] px-3.5 py-2.5">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                              Pricing
                            </span>

                            <span className="text-sm font-bold text-[var(--fixit-text)]">
                              {service.customPrice !==
                              null
                                ? `₹${formatAmount(
                                    service.customPrice,
                                  )}`
                                : "Default price"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:w-44 xl:flex-col">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(
                                service.id,
                              );

                              setEditingPrice(
                                service.customPrice !==
                                  null
                                  ? String(
                                      service.customPrice,
                                    )
                                  : "",
                              );
                            }}
                            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-xs font-semibold text-[var(--fixit-text)] transition hover:border-[var(--fixit-primary)]/30 hover:bg-[var(--fixit-background)] xl:flex-none"
                          >
                            <Edit3 size={14} />
                            Edit price
                          </button>

                          <button
                            type="button"
                            disabled={
                              updateMutation.isPending
                            }
                            onClick={() =>
                              updateMutation.mutate(
                                {
                                  id: service.id,
                                  data: {
                                    is_active:
                                      !service.isActive,
                                  },
                                },
                              )
                            }
                            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-xs font-semibold text-[var(--fixit-text)] transition hover:border-[var(--fixit-primary)]/30 hover:bg-[var(--fixit-background)] disabled:cursor-not-allowed disabled:bg-[var(--fixit-background)] disabled:text-[var(--fixit-text-muted)] xl:flex-none"
                          >
                            <Power size={14} />

                            {service.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            type="button"
                            disabled={
                              deleteMutation.isPending
                            }
                            onClick={() => {
                              const confirmed =
                                window.confirm(
                                  "Remove this service from your professional profile?",
                                );

                              if (confirmed) {
                                deleteMutation.mutate(
                                  service.id,
                                );
                              }
                            }}
                            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--fixit-error)]/20 bg-white px-3 text-xs font-semibold text-[var(--fixit-error)] transition hover:bg-[var(--fixit-error-soft)] disabled:cursor-not-allowed disabled:bg-[var(--fixit-background)] disabled:text-[var(--fixit-text-muted)] xl:flex-none"
                          >
                            <XCircle size={14} />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Edit price */}

                      {isEditing && (
                        <div className="mt-5 rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-4">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                            <div className="flex-1">
                              <label
                                htmlFor={`edit-price-${service.id}`}
                                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
                              >
                                Custom price
                              </label>

                              <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--fixit-text-muted)]">
                                  ₹
                                </span>

                                <input
                                  id={`edit-price-${service.id}`}
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={
                                    editingPrice
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    setEditingPrice(
                                      event.target
                                        .value,
                                    )
                                  }
                                  className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white pl-8 pr-3 text-sm text-[var(--fixit-text)] outline-none transition focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10"
                                />
                              </div>

                              <p className="mt-1.5 text-xs text-[var(--fixit-text-muted)]">
                                Leave empty to restore
                                default pricing.
                              </p>
                            </div>

                            <button
                              type="button"
                              disabled={
                                updateMutation.isPending
                              }
                              onClick={() => {
                                const value =
                                  editingPrice.trim()
                                    ? Number(
                                        editingPrice,
                                      )
                                    : null;

                                if (
                                  value !== null &&
                                  (!Number.isFinite(
                                    value,
                                  ) ||
                                    value <= 0)
                                ) {
                                  return;
                                }

                                updateMutation.mutate(
                                  {
                                    id: service.id,
                                    data: {
                                      custom_price:
                                        value,
                                    },
                                  },
                                );
                              }}
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-5 text-sm font-semibold !text-white transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--fixit-disabled)] disabled:!text-white"
                            >
                              <CheckCircle2
                                size={15}
                              />

                              {updateMutation.isPending
                                ? "Saving..."
                                : "Save price"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setEditingId(
                                  null,
                                )
                              }
                              className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--fixit-border)] bg-white px-5 text-sm font-semibold text-[var(--fixit-text)] transition hover:bg-[var(--fixit-background)]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Mutation errors */}

                      {(updateError ||
                        deleteError) && (
                        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] p-4">
                          <MoreHorizontal
                            size={16}
                            className="mt-0.5 shrink-0 text-[var(--fixit-error)]"
                          />

                          <div>
                            <p className="text-sm font-semibold text-[var(--fixit-text)]">
                              We couldn't update this
                              service.
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                              {getErrorMessage(
                                updateError ??
                                  deleteError,
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                },
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Loading State
|--------------------------------------------------------------------------
*/

function ServicesLoadingState() {
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

      <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="h-80 animate-pulse rounded-[26px] border border-[var(--fixit-border)] bg-white p-6">
          <div className="h-10 w-40 rounded-xl bg-[var(--fixit-background)]" />

          <div className="mt-6 h-11 rounded-xl bg-[var(--fixit-background)]" />

          <div className="mt-4 h-11 rounded-xl bg-[var(--fixit-background)]" />

          <div className="mt-6 h-11 rounded-xl bg-[var(--fixit-background)]" />
        </div>

        <div className="space-y-3 rounded-[26px] border border-[var(--fixit-border)] bg-white p-6">
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-[var(--fixit-border)] p-5"
              >
                <div className="h-4 w-40 rounded bg-[var(--fixit-background)]" />

                <div className="mt-3 h-3 w-28 rounded bg-[var(--fixit-background)]" />

                <div className="mt-5 h-10 w-32 rounded-xl bg-[var(--fixit-background)]" />
              </div>
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

function ServicesErrorState({
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

      <h2 className="mt-5 text-lg font-semibold text-[var(--fixit-text)]">
        We couldn't load your services
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