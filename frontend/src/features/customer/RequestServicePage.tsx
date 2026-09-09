import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type SubmitEvent,
} from "react";

import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  Plus,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { getCustomerAddresses } from "./addressesApi";

import {
  createServiceRequest,
} from "./requestServiceApi";

import {
  getProfessionals,
} from "./professionalsApi";

import type { CustomerAddress } from "../../types/address";

import type {
  ProfessionalDiscovery,
} from "../../types/professional";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

import acRepair from "../../assets/ac-repair.png";
import plumbing from "../../assets/plumbing.png";
import electrical from "../../assets/electrical.png";
import cleaning from "../../assets/cleaning.png";
import carpentry from "../../assets/carpentry.png";
import painting from "../../assets/painting.png";
import applianceRepair from "../../assets/appliance-repair.png";
import furnitureAssembly from "../../assets/furniture-assembly.png";
import pestControl from "../../assets/pest-control.png";
import homeMaintenance from "../../assets/home-maintenance.png";

import professional01 from "../../assets/professional-01.jpg";
import professional02 from "../../assets/professional-02.jpg";
import professional03 from "../../assets/professional-03.jpg";
import professional04 from "../../assets/professional-04.jpg";
import professional05 from "../../assets/professional-05.jpg";
import professional06 from "../../assets/professional-06.jpg";

const serviceVisualMap: Record<
  string,
  string
> = {
  "ac repair": acRepair,
  "air conditioner repair": acRepair,
  plumbing,
  "plumbing service": plumbing,
  electrical,
  "electrical service": electrical,
  carpentry,
  "carpentry service": carpentry,
  painting,
  "painting service": painting,
  cleaning,
  "cleaning service": cleaning,
  "appliance repair": applianceRepair,
  "furniture assembly": furnitureAssembly,
  "pest control": pestControl,
  "home maintenance": homeMaintenance,
  "home repairs": homeMaintenance,
};

const professionalFallbacks = [
  professional01,
  professional02,
  professional03,
  professional04,
  professional05,
  professional06,
];

