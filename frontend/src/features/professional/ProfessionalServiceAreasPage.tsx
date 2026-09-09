import {
  CheckCircle2,
  Edit3,
  MapPinned,
  Plus,
  Power,
  Trash2,
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
  createProfessionalServiceArea,
  deleteProfessionalServiceArea,
  getProfessionalServiceAreas,
  updateProfessionalServiceArea,
} from "./professionalServiceAreasApi";

/*
|--------------------------------------------------------------------------
| Local View Model
|--------------------------------------------------------------------------
*/

type ServiceAreaViewModel = {
  id: number;
  city: string;
  state: string;
  postalCode: string | null;
  radiusKm: number;
  isActive: boolean;
};

/*
|--------------------------------------------------------------------------
| Safe Normalizers
|--------------------------------------------------------------------------
*/

function asNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
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

function asNullableString(
  value: unknown,
): string | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return null;
}

function asBoolean(value: unknown): boolean {
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

function normalizeServiceArea(
  area: {
    id: unknown;
    city: unknown;
    state: unknown;
    postal_code?: unknown;
    radius_km: unknown;
    is_active: unknown;
  },
): ServiceAreaViewModel {
  return {
    id: asNumber(area.id),
    city: asString(area.city),
    state: asString(area.state),
    postalCode: asNullableString(
      area.postal_code,
    ),
    radiusKm: asNumber(area.radius_km),
    isActive: asBoolean(area.is_active),
  };
}

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

function formatRadius(value: number): string {
  if (value <= 0) {
    return "No radius";
  }

  return `${value.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    },
  )} km`;
}

function getErrorMessage(error: unknown): string {
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

    const detail = response?.data?.detail;

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
| Professional Service Areas Page
|--------------------------------------------------------------------------
*/

export default function ProfessionalServiceAreasPage() {
  const queryClient = useQueryClient();

  /*
  |--------------------------------------------------------------------------
  | Create Form
  |--------------------------------------------------------------------------
  */

  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [radius, setRadius] = useState("5");

  /*
  |--------------------------------------------------------------------------
  | Edit Form
  |--------------------------------------------------------------------------
  */

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editingCity, setEditingCity] =
    useState("");

  const [editingState, setEditingState] =
    useState("");

  const [
    editingPostalCode,
    setEditingPostalCode,
  ] = useState("");

  const [
    editingRadius,
    setEditingRadius,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Query
  |--------------------------------------------------------------------------
  */

  const areasQuery = useQuery({
    queryKey: ["professional-service-areas"],
    queryFn: getProfessionalServiceAreas,
  });

  /*
  |--------------------------------------------------------------------------
  | Create Mutation
  |--------------------------------------------------------------------------
  */

  const createMutation = useMutation({
    mutationFn: () =>
      createProfessionalServiceArea({
        city: city.trim(),
        state: state.trim(),
        postal_code:
          postalCode.trim() || null,
        radius_km: radius.trim()
          ? Number(radius)
          : 5,
      }),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["professional-service-areas"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["professional-dashboard"],
      });

      setCity("");
      setState("");
      setPostalCode("");
      setRadius("5");
    },
  });

  /*
  |--------------------------------------------------------------------------
  | Update Mutation
  |--------------------------------------------------------------------------
  */

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        city?: string | null;
        state?: string | null;
        postal_code?: string | null;
        radius_km?: number | null;
        is_active?: boolean | null;
      };
    }) =>
      updateProfessionalServiceArea(
        id,
        data,
      ),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["professional-service-areas"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["professional-dashboard"],
      });

      setEditingId(null);
    },
  });

  /*
  |--------------------------------------------------------------------------
  | Delete Mutation
  |--------------------------------------------------------------------------
  */

  const deleteMutation = useMutation({
    mutationFn:
      deleteProfessionalServiceArea,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["professional-service-areas"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["professional-dashboard"],
      });

      setEditingId(null);
    },
  });

  /*
  |--------------------------------------------------------------------------
  | Normalize API Data
  |--------------------------------------------------------------------------
  */

  const areas: ServiceAreaViewModel[] =
    (areasQuery.data ?? []).map(
      (area) =>
        normalizeServiceArea(area),
    );

  const activeCount = areas.filter(
    (area) => area.isActive,
  ).length;

  /*
  |--------------------------------------------------------------------------
  | Create Submit
  |--------------------------------------------------------------------------
  */

  function submit(
    event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const trimmedPostal = postalCode.trim();
    const numericRadius = Number(radius);

    if (!trimmedCity || !trimmedState) {
      return;
    }

    if (
      !Number.isFinite(numericRadius) ||
      numericRadius <= 0
    ) {
      return;
    }

    if (
      trimmedPostal &&
      !/^\d{6}$/.test(trimmedPostal)
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

  if (areasQuery.isLoading) {
    return <ServiceAreasLoadingState />;
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (areasQuery.isError) {
    return (
      <ServiceAreasErrorState
        message={getErrorMessage(
          areasQuery.error,
        )}
        onRetry={() =>
          areasQuery.refetch()
        }
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
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
            <MapPinned size={13} />
            Coverage
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
            Be visible where
            <span className="block text-[var(--fixit-secondary)]">
              you work best.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
            Define the cities, postal codes,
            and service radius where customers
            can request your professional services.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
                Total areas
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {areas.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-[var(--fixit-secondary)]/15 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
                Active coverage
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
                {areas.length - activeCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}

      <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* ADD AREA */}

        <div className="h-fit rounded-[26px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
              <Plus size={19} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                Add coverage
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--fixit-text)]">
                Add service area
              </h2>

              <p className="mt-1 text-sm leading-5 text-[var(--fixit-text-muted)]">
                Define where you are available
                to take customer jobs.
              </p>
            </div>
          </div>

          <form
            onSubmit={submit}
            className="mt-6 space-y-5"
          >
            <div>
              <label
                htmlFor="service-area-city"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
              >
                City
              </label>

              <input
                id="service-area-city"
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                placeholder="Borivali"
                className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-text-muted)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10"
              />
            </div>

            <div>
              <label
                htmlFor="service-area-state"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
              >
                State
              </label>

              <input
                id="service-area-state"
                value={state}
                onChange={(event) =>
                  setState(event.target.value)
                }
                placeholder="Maharashtra"
                className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-text-muted)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10"
              />
            </div>

            <div>
              <label
                htmlFor="service-area-postal"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
              >
                Postal code
                <span className="ml-1 font-normal text-[var(--fixit-text-muted)]">
                  optional
                </span>
              </label>

              <input
                id="service-area-postal"
                inputMode="numeric"
                maxLength={6}
                value={postalCode}
                onChange={(event) =>
                  setPostalCode(
                    event.target.value.replace(
                      /\D/g,
                      "",
                    ),
                  )
                }
                placeholder="400066"
                className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-text-muted)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10"
              />

              <p className="mt-1.5 text-xs leading-5 text-[var(--fixit-text-muted)]">
                Leave empty to cover the wider
                city area.
              </p>
            </div>

            <div>
              <label
                htmlFor="service-area-radius"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
              >
                Service radius
              </label>

              <div className="relative">
                <input
                  id="service-area-radius"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={radius}
                  onChange={(event) =>
                    setRadius(event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 pr-12 text-sm text-[var(--fixit-text)] outline-none transition focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--fixit-text-muted)]">
                  km
                </span>
              </div>
            </div>

            {createMutation.isError && (
              <div className="rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] p-4">
                <p className="text-sm font-semibold text-[var(--fixit-text)]">
                  We couldn't add this
                  service area.
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
                !city.trim() ||
                !state.trim()
              }
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 text-sm font-semibold !text-white transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--fixit-disabled)] disabled:!text-white"
            >
              <Plus size={15} />

              {createMutation.isPending
                ? "Adding area..."
                : "Add service area"}
            </button>
          </form>
        </div>

        {/* AREA LIST */}

        <div className="min-w-0 rounded-[26px] border border-[var(--fixit-border)] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                  <MapPinned size={17} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                    Coverage profile
                  </p>

                  <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-[var(--fixit-text)]">
                    Active coverage
                  </h2>
                </div>
              </div>

              <p className="mt-2 text-sm leading-5 text-[var(--fixit-text-muted)]">
                Manage the areas where your
                professional profile is available.
              </p>
            </div>

            <div className="w-fit rounded-xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                Areas
              </p>

              <p className="mt-0.5 text-sm font-bold text-[var(--fixit-text)]">
                {areas.length}
              </p>
            </div>
          </div>

          {areas.length === 0 ? (
            <div className="mt-6 rounded-[22px] border border-dashed border-[var(--fixit-border)] px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                <MapPinned size={23} />
              </div>

              <h3 className="mt-5 text-base font-semibold text-[var(--fixit-text)]">
                No service areas yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--fixit-text-muted)]">
                Add the locations where you
                want to accept customer
                requests.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {areas.map((area) => {
                const editing =
                  editingId === area.id;

                const areaUpdateError =
                  updateMutation.isError
                    ? updateMutation.error
                    : null;

                const areaDeleteError =
                  deleteMutation.isError
                    ? deleteMutation.error
                    : null;

                return (
                  <article
                    key={area.id}
                    className="rounded-2xl border border-[var(--fixit-border)] p-5 transition hover:border-[var(--fixit-primary)]/25 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                            Coverage area
                          </span>

                          <span className="text-base font-semibold text-[var(--fixit-text)]">
                            {area.city}, {area.state}
                          </span>

                          {area.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--fixit-success)]">
                              <CheckCircle2
                                size={12}
                              />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--fixit-text-muted)]">
                              <XCircle size={12} />
                              Inactive
                            </span>
                          )}
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-[var(--fixit-background)] px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                              Postal code
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[var(--fixit-text)]">
                              {area.postalCode ??
                                "All postal codes"}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-[var(--fixit-background)] px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                              Radius
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[var(--fixit-text)]">
                              {formatRadius(
                                area.radiusKm,
                              )}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-[var(--fixit-text-muted)]">
                          Service area #{area.id}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 xl:w-44 xl:flex-col">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(
                              area.id,
                            );

                            setEditingCity(
                              area.city,
                            );

                            setEditingState(
                              area.state,
                            );

                            setEditingPostalCode(
                              area.postalCode ??
                                "",
                            );

                            setEditingRadius(
                              String(
                                area.radiusKm,
                              ),
                            );
                          }}
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-xs font-semibold text-[var(--fixit-text)] transition hover:border-[var(--fixit-primary)]/30 hover:bg-[var(--fixit-background)] xl:flex-none"
                        >
                          <Edit3 size={14} />
                          Edit area
                        </button>

                        <button
                          type="button"
                          disabled={
                            updateMutation.isPending
                          }
                          onClick={() =>
                            updateMutation.mutate(
                              {
                                id: area.id,
                                data: {
                                  is_active:
                                    !area.isActive,
                                },
                              },
                            )
                          }
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-xs font-semibold text-[var(--fixit-text)] transition hover:border-[var(--fixit-primary)]/30 hover:bg-[var(--fixit-background)] disabled:cursor-not-allowed disabled:opacity-50 xl:flex-none"
                        >
                          <Power size={14} />

                          {area.isActive
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
                                "Remove this service area?",
                              );

                            if (confirmed) {
                              deleteMutation.mutate(
                                area.id,
                              );
                            }
                          }}
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--fixit-error)]/20 bg-white px-3 text-xs font-semibold text-[var(--fixit-error)] transition hover:bg-[var(--fixit-error-soft)] disabled:cursor-not-allowed disabled:opacity-50 xl:flex-none"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </div>

                    {editing && (
                      <div className="mt-5 rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor={`edit-city-${area.id}`}
                              className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
                            >
                              City
                            </label>

                            <input
                              id={`edit-city-${area.id}`}
                              value={editingCity}
                              onChange={(event) =>
                                setEditingCity(
                                  event.target.value,
                                )
                              }
                              className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-sm text-[var(--fixit-text)] outline-none focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-state-${area.id}`}
                              className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
                            >
                              State
                            </label>

                            <input
                              id={`edit-state-${area.id}`}
                              value={editingState}
                              onChange={(event) =>
                                setEditingState(
                                  event.target.value,
                                )
                              }
                              className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-sm text-[var(--fixit-text)] outline-none focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-postal-${area.id}`}
                              className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
                            >
                              Postal code
                            </label>

                            <input
                              id={`edit-postal-${area.id}`}
                              inputMode="numeric"
                              maxLength={6}
                              value={
                                editingPostalCode
                              }
                              onChange={(
                                event,
                              ) =>
                                setEditingPostalCode(
                                  event.target.value.replace(
                                    /\D/g,
                                    "",
                                  ),
                                )
                              }
                              className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-sm text-[var(--fixit-text)] outline-none focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-radius-${area.id}`}
                              className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
                            >
                              Radius (km)
                            </label>

                            <input
                              id={`edit-radius-${area.id}`}
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={
                                editingRadius
                              }
                              onChange={(event) =>
                                setEditingRadius(
                                  event.target.value,
                                )
                              }
                              className="h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-sm text-[var(--fixit-text)] outline-none focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary)]/10"
                            />
                          </div>

                          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingId(null)
                              }
                              className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--fixit-border)] bg-white px-5 text-sm font-semibold text-[var(--fixit-text)] transition hover:bg-[var(--fixit-background)]"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              disabled={
                                updateMutation.isPending ||
                                !editingCity.trim() ||
                                !editingState.trim()
                              }
                              onClick={() => {
                                const trimmedCity =
                                  editingCity.trim();

                                const trimmedState =
                                  editingState.trim();

                                const numericRadius =
                                  Number(
                                    editingRadius,
                                  );

                                if (
                                  !trimmedCity ||
                                  !trimmedState ||
                                  !Number.isFinite(
                                    numericRadius,
                                  ) ||
                                  numericRadius <= 0
                                ) {
                                  return;
                                }

                                const trimmedPostal =
                                  editingPostalCode.trim();

                                if (
                                  trimmedPostal &&
                                  !/^\d{6}$/.test(
                                    trimmedPostal,
                                  )
                                ) {
                                  return;
                                }

                                updateMutation.mutate(
                                  {
                                    id: area.id,
                                    data: {
                                      city:
                                        trimmedCity,
                                      state:
                                        trimmedState,
                                      postal_code:
                                        trimmedPostal ||
                                        null,
                                      radius_km:
                                        numericRadius,
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
                                : "Save changes"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {(areaUpdateError ||
                      areaDeleteError) && (
                      <div className="mt-4 rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] p-4">
                        <p className="text-sm font-semibold text-[var(--fixit-text)]">
                          We couldn't update this
                          service area.
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                          {getErrorMessage(
                            areaUpdateError ??
                              areaDeleteError,
                          )}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
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

function ServiceAreasLoadingState() {
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
        <div className="h-96 animate-pulse rounded-[26px] border border-[var(--fixit-border)] bg-white p-6">
          <div className="h-10 w-44 rounded-xl bg-[var(--fixit-background)]" />
          <div className="mt-7 h-11 rounded-xl bg-[var(--fixit-background)]" />
          <div className="mt-4 h-11 rounded-xl bg-[var(--fixit-background)]" />
          <div className="mt-4 h-11 rounded-xl bg-[var(--fixit-background)]" />
          <div className="mt-6 h-11 rounded-xl bg-[var(--fixit-background)]" />
        </div>

        <div className="space-y-3 rounded-[26px] border border-[var(--fixit-border)] bg-white p-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-[var(--fixit-border)] p-5"
            >
              <div className="h-4 w-48 rounded bg-[var(--fixit-background)]" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="h-16 rounded-2xl bg-[var(--fixit-background)]" />
                <div className="h-16 rounded-2xl bg-[var(--fixit-background)]" />
              </div>
            </div>
          ))}
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

function ServiceAreasErrorState({
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
        We couldn't load your service areas
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