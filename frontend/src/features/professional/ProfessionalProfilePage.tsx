import {
  BadgeCheck,
  Building2,
  Check,
  Edit3,
  Phone,
  Save,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getProfessionalProfile,
  updateProfessionalProfile,
} from "./professionalProfileApi";

type ProfileViewModel = {
  id: number;
  businessName: string;
  bio: string;
  experienceYears: number;
  phone: string;
  profileImageUrl: string;
  verificationStatus: string;
};

type ProfileFormState = {
  businessName: string;
  bio: string;
  experienceYears: string;
  phone: string;
  profileImageUrl: string;
};

function asNumber(
  value: unknown,
  fallback = 0,
): number {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : fallback;
}

function asString(
  value: unknown,
  fallback = "",
): string {
  return typeof value === "string"
    ? value
    : fallback;
}

function normalizeProfile(
  value: unknown,
): ProfileViewModel | null {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return null;
  }

  const profile =
    value as Record<string, unknown>;

  const id = asNumber(
    profile.id,
    -1,
  );

  if (id < 0) {
    return null;
  }

  return {
    id,
    businessName: asString(
      profile.business_name,
      "Professional",
    ),
    bio: asString(profile.bio),
    experienceYears: asNumber(
      profile.experience_years,
    ),
    phone: asString(profile.phone),
    profileImageUrl: asString(
      profile.profile_image_url,
    ),
    verificationStatus: asString(
      profile.verification_status,
      "PENDING",
    ),
  };
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
  }

  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function getVerificationConfig(
  verificationStatus: string,
): {
  label: string;
  className: string;
  iconClassName: string;
} {
  switch (
    verificationStatus.toUpperCase()
  ) {
    case "VERIFIED":
      return {
        label: "Verified",
        className:
          "bg-[var(--fixit-success-soft)] text-[var(--fixit-success)] ring-1 ring-[var(--fixit-success)]/20",
        iconClassName:
          "text-[var(--fixit-success)]",
      };

    case "REJECTED":
      return {
        label: "Rejected",
        className:
          "bg-[var(--fixit-error-soft)] text-[var(--fixit-error)] ring-1 ring-[var(--fixit-error)]/20",
        iconClassName:
          "text-[var(--fixit-error)]",
      };

    default:
      return {
        label: "Pending verification",
        className:
          "bg-[var(--fixit-warning-soft)] text-[var(--fixit-warning)] ring-1 ring-[var(--fixit-warning)]/20",
        iconClassName:
          "text-[var(--fixit-warning)]",
      };
  }
}