export default function RequestServicePage() {
  const navigate = useNavigate();

  const {
    professionalId: professionalIdParam,
  } = useParams();

  const [searchParams] =
    useSearchParams();

  const professionalId = Number(
    professionalIdParam
  );

  const serviceIdParam =
    searchParams.get("service_id");

  const serviceId = serviceIdParam
    ? Number(serviceIdParam)
    : NaN;

  const [selectedAddressId, setSelectedAddressId] =
    useState<number | null>(null);

  const [description, setDescription] =
    useState("");

  const [preferredDate, setPreferredDate] =
    useState("");

  const professionalQuery =
    useQuery({
      queryKey: [
        "request-professional",
        professionalId,
        serviceId,
      ],

      queryFn: () =>
        getProfessionals({
          serviceId,
        }),

      enabled:
        Number.isFinite(professionalId) &&
        Number.isFinite(serviceId),
    });

  const addressesQuery =
    useQuery({
      queryKey: [
        "customer",
        "addresses",
      ],
      queryFn: getCustomerAddresses,
    });

  const professional =
    useMemo<ProfessionalDiscovery | null>(
      () => {
        const professionals =
          professionalQuery.data ?? [];

        return (
          professionals.find(
            (item) =>
              item.id === professionalId
          ) ?? null
        );
      },
      [
        professionalQuery.data,
        professionalId,
      ]
    );

  const addresses =
    useMemo(
      () =>
        [
          ...(addressesQuery.data ?? []),
        ].sort(
          (first, second) =>
            Number(second.is_default) -
            Number(first.is_default)
        ),
      [addressesQuery.data]
    );

  const defaultAddress =
    useMemo(
      () =>
        addresses.find(
          (address) =>
            address.is_default
        ),
      [addresses]
    );

  useEffect(() => {
    if (
      selectedAddressId === null &&
      defaultAddress
    ) {
      setSelectedAddressId(
        defaultAddress.id
      );
    }
  }, [
    defaultAddress,
    selectedAddressId,
  ]);

  const createRequestMutation =
    useMutation({
      mutationFn:
        createServiceRequest,

      onSuccess: (
        serviceRequest
      ) => {
        navigate(
          `/customer/requests/${serviceRequest.id}`,
          {
            replace: true,
          }
        );
      },
    });

  function handleSubmit(
  event: SubmitEvent<HTMLFormElement>
) {
    event.preventDefault();

    if (
      !Number.isFinite(professionalId) ||
      !Number.isFinite(serviceId)
    ) {
      return;
    }

    if (
      selectedAddressId === null
    ) {
      return;
    }

    createRequestMutation.mutate(
      {
        professional_profile_id:
          professionalId,

        service_id:
          serviceId,

        address_id:
          selectedAddressId,

        description:
          description.trim() || null,

        preferred_date:
          preferredDate
            ? new Date(
                preferredDate
              ).toISOString()
            : null,
      }
    );
  }

  if (
    professionalQuery.isLoading ||
    addressesQuery.isLoading
  ) {
    return <PageLoadingState />;
  }

  if (
    professionalQuery.isError ||
    addressesQuery.isError
  ) {
    return <DataErrorState />;
  }

  if (
    !Number.isFinite(
      professionalId
    ) ||
    !Number.isFinite(serviceId) ||
    !professional
  ) {
    return <InvalidRequestState />;
  }

  const serviceImage =
    getServiceImage(
      professional.service_name
    );

  const professionalImage =
    professional.profile_image_url ||
    getFallbackProfessionalImage(
      professional.id
    );

  return (
    <div className="space-y-8">
      {/* ============================================================
          BACK
      ============================================================ */}

      <Link
        to={`/customer/professionals?service_id=${serviceId}`}
        className="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-[var(--fixit-text-muted)] transition hover:text-[var(--fixit-primary)]"
      >
        <ArrowLeft size={16} />
        Back to professionals
      </Link>

      {/* ============================================================
          HEADER
      ============================================================ */}

      <section className="overflow-hidden rounded-[var(--fixit-radius-xl)] border border-[var(--fixit-border)] bg-[var(--fixit-primary)] text-white shadow-[var(--fixit-shadow-md)]">
        <div className="grid items-center lg:grid-cols-[1fr_0.55fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-bold tracking-[0.16em] text-white/65">
              SERVICE REQUEST
            </p>

            <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              Let's get the job started.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              Confirm the service, choose where the work
              needs to happen and tell the professional
              what you need.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <HeaderPill>
                <CheckCircle2 size={14} />
                Professional selected
              </HeaderPill>

              <HeaderPill>
                <ShieldCheck size={14} />
                Request first, quote next
              </HeaderPill>
            </div>
          </div>

          <div className="hidden h-full min-h-[260px] items-center justify-center overflow-hidden bg-white/5 p-6 lg:flex">
            <img
              src={serviceImage}
              alt={`${professional.service_name} service`}
              className="h-auto max-h-[280px] w-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          MAIN FORM
      ============================================================ */}

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1fr_370px]"
      >
        <div className="space-y-6">
          {/* ==========================================================
              PROFESSIONAL + SERVICE
          ========================================================== */}

          <Card className="overflow-hidden p-0">
            <div className="border-b border-[var(--fixit-border)] px-5 py-5 sm:px-6">
              <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
                YOUR SELECTION
              </p>

              <h2 className="mt-2 text-xl font-bold tracking-tight">
                Service and professional
              </h2>
            </div>

            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr]">
              {/* Service */}
              <div className="overflow-hidden rounded-[var(--fixit-radius-lg)] border border-[var(--fixit-border)] bg-[var(--fixit-background)]">
                <div className="flex h-36 items-center justify-center bg-[var(--fixit-primary-soft)] p-4">
                  <img
                    src={serviceImage}
                    alt={`${professional.service_name} illustration`}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                    SERVICE
                  </p>

                  <h3 className="mt-1 text-base font-bold">
                    {professional.service_name}
                  </h3>

                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                        Starting from
                      </p>

                      <p className="mt-1 text-lg font-bold text-[var(--fixit-primary)]">
                        ₹
                        {formatPrice(
                          professional.price
                        )}
                      </p>
                    </div>

                    <Wrench
                      size={18}
                      className="text-[var(--fixit-primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div className="rounded-[var(--fixit-radius-lg)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                  PROFESSIONAL
                </p>

                <div className="mt-4 flex gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={professionalImage}
                      alt={
                        professional.business_name
                      }
                      className="h-20 w-20 rounded-[var(--fixit-radius-lg)] object-cover"
                    />

                    <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--fixit-surface)] bg-[var(--fixit-primary)] text-white">
                      <ShieldCheck size={13} />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-bold tracking-tight">
                      {professional.business_name}
                    </h3>

                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--fixit-text-muted)]">
                      <CheckCircle2
                        size={13}
                        className="text-[var(--fixit-success)]"
                      />

                      Verified professional
                    </div>

                    <p className="mt-2 text-xs text-[var(--fixit-text-muted)]">
                      {professional.experience_years}{" "}
                      {professional.experience_years ===
                      1
                        ? "year"
                        : "years"}{" "}
                      experience
                    </p>
                  </div>
                </div>

                {professional.bio && (
                  <p className="mt-5 rounded-lg bg-[var(--fixit-background)] p-3 text-xs leading-5 text-[var(--fixit-text-muted)]">
                    {professional.bio}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* ==========================================================
              ADDRESS
          ========================================================== */}

          <Card className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
                  SERVICE LOCATION
                </p>

                <h2 className="mt-2 text-xl font-bold tracking-tight">
                  Where should we come?
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--fixit-text-muted)]">
                  Select the address where you want this
                  service completed.
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                <MapPin size={18} />
              </div>
            </div>

            {addresses.length === 0 ? (
              <div className="mt-6 rounded-[var(--fixit-radius-lg)] border border-dashed border-[var(--fixit-border)] bg-[var(--fixit-background)] px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--fixit-surface)] text-[var(--fixit-primary)] shadow-[var(--fixit-shadow-sm)]">
                  <MapPin size={19} />
                </div>

                <p className="mt-4 text-sm font-bold">
                  No saved addresses yet
                </p>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[var(--fixit-text-muted)]">
                  Add an address before sending your service
                  request.
                </p>

                <Link
                  to="/customer/profile"
                  className="mt-5 inline-flex"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                  >
                    <Plus size={15} />
                    Add address
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {addresses.map(
                  (address) => (
                    <AddressOption
                      key={address.id}
                      address={address}
                      selected={
                        selectedAddressId ===
                        address.id
                      }
                      onSelect={() =>
                        setSelectedAddressId(
                          address.id
                        )
                      }
                    />
                  )
                )}
              </div>
            )}

            {addresses.length > 0 &&
              selectedAddressId === null && (
                <p className="mt-4 text-xs font-medium text-[var(--fixit-error)]">
                  Please select a service address to continue.
                </p>
              )}
          </Card>

          {/* ==========================================================
              PROBLEM DETAILS
          ========================================================== */}

          <Card className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
                  JOB DETAILS
                </p>

                <h2 className="mt-2 text-xl font-bold tracking-tight">
                  What needs to be done?
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--fixit-text-muted)]">
                  Give the professional enough context to
                  understand the problem before arriving.
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                <Wrench size={18} />
              </div>
            </div>

            <div className="mt-6">
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                rows={6}
                maxLength={2000}
                placeholder="Example: The AC is running but not cooling properly. It started yesterday and makes a strange sound..."
                className="w-full resize-none rounded-[var(--fixit-radius-md)] border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-4 py-3.5 text-sm leading-6 text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-text-muted)] focus:border-[var(--fixit-primary)] focus:bg-[var(--fixit-surface)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
              />

              <div className="mt-2 flex items-center justify-between gap-4">
                <p className="text-xs text-[var(--fixit-text-muted)]">
                  More detail can help the professional prepare.
                </p>

                <span className="shrink-0 text-xs font-medium text-[var(--fixit-text-muted)]">
                  {description.length}/2000
                </span>
              </div>
            </div>
          </Card>

          {/* ==========================================================
              SCHEDULING
          ========================================================== */}

          <Card className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
                  SCHEDULING
                </p>

                <h2 className="mt-2 text-xl font-bold tracking-tight">
                  When would you like the service?
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--fixit-text-muted)]">
                  Choose a preferred date and time. The
                  professional can confirm the appointment.
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                <CalendarDays size={18} />
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="preferred-date"
                className="mb-2 block text-sm font-semibold"
              >
                Preferred date & time
              </label>

              <input
                id="preferred-date"
                type="datetime-local"
                value={preferredDate}
                onChange={(event) =>
                  setPreferredDate(
                    event.target.value
                  )
                }
                min={getMinimumDateTime()}
                className="h-12 w-full rounded-[var(--fixit-radius-md)] border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-4 text-sm text-[var(--fixit-text)] outline-none transition focus:border-[var(--fixit-primary)] focus:bg-[var(--fixit-surface)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
              />

              <div className="mt-3 flex items-start gap-2 rounded-lg bg-[var(--fixit-background)] px-3 py-2.5 text-xs leading-5 text-[var(--fixit-text-muted)]">
                <Clock3
                  size={14}
                  className="mt-0.5 shrink-0 text-[var(--fixit-primary)]"
                />

                <span>
                  This is your preferred time. The final
                  appointment is confirmed with the
                  professional.
                </span>
              </div>
            </div>
          </Card>

          {/* ==========================================================
              MUTATION ERROR
          ========================================================== */}

          {createRequestMutation.isError && (
            <section
              role="alert"
              className="rounded-[var(--fixit-radius-md)] border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-5 py-4"
            >
              <p className="text-sm font-semibold text-[var(--fixit-error)]">
                We couldn't create your request.
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                {getApiErrorMessage(
                  createRequestMutation.error
                )}
              </p>
            </section>
          )}
        </div>

        {/* ==============================================================
            REQUEST SUMMARY
        ============================================================== */}

        <aside className="xl:sticky xl:top-[96px] xl:self-start">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-[var(--fixit-border)] bg-[var(--fixit-background)] px-5 py-5 sm:px-6">
              <p className="text-xs font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
                REQUEST SUMMARY
              </p>

              <h2 className="mt-2 text-xl font-bold tracking-tight">
                Review before sending
              </h2>
            </div>

            <div className="p-5 sm:p-6">
              {/* Service mini card */}
              <div className="flex gap-3 rounded-[var(--fixit-radius-md)] border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-3">
                <img
                  src={serviceImage}
                  alt=""
                  aria-hidden="true"
                  className="h-14 w-14 rounded-xl bg-[var(--fixit-primary-soft)] object-contain"
                />

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                    SERVICE
                  </p>

                  <p className="mt-1 truncate text-sm font-bold">
                    {professional.service_name}
                  </p>

                  <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                    From ₹
                    {formatPrice(
                      professional.price
                    )}
                  </p>
                </div>
              </div>

              <div className="my-6 h-px bg-[var(--fixit-border)]" />

              <div className="space-y-5">
                <SummaryRow
                  label="Professional"
                  value={
                    professional.business_name
                  }
                />

                <SummaryRow
                  label="Service address"
                  value={
                    selectedAddressId !== null
                      ? getSelectedAddressLabel(
                          addresses,
                          selectedAddressId
                        )
                      : "Not selected"
                  }
                />

                <SummaryRow
                  label="Preferred time"
                  value={
                    preferredDate
                      ? formatDateTime(
                          preferredDate
                        )
                      : "Not selected"
                  }
                />
              </div>

              <div className="my-6 h-px bg-[var(--fixit-border)]" />

              {/* Request explanation */}
              <div className="rounded-[var(--fixit-radius-md)] bg-[var(--fixit-primary-soft)] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--fixit-surface)] text-[var(--fixit-primary)] shadow-[var(--fixit-shadow-sm)]">
                    <ShieldCheck size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[var(--fixit-text)]">
                      No payment yet
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                      Sending this request does not charge you.
                      The professional reviews the request and
                      can send a quote.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={
                  createRequestMutation.isPending
                }
                disabled={
                  selectedAddressId === null
                }
                className="mt-6 w-full"
              >
                Send service request

                {!createRequestMutation.isPending && (
                  <ArrowRight size={17} />
                )}
              </Button>

              <p className="mt-3 text-center text-[11px] leading-5 text-[var(--fixit-text-muted)]">
                Your preferred date and time can be confirmed
                or adjusted by the professional.
              </p>
            </div>
          </Card>
        </aside>
      </form>
    </div>
  );
}

