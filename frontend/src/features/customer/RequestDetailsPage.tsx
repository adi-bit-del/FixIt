import { useMemo } from "react";
import type { ReactNode } from "react";

import {
  useQueries,
  useQuery,
} from "@tanstack/react-query";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { getCustomerAddresses } from "./addressesApi";
import { getCustomerRequest } from "./requestApi";
import { getProfessionals } from "./professionalsApi";

import type { CustomerAddress } from "../../types/address";
import type { ProfessionalDiscovery } from "../../types/professional";

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

const serviceVisualMap: Record<string, string> = {
  "ac repair": acRepair,
  "air conditioner repair": acRepair,
  "air conditioning": acRepair,
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

export default function RequestDetailsPage() {
  const {
    requestId: requestIdParam,
  } = useParams();

  const requestId = Number(
    requestIdParam
  );

  const requestQuery = useQuery({
    queryKey: [
      "customer",
      "request",
      requestId,
    ],
    queryFn: () =>
      getCustomerRequest(requestId),
    enabled:
      Number.isFinite(requestId),
  });

  const request =
    requestQuery.data ?? null;

  const relatedQueries = useQueries({
    queries: [
      {
        queryKey: [
          "customer",
          "addresses",
        ],
        queryFn:
          getCustomerAddresses,
        enabled:
          request !== null,
      },
      {
        queryKey: [
          "professionals",
          "request-service",
          request?.service_id,
        ],
        queryFn: () =>
          getProfessionals({
            serviceId:
              request!.service_id,
          }),
        enabled:
          request !== null,
      },
    ],
  });

  const addresses =
    (relatedQueries[0].data as
      | CustomerAddress[]
      | undefined) ?? [];

  const professionals =
    (relatedQueries[1].data as
      | ProfessionalDiscovery[]
      | undefined) ?? [];

  const address = useMemo(() => {
    if (!request) {
      return null;
    }

    return (
      addresses.find(
        (item) =>
          item.id ===
          request.address_id
      ) ?? null
    );
  }, [addresses, request]);

  const professional = useMemo(() => {
    if (!request) {
      return null;
    }

    return (
      professionals.find(
        (item) =>
          item.id ===
          request.professional_profile_id
      ) ?? null
    );
  }, [professionals, request]);

  const isLoading =
    requestQuery.isLoading ||
    relatedQueries.some(
      (query) =>
        query.isLoading
    );

  const hasError =
    requestQuery.isError ||
    relatedQueries.some(
      (query) =>
        query.isError
    );

  if (!Number.isFinite(requestId)) {
    return <InvalidRequestState />;
  }

  if (isLoading) {
    return <PageLoadingState />;
  }

  if (hasError || !request) {
    return <DataErrorState />;
  }

  const serviceName =
    professional?.service_name ??
    `Service #${request.service_id}`;

  const serviceImage =
    getServiceImage(serviceName);

  const professionalImage =
    professional?.profile_image_url ||
    getFallbackProfessionalImage(
      request.professional_profile_id
    );

  const isTerminal =
    request.status === "REJECTED" ||
    request.status === "CANCELLED";

  return (
    <div className="space-y-8">
      {/* ============================================================
          BACK
      ============================================================ */}

      <Link
        to="/customer/requests"
        className="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-[var(--fixit-text-muted)] transition hover:text-[var(--fixit-primary)]"
      >
        <ArrowLeft size={16} />
        Back to requests
      </Link>

      {/* ============================================================
          HEADER
      ============================================================ */}

      <section className="overflow-hidden rounded-[var(--fixit-radius-xl)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] shadow-[var(--fixit-shadow-md)]">
        <div className="grid items-center lg:grid-cols-[1fr_340px]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--fixit-primary-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--fixit-primary)]">
                <FileText size={14} />
                Request #{request.id}
              </span>

              <StatusBadge
                status={request.status}
              />
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              {serviceName}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)] sm:text-base">
              Your request is being tracked here. Keep an eye on
              the response, appointment details and next steps.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <MetaPill
                icon={<CalendarDays size={14} />}
                text={
                  request.preferred_date
                    ? formatDate(
                        request.preferred_date
                      )
                    : "No date selected"
                }
              />

              <MetaPill
                icon={<MapPin size={14} />}
                text={
                  address?.city ??
                  "Location pending"
                }
              />
            </div>
          </div>

          <div className="hidden min-h-[290px] items-center justify-center overflow-hidden bg-[var(--fixit-primary-soft)] p-6 lg:flex">
            <img
              src={serviceImage}
              alt={`${serviceName} service`}
              className="h-full max-h-[280px] w-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          REQUEST PROGRESS
      ============================================================ */}

      {!isTerminal && (
        <RequestProgress
          status={request.status}
        />
      )}

      {isTerminal && (
        <TerminalStatusCard
          status={request.status}
        />
      )}

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}

      <div className="grid gap-6 xl:grid-cols-[1fr_370px]">
        <div className="space-y-6">
          {/* ==========================================================
              SELECTED PROFESSIONAL
          ========================================================== */}

          <Card className="p-5 sm:p-6">
            <SectionHeading
              eyebrow="PROFESSIONAL"
              title="Who is handling your request?"
              icon={<UserRound size={18} />}
            />

            <div className="mt-6 rounded-[var(--fixit-radius-lg)] border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative shrink-0">
                  <img
                    src={professionalImage}
                    alt={
                      professional?.business_name ??
                      "Professional"
                    }
                    className="h-20 w-20 rounded-[var(--fixit-radius-lg)] object-cover"
                  />

                  <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--fixit-background)] bg-[var(--fixit-primary)] text-white">
                    <ShieldCheck size={13} />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">
                        {professional?.business_name ??
                          `Professional #${request.professional_profile_id}`}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--fixit-text-muted)]">
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2
                            size={13}
                            className="text-[var(--fixit-success)]"
                          />
                          Verified professional
                        </span>

                        {professional && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-[var(--fixit-border)]" />

                            <span>
                              {
                                professional.experience_years
                              }{" "}
                              {professional.experience_years ===
                              1
                                ? "year"
                                : "years"}{" "}
                              experience
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {professional && (
                      <div className="sm:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                          Starting from
                        </p>

                        <p className="mt-1 text-lg font-bold text-[var(--fixit-primary)]">
                          ₹
                          {formatPrice(
                            professional.price
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {professional?.bio && (
                    <p className="mt-4 max-w-2xl text-xs leading-5 text-[var(--fixit-text-muted)]">
                      {professional.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* ==========================================================
              SERVICE
          ========================================================== */}

          <Card className="overflow-hidden p-0">
            <div className="border-b border-[var(--fixit-border)] px-5 py-5 sm:px-6">
              <SectionHeading
                eyebrow="SERVICE"
                title="What you requested"
                icon={<Wrench size={18} />}
              />
            </div>

            <div className="grid items-center sm:grid-cols-[190px_1fr]">
              <div className="flex h-full min-h-[170px] items-center justify-center bg-[var(--fixit-primary-soft)] p-5">
                <img
                  src={serviceImage}
                  alt={`${serviceName} illustration`}
                  className="h-full max-h-[160px] w-full object-contain"
                />
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                  SERVICE
                </p>

                <h3 className="mt-2 text-xl font-bold tracking-tight">
                  {serviceName}
                </h3>

                <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                  Service ID #{request.service_id}
                </p>

                {request.description ? (
                  <div className="mt-5 rounded-[var(--fixit-radius-md)] bg-[var(--fixit-background)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
                      YOUR DESCRIPTION
                    </p>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--fixit-text)]">
                      {request.description}
                    </p>
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-[var(--fixit-text-muted)]">
                    No additional problem description was provided.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* ==========================================================
              LOCATION
          ========================================================== */}

          <Card className="p-5 sm:p-6">
            <SectionHeading
              eyebrow="SERVICE LOCATION"
              title="Where the service will happen"
              icon={<MapPin size={18} />}
            />

            <div className="mt-6 rounded-[var(--fixit-radius-lg)] border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-5">
              {address ? (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                    <MapPin size={17} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold">
                        {address.label}
                      </h3>

                      {address.is_default && (
                        <span className="rounded-full bg-[var(--fixit-surface)] px-2 py-1 text-[10px] font-bold text-[var(--fixit-primary)]">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="mt-2 break-words text-sm leading-6 text-[var(--fixit-text-muted)]">
                      {address.address_line_1}

                      {address.address_line_2
                        ? `, ${address.address_line_2}`
                        : ""}
                    </p>

                    {address.landmark && (
                      <p className="mt-2 text-xs text-[var(--fixit-text-muted)]">
                        Landmark: {address.landmark}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                      {address.city},{" "}
                      {address.state}{" "}
                      {address.postal_code}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm text-[var(--fixit-text-muted)]">
                  <MapPin size={17} />
                  Address information is unavailable.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ============================================================
            RIGHT SIDEBAR
        ============================================================ */}

        <aside className="space-y-6 xl:sticky xl:top-[96px] xl:self-start">
          {/* Appointment */}
          <Card className="p-5 sm:p-6">
            <SectionHeading
              eyebrow="SCHEDULE"
              title="Preferred appointment"
              icon={<CalendarDays size={18} />}
            />

            <div className="mt-6 rounded-[var(--fixit-radius-lg)] bg-[var(--fixit-background)] p-5">
              {request.preferred_date ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--fixit-primary)] text-white">
                      <CalendarDays size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        {formatDate(
                          request.preferred_date
                        )}
                      </p>

                      <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                        {formatTime(
                          request.preferred_date
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-2 border-t border-[var(--fixit-border)] pt-4 text-xs leading-5 text-[var(--fixit-text-muted)]">
                    <Clock3
                      size={14}
                      className="mt-0.5 shrink-0 text-[var(--fixit-primary)]"
                    />

                    <span>
                      This is your preferred time. The final
                      appointment can be confirmed by the
                      professional.
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3">
                  <Clock3
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--fixit-text-muted)]"
                  />

                  <p className="text-sm leading-6 text-[var(--fixit-text-muted)]">
                    No preferred appointment time was provided.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Status timeline */}
          {!isTerminal && (
            <Card className="p-5 sm:p-6">
              <SectionHeading
                eyebrow="NEXT STEPS"
                title="What happens next"
                icon={<ShieldCheck size={18} />}
              />

              <div className="mt-6">
                <TimelineStep
                  number="01"
                  title="Request sent"
                  description="Your request has been submitted."
                  active
                  completed
                />

                <TimelineStep
                  number="02"
                  title="Professional response"
                  description="The professional reviews your request and can send a quote."
                  active={
                    request.status !==
                    "PENDING"
                  }
                  completed={
                    request.status !==
                    "PENDING"
                  }
                />

                <TimelineStep
                  number="03"
                  title="Choose a quote"
                  description="Review the quote before you decide to book."
                  active={
                    request.status ===
                      "ACCEPTED" ||
                    request.status ===
                      "COMPLETED"
                  }
                  completed={
                    request.status ===
                      "ACCEPTED" ||
                    request.status ===
                      "COMPLETED"
                  }
                />

                <TimelineStep
                  number="04"
                  title="Book & pay"
                  description="Confirm the appointment and complete payment."
                  active={
                    request.status ===
                    "COMPLETED"
                  }
                  completed={
                    request.status ===
                    "COMPLETED"
                  }
                  last
                />
              </div>
            </Card>
          )}

          {/* Created */}
          <Card className="bg-[var(--fixit-background)] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--fixit-surface)] text-[var(--fixit-primary)] shadow-[var(--fixit-shadow-sm)]">
                <FileText size={16} />
              </div>

              <div>
                <p className="text-xs font-bold">
                  Request created
                </p>

                <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                  {formatDateTime(
                    request.created_at
                  )}
                </p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

/* ==========================================================================
   SECTION HEADING
   ========================================================================== */

function SectionHeading({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string;
  title: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-lg font-bold tracking-tight">
          {title}
        </h2>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
        {icon}
      </div>
    </div>
  );
}

/* ==========================================================================
   META PILL
   ========================================================================== */

function MetaPill({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--fixit-border)] bg-[var(--fixit-surface)] px-3 py-1.5 text-xs font-medium text-[var(--fixit-text-muted)]">
      <span className="text-[var(--fixit-primary)]">
        {icon}
      </span>

      {text}
    </span>
  );
}

/* ==========================================================================
   REQUEST STATUS
   ========================================================================== */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const config =
    getStatusConfig(status);

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.container}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
      />

      <span className={config.text}>
        {formatStatus(status)}
      </span>
    </span>
  );
}

/* ==========================================================================
   REQUEST PROGRESS
   ========================================================================== */

function RequestProgress({
  status,
}: {
  status: string;
}) {
  const responseComplete =
    status !== "PENDING";

  const bookingComplete =
    status === "ACCEPTED" ||
    status === "COMPLETED";

  const completed =
    status === "COMPLETED";

  return (
    <Card className="p-5 sm:p-6">
      <div className="grid gap-4 md:grid-cols-4 md:gap-0">
        <ProgressItem
          number="01"
          label="Request"
          active
          completed
        />

        <ProgressConnector
          active={
            responseComplete
          }
        />

        <ProgressItem
          number="02"
          label="Response"
          active={
            responseComplete
          }
          completed={
            responseComplete
          }
        />

        <ProgressConnector
          active={bookingComplete}
        />

        <ProgressItem
          number="03"
          label="Booking"
          active={bookingComplete}
          completed={completed}
        />

        <ProgressConnector
          active={completed}
        />

        <ProgressItem
          number="04"
          label="Completed"
          active={completed}
          completed={completed}
        />
      </div>
    </Card>
  );
}

/* ==========================================================================
   PROGRESS ITEM
   ========================================================================== */

function ProgressItem({
  number,
  label,
  active,
  completed,
}: {
  number: string;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          active
            ? "bg-[var(--fixit-primary)] text-white"
            : "bg-[var(--fixit-background)] text-[var(--fixit-disabled)]"
        }`}
      >
        {completed ? (
          <Check size={16} />
        ) : (
          number
        )}
      </div>

      <span
        className={`text-sm font-semibold ${
          active
            ? "text-[var(--fixit-text)]"
            : "text-[var(--fixit-disabled)]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/* ==========================================================================
   PROGRESS CONNECTOR
   ========================================================================== */

function ProgressConnector({
  active,
}: {
  active: boolean;
}) {
  return (
    <div
      className={`hidden h-px self-center md:block ${
        active
          ? "bg-[var(--fixit-primary)]/30"
          : "bg-[var(--fixit-border)]"
      }`}
    />
  );
}

/* ==========================================================================
   TIMELINE
   ========================================================================== */

function TimelineStep({
  number,
  title,
  description,
  active,
  completed,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  active: boolean;
  completed: boolean;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-3.5">
      {!last && (
        <div
          className={`absolute left-[16px] top-8 h-[calc(100%-4px)] w-px ${
            active
              ? "bg-[var(--fixit-primary)]/25"
              : "bg-[var(--fixit-border)]"
          }`}
        />
      )}

      <div
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          active
            ? "bg-[var(--fixit-primary)] text-white"
            : "bg-[var(--fixit-background)] text-[var(--fixit-disabled)]"
        }`}
      >
        {completed ? (
          <Check size={13} />
        ) : (
          number
        )}
      </div>

      <div className="pb-6">
        <p
          className={`text-sm font-semibold ${
            active
              ? "text-[var(--fixit-text)]"
              : "text-[var(--fixit-text-muted)]"
          }`}
        >
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ==========================================================================
   TERMINAL STATUS
   ========================================================================== */

function TerminalStatusCard({
  status,
}: {
  status: string;
}) {
  const rejected =
    status === "REJECTED";

  return (
    <Card className="border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              rejected
                ? "bg-[var(--fixit-error-soft)] text-[var(--fixit-error)]"
                : "bg-[var(--fixit-background)] text-[var(--fixit-text-muted)]"
            }`}
          >
            {rejected ? (
              <FileText size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--fixit-text-muted)]">
              Request status
            </p>

            <h2 className="mt-1 text-sm font-bold">
              {rejected
                ? "The professional rejected this request."
                : "This request was cancelled."}
            </h2>

            <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
              You can return to services and choose another professional.
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>
    </Card>
  );
}

/* ==========================================================================
   LOADING
   ========================================================================== */

function PageLoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-sm text-[var(--fixit-text-muted)]">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
          <svg
            className="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="3"
              className="opacity-25"
            />

            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        Loading request...
      </div>
    </div>
  );
}

/* ==========================================================================
   INVALID
   ========================================================================== */

function InvalidRequestState() {
  return (
    <div className="rounded-[var(--fixit-radius-xl)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] px-6 py-16 text-center shadow-[var(--fixit-shadow-sm)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
        <FileText size={22} />
      </div>

      <h2 className="mt-5 text-xl font-bold">
        Invalid request
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
        The request link is incomplete or invalid.
      </p>

      <Link
        to="/customer"
        className="mt-6 inline-flex"
      >
        <Button variant="primary">
          Go to dashboard
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
        <FileText size={22} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-[var(--fixit-text)]">
        We couldn't load this request
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
        Make sure the FixIt backend is running and refresh the page.
      </p>

      <Link
        to="/customer"
        className="mt-6 inline-flex"
      >
        <Button variant="secondary">
          Go to dashboard
          <ArrowLeft size={16} />
        </Button>
      </Link>
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
    serviceVisualMap[
      normalizedName
    ];

  if (exactMatch) {
    return exactMatch;
  }

  if (
    normalizedName.includes("ac") ||
    normalizedName.includes(
      "air conditioner"
    )
  ) {
    return acRepair;
  }

  if (
    normalizedName.includes("plumb")
  ) {
    return plumbing;
  }

  if (
    normalizedName.includes(
      "electric"
    )
  ) {
    return electrical;
  }

  if (
    normalizedName.includes("clean")
  ) {
    return cleaning;
  }

  if (
    normalizedName.includes(
      "carpent"
    )
  ) {
    return carpentry;
  }

  if (
    normalizedName.includes("paint")
  ) {
    return painting;
  }

  if (
    normalizedName.includes(
      "appliance"
    )
  ) {
    return applianceRepair;
  }

  if (
    normalizedName.includes(
      "furniture"
    )
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
   PROFESSIONAL FALLBACK
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
   STATUS
   ========================================================================== */

function getStatusConfig(
  status: string
) {
  switch (status) {
    case "ACCEPTED":
      return {
        container:
          "border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)]",
        dot:
          "bg-[var(--fixit-success)]",
        text:
          "text-[var(--fixit-success)]",
      };

    case "REJECTED":
      return {
        container:
          "border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)]",
        dot:
          "bg-[var(--fixit-error)]",
        text:
          "text-[var(--fixit-error)]",
      };

    case "CANCELLED":
      return {
        container:
          "border-[var(--fixit-border)] bg-[var(--fixit-background)]",
        dot:
          "bg-[var(--fixit-disabled)]",
        text:
          "text-[var(--fixit-text-muted)]",
      };

    case "COMPLETED":
      return {
        container:
          "border-[var(--fixit-primary)]/20 bg-[var(--fixit-primary-soft)]",
        dot:
          "bg-[var(--fixit-primary)]",
        text:
          "text-[var(--fixit-primary)]",
      };

    default:
      return {
        container:
          "border-[var(--fixit-warning)]/20 bg-[var(--fixit-warning-soft)]",
        dot:
          "bg-[var(--fixit-warning)]",
        text:
          "text-[var(--fixit-warning)]",
      };
  }
}

function formatStatus(
  status: string
) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

/* ==========================================================================
   FORMATTING
   ========================================================================== */

function formatPrice(
  value: string
) {
  const numericValue =
    Number(value);

  if (
    Number.isNaN(numericValue)
  ) {
    return value;
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  ).format(numericValue);
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(new Date(value));
}

function formatTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(value));
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