function createFormState(
  profile: ProfileViewModel,
): ProfileFormState {
  return {
    businessName:
      profile.businessName,
    bio: profile.bio,
    experienceYears:
      profile.experienceYears > 0
        ? String(
            profile.experienceYears,
          )
        : "",
    phone: profile.phone,
    profileImageUrl:
      profile.profileImageUrl,
  };
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-[var(--fixit-border)] bg-white p-5">
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--fixit-background)] text-[var(--fixit-text-muted)]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fixit-text-muted)]">
            {label}
          </p>

          <p className="mt-1.5 break-words text-sm font-semibold text-[var(--fixit-text)]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProfessionalProfilePage() {
  const queryClient =
    useQueryClient();

  const profileQuery =
    useQuery({
      queryKey: ["professional-profile"],
      queryFn: getProfessionalProfile,
    });

  const normalizedProfile =
    useMemo(
      () =>
        normalizeProfile(
          profileQuery.data,
        ),
      [profileQuery.data],
    );

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState<ProfileFormState>({
    businessName: "",
    bio: "",
    experienceYears: "",
    phone: "",
    profileImageUrl: "",
  });

  useEffect(() => {
    if (
      !normalizedProfile ||
      editing
    ) {
      return;
    }

    setForm(
      createFormState(
        normalizedProfile,
      ),
    );
  }, [
    normalizedProfile,
    editing,
  ]);

  const updateMutation =
    useMutation({
      mutationFn:
        updateProfessionalProfile,

      onSuccess: (
        updatedProfile,
      ) => {
        queryClient.setQueryData(
          ["professional-profile"],
          updatedProfile,
        );

        void queryClient.invalidateQueries({
          queryKey: [
            "professional-dashboard",
          ],
        });

        setEditing(false);
      },
    });

  const startEditing = () => {
    if (!normalizedProfile) {
      return;
    }

    setForm(
      createFormState(
        normalizedProfile,
      ),
    );

    updateMutation.reset();
    setEditing(true);
  };

  const cancelEditing = () => {
    if (normalizedProfile) {
      setForm(
        createFormState(
          normalizedProfile,
        ),
      );
    }

    updateMutation.reset();
    setEditing(false);
  };

  const updateField = (
    field: keyof ProfileFormState,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveProfile = () => {
    const businessName =
      form.businessName.trim();

    if (!businessName) {
      return;
    }

    const parsedExperience =
      Number(
        form.experienceYears,
      );

    updateMutation.mutate({
      business_name:
        businessName,
      bio:
        form.bio.trim() || null,
      experience_years:
        Number.isFinite(
          parsedExperience,
        ) &&
        parsedExperience >= 0
          ? parsedExperience
          : 0,
      phone:
        form.phone.trim() || null,
      profile_image_url:
        form.profileImageUrl.trim() ||
        null,
    });
  };

  if (
    profileQuery.isLoading
  ) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-5">
          <div className="h-8 w-44 animate-pulse rounded-lg bg-[var(--fixit-border)]" />

          <div className="h-4 w-80 animate-pulse rounded bg-[var(--fixit-border)]" />

          <div className="overflow-hidden rounded-[28px] border border-[var(--fixit-border)] bg-white">
            <div className="h-36 animate-pulse bg-[var(--fixit-background)]" />

            <div className="space-y-5 p-6 sm:p-8">
              <div className="h-20 animate-pulse rounded-[20px] bg-[var(--fixit-background)]" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-24 animate-pulse rounded-[20px] bg-[var(--fixit-background)]" />
                <div className="h-24 animate-pulse rounded-[20px] bg-[var(--fixit-background)]" />
                <div className="h-24 animate-pulse rounded-[20px] bg-[var(--fixit-background)]" />
                <div className="h-24 animate-pulse rounded-[20px] bg-[var(--fixit-background)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    profileQuery.isError ||
    !normalizedProfile
  ) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--fixit-error)]">
            Professional Portal
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--fixit-text)]">
            Unable to load your profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)]">
            {getErrorMessage(
              profileQuery.error,
            )}
          </p>

          <button
            type="button"
            onClick={() =>
              void profileQuery.refetch()
            }
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const verification =
    getVerificationConfig(
      normalizedProfile.verificationStatus,
    );

  return (
    <div className="min-h-full bg-[var(--fixit-background)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--fixit-primary)]">
              Professional Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--fixit-text)] sm:text-3xl">
              Profile
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)]">
              Keep your professional
              information accurate so
              customers know who they are
              booking.
            </p>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fixit-primary-hover)]"
            >
              <Edit3 className="h-4 w-4" />
              Edit profile
            </button>
          )}
        </div>

        <section className="overflow-hidden rounded-[28px] border border-[var(--fixit-border)] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
          <div className="relative overflow-hidden bg-[var(--fixit-primary-active)] px-5 py-7 sm:px-8 sm:py-9">
            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[var(--fixit-secondary)] opacity-15" />

            <div className="pointer-events-none absolute -bottom-24 right-24 h-40 w-40 rounded-full bg-[var(--fixit-primary-hover)] opacity-15" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
              {normalizedProfile.profileImageUrl ? (
                <img
                  src={
                    normalizedProfile.profileImageUrl
                  }
                  alt={
                    normalizedProfile.businessName
                  }
                  className="h-24 w-24 shrink-0 rounded-[24px] object-cover shadow-lg ring-4 ring-white/20"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[24px] bg-white/10 text-white shadow-lg ring-4 ring-white/10">
                  <Building2 className="h-10 w-10" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="break-words text-2xl font-bold tracking-tight text-white">
                    {
                      normalizedProfile.businessName
                    }
                  </h2>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${verification.className}`}
                  >
                    <BadgeCheck
                      className={`h-3.5 w-3.5 ${verification.iconClassName}`}
                    />
                    {verification.label}
                  </span>
                </div>

                <p className="mt-2 text-sm text-white/75">
                  Professional profile #
                  {normalizedProfile.id}
                </p>
              </div>
            </div>
          </div>

          {editing ? (
            <div className="p-5 sm:p-8">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[var(--fixit-text)]">
                  Edit professional information
                </h3>

                <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
                  Update the details customers see
                  on your professional profile.
                </p>
              </div>

              <div className="grid gap-5">
                <div>
                  <label
                    htmlFor="business-name"
                    className="mb-2 block text-sm font-semibold text-[var(--fixit-text)]"
                  >
                    Business name
                  </label>

                  <input
                    id="business-name"
                    value={form.businessName}
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "businessName",
                        event.target.value,
                      )
                    }
                    maxLength={150}
                    placeholder="Your business name"
                    className="w-full rounded-2xl border border-[var(--fixit-border)] bg-white px-4 py-3 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-text-muted)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-soft)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="professional-bio"
                    className="mb-2 block text-sm font-semibold text-[var(--fixit-text)]"
                  >
                    Professional bio
                  </label>

                  <textarea
                    id="professional-bio"
                    value={form.bio}
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "bio",
                        event.target.value,
                      )
                    }
                    maxLength={1000}
                    rows={5}
                    placeholder="Tell customers about your experience, expertise and the type of work you specialise in."
                    className="w-full resize-none rounded-2xl border border-[var(--fixit-border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-text-muted)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-soft)]"
                  />

                  <p className="mt-1.5 text-right text-xs text-[var(--fixit-text-muted)]">
                    {form.bio.length}/1000
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="experience-years"
                      className="mb-2 block text-sm font-semibold text-[var(--fixit-text)]"
                    >
                      Experience
                    </label>

                    <div className="relative">
                      <input
                        id="experience-years"
                        type="number"
                        min="0"
                        max="100"
                        value={
                          form.experienceYears
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            "experienceYears",
                            event.target.value,
                          )
                        }
                        placeholder="0"
                        className="w-full rounded-2xl border border-[var(--fixit-border)] bg-white px-4 py-3 pr-20 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-text-muted)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-soft)]"
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--fixit-text-muted)]">
                        years
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="professional-phone"
                      className="mb-2 block text-sm font-semibold text-[var(--fixit-text)]"
                    >
                      Phone
                    </label>

                    <input
                      id="professional-phone"
                      value={form.phone}
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          "phone",
                          event.target.value,
                        )
                      }
                      maxLength={20}
                      placeholder="Phone number"
                      className="w-full rounded-2xl border border-[var(--fixit-border)] bg-white px-4 py-3 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-text-muted)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-soft)]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="profile-image-url"
                    className="mb-2 block text-sm font-semibold text-[var(--fixit-text)]"
                  >
                    Profile image URL
                  </label>

                  <input
                    id="profile-image-url"
                    type="url"
                    value={
                      form.profileImageUrl
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "profileImageUrl",
                        event.target.value,
                      )
                    }
                    maxLength={500}
                    placeholder="https://..."
                    className="w-full rounded-2xl border border-[var(--fixit-border)] bg-white px-4 py-3 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-text-muted)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-soft)]"
                  />

                  <p className="mt-1.5 text-xs text-[var(--fixit-text-muted)]">
                    Use a publicly accessible image URL.
                  </p>
                </div>

                {updateMutation.isError && (
                  <div className="rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] p-4">
                    <p className="text-sm font-semibold text-[var(--fixit-text)]">
                      Unable to save changes
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[var(--fixit-text-muted)]">
                      {getErrorMessage(
                        updateMutation.error,
                      )}
                    </p>
                  </div>
                )}

                {updateMutation.isSuccess && (
                  <div className="flex items-center gap-2 rounded-2xl border border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] p-4 text-sm font-medium text-[var(--fixit-success)]">
                    <Check className="h-4 w-4" />
                    Profile updated successfully.
                  </div>
                )}

                <div className="flex flex-col gap-2 border-t border-[var(--fixit-border)] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={
                      updateMutation.isPending
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--fixit-border)] px-4 py-2.5 text-sm font-semibold text-[var(--fixit-text)] transition hover:bg-[var(--fixit-background)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      saveProfile
                    }
                    disabled={
                      updateMutation.isPending ||
                      !form.businessName.trim()
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />

                    {updateMutation.isPending
                      ? "Saving..."
                      : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileField
                  icon={
                    <Building2 className="h-5 w-5" />
                  }
                  label="Business name"
                  value={
                    normalizedProfile.businessName
                  }
                />

                <ProfileField
                  icon={
                    <UserRound className="h-5 w-5" />
                  }
                  label="Experience"
                  value={
                    normalizedProfile.experienceYears ===
                    1
                      ? "1 year"
                      : `${normalizedProfile.experienceYears} years`
                  }
                />

                <ProfileField
                  icon={
                    <Phone className="h-5 w-5" />
                  }
                  label="Phone"
                  value={
                    normalizedProfile.phone ||
                    "Not provided"
                  }
                />

                <ProfileField
                  icon={
                    <BadgeCheck className="h-5 w-5" />
                  }
                  label="Verification"
                  value={
                    verification.label
                  }
                />
              </div>

              <div className="mt-5 rounded-[20px] border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-[var(--fixit-primary)]" />

                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--fixit-text-muted)]">
                    About your business
                  </p>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--fixit-text-muted)]">
                  {normalizedProfile.bio ||
                    "No professional bio has been added yet."}
                </p>
              </div>

              {normalizedProfile.profileImageUrl && (
                <div className="mt-5 flex items-center justify-between gap-4 rounded-[20px] border border-[var(--fixit-border)] p-5">
                  <div>
                    <p className="text-sm font-semibold text-[var(--fixit-text)]">
                      Profile photo
                    </p>

                    <p className="mt-1 text-xs text-[var(--fixit-text-muted)]">
                      Your current professional profile image.
                    </p>
                  </div>

                  <img
                    src={
                      normalizedProfile.profileImageUrl
                    }
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-[var(--fixit-border)]"
                  />
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}