/* ==========================================================================
   ADDRESS
   ========================================================================== */

function AddressOption({
  address,
  selected,
  onSelect,
}: {
  address: CustomerAddress;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-[var(--fixit-radius-lg)] border p-4 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--fixit-primary-ring)]",
        selected
          ? "border-[var(--fixit-primary)] bg-[var(--fixit-primary-soft)] shadow-[var(--fixit-shadow-sm)]"
          : "border-[var(--fixit-border)] bg-[var(--fixit-surface)] hover:border-[var(--fixit-primary)]/30 hover:bg-[var(--fixit-background)]",
      ].join(" ")}
    >
      <div className="flex gap-3">
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            selected
              ? "bg-[var(--fixit-primary)] text-white"
              : "bg-[var(--fixit-background)] text-[var(--fixit-text-muted)]",
          ].join(" ")}
        >
          {selected ? (
            <Check size={17} />
          ) : (
            <MapPin size={17} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-bold text-[var(--fixit-text)]">
              {address.label}
            </p>

            {address.is_default && (
              <span className="shrink-0 rounded-full bg-[var(--fixit-surface)] px-2 py-1 text-[10px] font-bold text-[var(--fixit-primary)] shadow-[var(--fixit-shadow-sm)]">
                Default
              </span>
            )}
          </div>

          <p className="mt-1 break-words text-xs leading-5 text-[var(--fixit-text-muted)]">
            {address.address_line_1}

            {address.address_line_2
              ? `, ${address.address_line_2}`
              : ""}
          </p>

          <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
            {address.city},{" "}
            {address.state}{" "}
            {address.postal_code}
          </p>
        </div>
      </div>
    </button>
  );
}

/* ==========================================================================
   SUMMARY ROW
   ========================================================================== */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <span className="shrink-0 text-xs font-medium text-[var(--fixit-text-muted)]">
        {label}
      </span>

      <span className="max-w-[62%] break-words text-right text-sm font-semibold text-[var(--fixit-text)]">
        {value}
      </span>
    </div>
  );
}

/* ==========================================================================
   HEADER PILL
   ========================================================================== */

function HeaderPill({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur">
      {children}
    </span>
  );
}

/* ==========================================================================
   LOADING
   ========================================================================== */

function PageLoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-[var(--fixit-text-muted)]">
        <LoaderCircle
          size={18}
          className="animate-spin text-[var(--fixit-primary)]"
        />

        Loading request details...
      </div>
    </div>
  );
}

/* ==========================================================================
   INVALID REQUEST
   ========================================================================== */

function InvalidRequestState() {
  return (
    <div className="rounded-[var(--fixit-radius-xl)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] px-6 py-16 text-center shadow-[var(--fixit-shadow-sm)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
        <Wrench size={22} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-[var(--fixit-text)]">
        Request details are incomplete
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
        Please return to professional discovery and choose a
        professional again.
      </p>

      <Link
        to="/customer/professionals"
        className="mt-6 inline-flex"
      >
        <Button variant="primary">
          Browse professionals
          <ArrowRight size={16} />
        </Button>
      </Link>
    </div>
  );
}

/* ==========================================================================
   DATA ERROR
   ========================================================================== */

function DataErrorState() {
  return (
    <div
      role="alert"
      className="rounded-[var(--fixit-radius-xl)] border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-6 py-16 text-center"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-surface)] text-[var(--fixit-error)] shadow-[var(--fixit-shadow-sm)]">
        <Wrench size={22} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-[var(--fixit-text)]">
        We couldn't load this request page
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
        Make sure the FixIt backend is running and refresh the
        page.
      </p>
    </div>
  );
}

/* ==========================================================================
   SERVICE IMAGE
   ========================================================================== */

function getServiceImage(
  serviceName: string
) {
  const normalizedName =
    serviceName.trim().toLowerCase();

  const exactMatch =
    serviceVisualMap[normalizedName];

  if (exactMatch) {
    return exactMatch;
  }

  if (
    normalizedName.includes("ac") ||
    normalizedName.includes("air conditioner")
  ) {
    return acRepair;
  }

  if (
    normalizedName.includes("plumb")
  ) {
    return plumbing;
  }

  if (
    normalizedName.includes("electric")
  ) {
    return electrical;
  }

  if (
    normalizedName.includes("clean")
  ) {
    return cleaning;
  }

  if (
    normalizedName.includes("carpent")
  ) {
    return carpentry;
  }

  if (
    normalizedName.includes("paint")
  ) {
    return painting;
  }

  if (
    normalizedName.includes("appliance")
  ) {
    return applianceRepair;
  }

  if (
    normalizedName.includes("furniture")
  ) {
    return furnitureAssembly;
  }

  if (
    normalizedName.includes("pest")
  ) {
    return pestControl;
  }

  return homeMaintenance;
}

/* ==========================================================================
   PROFESSIONAL FALLBACK IMAGE
   ========================================================================== */

function getFallbackProfessionalImage(
  professionalId: number
) {
  const index =
    Math.abs(professionalId) %
    professionalFallbacks.length;

  return professionalFallbacks[index];
}

/* ==========================================================================
   FORMATTING
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

function getMinimumDateTime() {
  const now = new Date();

  now.setMinutes(
    now.getMinutes() -
      now.getTimezoneOffset()
  );

  return now
    .toISOString()
    .slice(0, 16);
}

function formatDateTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

function getSelectedAddressLabel(
  addresses: CustomerAddress[],
  selectedAddressId: number
) {
  const address =
    addresses.find(
      (item) =>
        item.id === selectedAddressId
    );

  return address
    ? address.label
    : "Not selected";
}

function getApiErrorMessage(
  error: unknown
) {
  const apiError = error as {
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