import {
  useEffect,
  useState,
  type ReactNode,
  type SubmitEvent,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  CheckCircle2,
  Home,
  LoaderCircle,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomerAddresses,
  updateCustomerAddress,
  type CustomerAddressCreate,
  type CustomerAddressUpdate,
} from "./addressesApi";

import type {
  CustomerAddress,
} from "../../types/address";

import apiClient from "../../api/client";


/*
|--------------------------------------------------------------------------
| Customer Profile Types
|--------------------------------------------------------------------------
*/

interface CustomerProfile {
  id: number;
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  profile_image_url: string | null;
}

interface CustomerProfileUpdate {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  profile_image_url: string | null;
}


/*
|--------------------------------------------------------------------------
| Profile API
|--------------------------------------------------------------------------
*/

async function getCustomerProfile(): Promise<CustomerProfile> {
  const response =
    await apiClient.get<CustomerProfile>(
      "/customer/profile",
    );

  return response.data;
}


async function updateCustomerProfile(
  data: CustomerProfileUpdate,
): Promise<CustomerProfile> {
  const response =
    await apiClient.patch<CustomerProfile>(
      "/customer/profile",
      data,
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| Customer Profile Page
|--------------------------------------------------------------------------
*/

export default function CustomerProfilePage() {
  const queryClient =
    useQueryClient();


  /*
  |--------------------------------------------------------------------------
  | Queries
  |--------------------------------------------------------------------------
  */

  const profileQuery =
    useQuery<CustomerProfile>({
      queryKey: [
        "customer",
        "profile",
      ],
      queryFn:
        getCustomerProfile,
    });


  const addressesQuery =
    useQuery<CustomerAddress[]>({
      queryKey: [
        "customer",
        "addresses",
      ],
      queryFn:
        getCustomerAddresses,
    });


  /*
  |--------------------------------------------------------------------------
  | Profile state
  |--------------------------------------------------------------------------
  */

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [profileImageUrl, setProfileImageUrl] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | Address state
  |--------------------------------------------------------------------------
  */

  const [
    addressFormOpen,
    setAddressFormOpen,
  ] = useState(false);

  const [
    editingAddressId,
    setEditingAddressId,
  ] = useState<number | null>(null);


  /*
  |--------------------------------------------------------------------------
  | Populate profile form
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const profile =
      profileQuery.data;

    if (!profile) {
      return;
    }

    setFirstName(
      profile.first_name ?? "",
    );

    setLastName(
      profile.last_name ?? "",
    );

    setPhone(
      profile.phone ?? "",
    );

    setProfileImageUrl(
      profile.profile_image_url ?? "",
    );
  }, [
    profileQuery.data,
  ]);


  /*
  |--------------------------------------------------------------------------
  | Profile mutation
  |--------------------------------------------------------------------------
  */

  const profileMutation =
    useMutation<
      CustomerProfile,
      Error,
      CustomerProfileUpdate
    >({
      mutationFn:
        updateCustomerProfile,

      onSuccess: (
        profile,
      ) => {
        queryClient.setQueryData(
          [
            "customer",
            "profile",
          ],
          profile,
        );
      },
    });


  /*
  |--------------------------------------------------------------------------
  | Create address
  |--------------------------------------------------------------------------
  */

  const createAddressMutation =
    useMutation<
      CustomerAddress,
      Error,
      CustomerAddressCreate
    >({
      mutationFn:
        createCustomerAddress,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "customer",
            "addresses",
          ],
        });

        closeAddressForm();
      },
    });


  /*
  |--------------------------------------------------------------------------
  | Update address
  |--------------------------------------------------------------------------
  */

  const updateAddressMutation =
    useMutation<
      CustomerAddress,
      Error,
      {
        addressId: number;
        data: CustomerAddressUpdate;
      }
    >({
      mutationFn: ({
        addressId,
        data,
      }) =>
        updateCustomerAddress(
          addressId,
          data,
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "customer",
            "addresses",
          ],
        });

        closeAddressForm();
      },
    });


  /*
  |--------------------------------------------------------------------------
  | Delete address
  |--------------------------------------------------------------------------
  */

  const deleteAddressMutation =
    useMutation<
      void,
      Error,
      number
    >({
      mutationFn:
        deleteCustomerAddress,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "customer",
            "addresses",
          ],
        });
      },
    });


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (
    profileQuery.isLoading ||
    addressesQuery.isLoading
  ) {
    return (
      <ProfileLoadingState />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (
    profileQuery.isError ||
    addressesQuery.isError
  ) {
    return (
      <ProfileErrorState
        onRetry={() => {
          void profileQuery.refetch();
          void addressesQuery.refetch();
        }}
      />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Safe data
  |--------------------------------------------------------------------------
  */

  const profile =
    profileQuery.data;

  const addresses =
    addressesQuery.data ?? [];


  if (!profile) {
    return (
      <ProfileErrorState
        onRetry={() => {
          void profileQuery.refetch();
        }}
      />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Save profile
  |--------------------------------------------------------------------------
  */

  function handleSaveProfile() {
    profileMutation.mutate({
      first_name:
        firstName.trim() ||
        null,

      last_name:
        lastName.trim() ||
        null,

      phone:
        phone.trim() ||
        null,

      profile_image_url:
        profileImageUrl.trim() ||
        null,
    });
  }


  /*
  |--------------------------------------------------------------------------
  | Address controls
  |--------------------------------------------------------------------------
  */

  function openCreateAddress() {
    setEditingAddressId(
      null,
    );

    setAddressFormOpen(
      true,
    );
  }


  function openEditAddress(
    addressId: number,
  ) {
    setEditingAddressId(
      addressId,
    );

    setAddressFormOpen(
      true,
    );
  }


  function closeAddressForm() {
    setAddressFormOpen(
      false,
    );

    setEditingAddressId(
      null,
    );
  }


  function handleCreateAddress(
    data: CustomerAddressCreate,
  ) {
    createAddressMutation.mutate(
      data,
    );
  }


  function handleUpdateAddress(
    data: CustomerAddressUpdate,
  ) {
    if (
      editingAddressId ===
      null
    ) {
      return;
    }

    updateAddressMutation.mutate({
      addressId:
        editingAddressId,

      data,
    });
  }


  function handleDeleteAddress(
    addressId: number,
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this address?",
      );

    if (!confirmed) {
      return;
    }

    deleteAddressMutation.mutate(
      addressId,
    );
  }


  const editingAddress =
    editingAddressId !== null
      ? (
        addresses.find(
          (address) =>
            address.id ===
            editingAddressId,
        ) ?? null
      )
      : null;


  return (
    <div className="space-y-7">


      {/* ================================================================
          PROFILE HERO
          ================================================================ */}

      <section className="relative overflow-hidden rounded-[28px] bg-[var(--fixit-primary-active)] px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10 lg:px-10">

        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--fixit-secondary)] opacity-20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 right-32 h-56 w-56 rounded-full bg-[var(--fixit-primary-hover)] opacity-20 blur-3xl" />


        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">

          {/* Avatar */}

          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-white/10 bg-white/10 shadow-inner">

            {profile.profile_image_url ? (

              <img
                src={
                  profile.profile_image_url
                }
                alt="Customer profile"
                className="h-full w-full object-cover"
              />

            ) : (

              <UserRound
                size={32}
                className="text-white/80"
              />

            )}

          </div>


          <div className="min-w-0">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">

              <UserRound
                size={12}
              />

              <span>
                Customer profile
              </span>

            </div>


            <h1 className="mt-4 break-words text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              {getDisplayName(
                profile,
              )}
            </h1>


            <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
              Keep your personal information
              and service locations up to date
              for a smoother FixIt experience.
            </p>

          </div>

        </div>

      </section>


      {/* ================================================================
          PERSONAL INFORMATION
          ================================================================ */}

      <section className="rounded-[26px] border border-[var(--fixit-border)] bg-white shadow-sm">

        <div className="p-5 sm:p-6 lg:p-7">


          {/* Header */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
                Personal information
              </p>


              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
                Your profile
              </h2>


              <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
                Update the details professionals
                may need when providing service.
              </p>

            </div>


            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] px-3 py-2 text-xs font-semibold text-[var(--fixit-success)]">

              <CheckCircle2
                size={14}
              />

              Account information

            </div>

          </div>


          {/* Fields */}

          <div className="mt-7 grid gap-5 sm:grid-cols-2">

            <ProfileField
              label="First name"
              value={firstName}
              onChange={
                setFirstName
              }
              placeholder="First name"
            />


            <ProfileField
              label="Last name"
              value={lastName}
              onChange={
                setLastName
              }
              placeholder="Last name"
            />


            <ProfileField
              label="Phone"
              value={phone}
              onChange={
                setPhone
              }
              placeholder="Phone number"
              icon={
                <Phone size={15} />
              }
            />


            <ProfileField
              label="Profile image URL"
              value={
                profileImageUrl
              }
              onChange={
                setProfileImageUrl
              }
              placeholder="https://..."
            />

          </div>


          {/* Feedback */}

          {profileMutation.isError && (

            <ProfileFeedback
              type="error"
              message={getApiErrorMessage(
                profileMutation.error,
              )}
            />

          )}


          {profileMutation.isSuccess && (

            <ProfileFeedback
              type="success"
              message="Your profile has been updated successfully."
            />

          )}


          {/* Save */}

          <div className="mt-7 flex flex-col gap-3 border-t border-[var(--fixit-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-xs leading-5 text-[var(--fixit-text-muted)]">
              Changes are saved directly to your
              FixIt customer profile.
            </p>


            <button
              type="button"
              onClick={
                handleSaveProfile
              }
              disabled={
                profileMutation.isPending
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >

              {profileMutation.isPending ? (

                <LoaderCircle
                  size={16}
                  className="animate-spin text-white"
                />

              ) : (

                <Save
                  size={16}
                  className="text-white"
                />

              )}

              <span>
                Save profile
              </span>

            </button>

          </div>

        </div>

      </section>


      {/* ================================================================
          SERVICE ADDRESSES
          ================================================================ */}

      <section className="rounded-[26px] border border-[var(--fixit-border)] bg-white shadow-sm">

        <div className="p-5 sm:p-6 lg:p-7">


          {/* Header */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
                Service addresses
              </p>


              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
                Where should we send help?
              </h2>


              <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--fixit-text-muted)]">
                Save the locations where you
                regularly need FixIt services.
              </p>

            </div>


            {!addressFormOpen && (

              <button
                type="button"
                onClick={
                  openCreateAddress
                }
                className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)]"
              >

                <Plus
                  size={15}
                />

                <span>
                  Add address
                </span>

              </button>

            )}

          </div>


          {/* Address Form */}

          {addressFormOpen && (

            <AddressForm
              address={
                editingAddress
              }
              isSubmitting={
                createAddressMutation.isPending ||
                updateAddressMutation.isPending
              }
              error={
                createAddressMutation.error ??
                updateAddressMutation.error
              }
              onCancel={
                closeAddressForm
              }
              onCreate={
                handleCreateAddress
              }
              onUpdate={
                handleUpdateAddress
              }
            />

          )}


          {/* No addresses */}

          {!addressFormOpen &&
            addresses.length ===
              0 && (

            <div className="mt-7 overflow-hidden rounded-2xl border border-dashed border-[var(--fixit-border)] bg-[var(--fixit-background)] px-6 py-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--fixit-primary)] shadow-sm">

                <MapPin
                  size={23}
                />

              </div>


              <h3 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">
                No addresses yet
              </h3>


              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
                Add a service location so
                professionals know where to
                provide help.
              </p>


              <button
                type="button"
                onClick={
                  openCreateAddress
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)]"
              >

                <Plus
                  size={15}
                />

                Add your first address

              </button>

            </div>

          )}


          {/* Address list */}

          {!addressFormOpen &&
            addresses.length >
              0 && (

            <div className="mt-7 grid gap-4">

              {addresses.map(
                (address) => (

                  <AddressCard
                    key={
                      address.id
                    }
                    address={
                      address
                    }
                    isDeleting={
                      deleteAddressMutation.isPending &&
                      deleteAddressMutation.variables ===
                        address.id
                    }
                    onEdit={() =>
                      openEditAddress(
                        address.id,
                      )
                    }
                    onDelete={() =>
                      handleDeleteAddress(
                        address.id,
                      )
                    }
                  />

                ),
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
| Profile Field
|--------------------------------------------------------------------------
*/

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder: string;
  icon?: ReactNode;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-semibold text-[var(--fixit-text-dark)]">
        {label}
      </span>


      <div className="relative">

        {icon && (

          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fixit-text-muted)]">
            {icon}
          </span>

        )}


        <input
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          placeholder={
            placeholder
          }
          className={[
            "h-11 w-full rounded-xl border border-[var(--fixit-border)] bg-white px-4 text-sm text-[var(--fixit-text-dark)] outline-none transition placeholder:text-[var(--fixit-text-muted)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-soft)]",
            icon
              ? "pl-9"
              : "",
          ].join(" ")}
        />

      </div>

    </label>
  );
}


/*
|--------------------------------------------------------------------------
| Profile Feedback
|--------------------------------------------------------------------------
*/

function ProfileFeedback({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  if (type === "success") {
    return (
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] px-4 py-3">

        <CheckCircle2
          size={17}
          className="mt-0.5 shrink-0 text-[var(--fixit-success)]"
        />


        <p className="text-sm font-medium text-[var(--fixit-success)]">
          {message}
        </p>

      </div>
    );
  }


  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-4 py-3">

      <X
        size={17}
        className="mt-0.5 shrink-0 text-[var(--fixit-error)]"
      />


      <div>

        <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
          Something went wrong.
        </p>


        <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
          {message}
        </p>

      </div>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Address Card
|--------------------------------------------------------------------------
*/

function AddressCard({
  address,
  isDeleting,
  onEdit,
  onDelete,
}: {
  address: CustomerAddress;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="group rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-4 transition hover:border-[var(--fixit-primary)]/30 hover:shadow-sm sm:p-5">

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex min-w-0 gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--fixit-primary)] shadow-sm">

            <Home
              size={18}
            />

          </div>


          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                {address.label}
              </h3>


              {address.is_default && (

                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fixit-primary)]/15 bg-[var(--fixit-primary-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--fixit-primary)]">

                  <CheckCircle2
                    size={11}
                  />

                  Default

                </span>

              )}

            </div>


            <p className="mt-2 break-words text-sm leading-6 text-[var(--fixit-text-dark)]">
              {address.address_line_1}

              {address.address_line_2
                ? `, ${address.address_line_2}`
                : ""}
            </p>


            {address.landmark && (

              <p className="mt-1.5 text-xs text-[var(--fixit-text-muted)]">
                Landmark:{" "}
                {
                  address.landmark
                }
              </p>

            )}


            <p className="mt-1.5 text-xs text-[var(--fixit-text-muted)]">
              {address.city},{" "}
              {address.state}{" "}
              {address.postal_code}
            </p>

          </div>

        </div>


        <div className="flex shrink-0 items-center gap-2">

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--fixit-border)] bg-white px-3 text-xs font-semibold text-[var(--fixit-text-dark)] transition hover:border-[var(--fixit-primary)] hover:text-[var(--fixit-primary)]"
          >

            <Pencil
              size={14}
            />

            Edit

          </button>


          <button
            type="button"
            disabled={
              isDeleting
            }
            onClick={onDelete}
            aria-label={`Delete ${address.label} address`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--fixit-error)]/20 bg-white text-[var(--fixit-error)] transition hover:bg-[var(--fixit-error-soft)] disabled:cursor-not-allowed disabled:opacity-50"
          >

            {isDeleting ? (

              <LoaderCircle
                size={14}
                className="animate-spin"
              />

            ) : (

              <Trash2
                size={14}
              />

            )}

          </button>

        </div>

      </div>

    </article>
  );
}


/*
|--------------------------------------------------------------------------
| Address Form
|--------------------------------------------------------------------------
*/

function AddressForm({
  address,
  isSubmitting,
  error,
  onCancel,
  onCreate,
  onUpdate,
}: {
  address: CustomerAddress | null;
  isSubmitting: boolean;
  error: unknown;
  onCancel: () => void;
  onCreate: (
    data: CustomerAddressCreate,
  ) => void;
  onUpdate: (
    data: CustomerAddressUpdate,
  ) => void;
}) {
  const editing =
    address !== null;


  /*
  |--------------------------------------------------------------------------
  | Form state
  |--------------------------------------------------------------------------
  */

  const [
    label,
    setLabel,
  ] = useState(
    address?.label ?? "",
  );

  const [
    addressLine1,
    setAddressLine1,
  ] = useState(
    address?.address_line_1 ?? "",
  );

  const [
    addressLine2,
    setAddressLine2,
  ] = useState(
    address?.address_line_2 ?? "",
  );

  const [
    landmark,
    setLandmark,
  ] = useState(
    address?.landmark ?? "",
  );

  const [
    city,
    setCity,
  ] = useState(
    address?.city ?? "",
  );

  const [
    state,
    setState,
  ] = useState(
    address?.state ?? "",
  );

  const [
    postalCode,
    setPostalCode,
  ] = useState(
    address?.postal_code ?? "",
  );

  const [
    isDefault,
    setIsDefault,
  ] = useState(
    address?.is_default ?? false,
  );


  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  function handleSubmit(
    event: SubmitEvent,
  ) {
    event.preventDefault();


    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    if (
      editing &&
      address
    ) {
      onUpdate({
        label:
          label.trim() ||
          null,

        address_line_1:
          addressLine1.trim() ||
          null,

        address_line_2:
          addressLine2.trim() ||
          null,

        landmark:
          landmark.trim() ||
          null,

        city:
          city.trim() ||
          null,

        state:
          state.trim() ||
          null,

        postal_code:
          postalCode.trim() ||
          null,

        latitude:
          normalizeCoordinate(
            address.latitude,
          ),

        longitude:
          normalizeCoordinate(
            address.longitude,
          ),

        is_default:
          isDefault,
      });

      return;
    }


    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    onCreate({
      label:
        label.trim(),

      address_line_1:
        addressLine1.trim(),

      address_line_2:
        addressLine2.trim() ||
        null,

      landmark:
        landmark.trim() ||
        null,

      city:
        city.trim(),

      state:
        state.trim(),

      postal_code:
        postalCode.trim(),

      latitude:
        null,

      longitude:
        null,

      is_default:
        isDefault,
    });
  }


  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="mt-7 overflow-hidden rounded-2xl border border-[var(--fixit-primary)]/15 bg-[var(--fixit-background)]"
    >

      {/* Form accent */}

      <div className="h-1 bg-gradient-to-r from-[var(--fixit-primary)] to-[var(--fixit-secondary)]" />


      <div className="p-5 sm:p-6">


        {/* Header */}

        <div className="flex items-start justify-between gap-4">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--fixit-primary)]/15 bg-white px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-primary)]">

              <MapPin
                size={12}
              />

              {editing
                ? "Edit address"
                : "New address"}

            </div>


            <h3 className="mt-3 text-lg font-semibold text-[var(--fixit-text-dark)]">
              Service location
            </h3>


            <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
              Tell FixIt where the professional
              needs to provide the service.
            </p>

          </div>


          <button
            type="button"
            onClick={
              onCancel
            }
            disabled={
              isSubmitting
            }
            aria-label="Close address form"
            className="rounded-xl p-2 text-[var(--fixit-text-muted)] transition hover:bg-white hover:text-[var(--fixit-text-dark)] disabled:cursor-not-allowed disabled:opacity-50"
          >

            <X
              size={18}
            />

          </button>

        </div>


        {/* Fields */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          <AddressField
            label="Label"
            value={label}
            onChange={setLabel}
            placeholder="Home"
            required
          />


          <AddressField
            label="Address line 1"
            value={addressLine1}
            onChange={
              setAddressLine1
            }
            placeholder="Flat, building, street"
            required
          />


          <AddressField
            label="Address line 2"
            value={addressLine2}
            onChange={
              setAddressLine2
            }
            placeholder="Area, locality"
          />


          <AddressField
            label="Landmark"
            value={landmark}
            onChange={setLandmark}
            placeholder="Nearby landmark"
          />


          <AddressField
            label="City"
            value={city}
            onChange={setCity}
            placeholder="Mumbai"
            required
          />


          <AddressField
            label="State"
            value={state}
            onChange={setState}
            placeholder="Maharashtra"
            required
          />


          <AddressField
            label="Postal code"
            value={postalCode}
            onChange={setPostalCode}
            placeholder="400066"
            required
            maxLength={6}
            inputMode="numeric"
          />

        </div>


        {/* Default */}

        <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--fixit-border)] bg-white px-4 py-3">

          <input
            type="checkbox"
            checked={
              isDefault
            }
            onChange={(event) =>
              setIsDefault(
                event.target.checked,
              )
            }
            className="h-4 w-4 rounded border-[var(--fixit-border)] accent-[var(--fixit-primary)]"
          />


          <span>

            <span className="block text-sm font-semibold text-[var(--fixit-text-dark)]">
              Make this my default address
            </span>

            <span className="mt-0.5 block text-xs text-[var(--fixit-text-muted)]">
              Use this location automatically
              when a default address is needed.
            </span>

          </span>

        </label>


        {/* Error */}

        {error !== null &&
          error !== undefined && (

          <ErrorMessage
            message={getApiErrorMessage(
              error,
            )}
          />

        )}


        {/* Actions */}

        <div className="mt-6 flex flex-col gap-2 border-t border-[var(--fixit-border)] pt-5 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={
              onCancel
            }
            disabled={
              isSubmitting
            }
            className="h-10 rounded-xl border border-[var(--fixit-border)] bg-white px-4 text-xs font-semibold text-[var(--fixit-text-dark)] transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>


          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >

            {isSubmitting ? (

              <LoaderCircle
                size={14}
                className="animate-spin"
              />

            ) : (

              <Save
                size={14}
              />

            )}


            <span>
              {editing
                ? "Update address"
                : "Save address"}
            </span>

          </button>

        </div>

      </div>

    </form>
  );
}


/*
|--------------------------------------------------------------------------
| Address Field
|--------------------------------------------------------------------------
*/

function AddressField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder: string;
  required?: boolean;
  maxLength?: number;
  inputMode?:
    | "none"
    | "text"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-xs font-semibold text-[var(--fixit-text-dark)]">
        {label}
      </span>


      <input
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
        required={required}
        maxLength={maxLength}
        inputMode={inputMode}
        className="h-10 w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 text-sm text-[var(--fixit-text-dark)] outline-none transition placeholder:text-[var(--fixit-text-muted)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-soft)]"
      />

    </label>
  );
}


/*
|--------------------------------------------------------------------------
| Error Message
|--------------------------------------------------------------------------
*/

function ErrorMessage({
  message,
}: {
  message: string;
}) {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-4 py-3">

      <X
        size={17}
        className="mt-0.5 shrink-0 text-[var(--fixit-error)]"
      />


      <div>

        <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
          Something went wrong.
        </p>


        <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
          {message}
        </p>

      </div>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Loading
|--------------------------------------------------------------------------
*/

function ProfileLoadingState() {
  return (
    <div className="space-y-7">


      {/* Hero */}

      <section className="rounded-[28px] bg-[var(--fixit-primary-active)] px-6 py-10 sm:px-8">

        <div className="animate-pulse">

          <div className="h-20 w-20 rounded-[22px] bg-white/10" />

          <div className="mt-5 h-7 w-28 rounded-full bg-white/10" />

          <div className="mt-4 h-9 w-56 rounded-xl bg-white/10" />

          <div className="mt-3 h-4 w-80 rounded bg-white/10" />

        </div>

      </section>


      {/* Profile skeleton */}

      <div className="rounded-[26px] border border-[var(--fixit-border)] bg-white p-6">

        <div className="animate-pulse">

          <div className="h-3 w-36 rounded bg-[var(--fixit-background)]" />

          <div className="mt-3 h-7 w-44 rounded bg-[var(--fixit-background)]" />

          <div className="mt-7 grid gap-5 sm:grid-cols-2">

            {Array.from({
              length: 4,
            }).map((_, index) => (

              <div
                key={index}
                className="h-16 rounded-xl bg-[var(--fixit-background)]"
              />

            ))}

          </div>

        </div>

      </div>


      {/* Address skeleton */}

      <div className="rounded-[26px] border border-[var(--fixit-border)] bg-white p-6">

        <div className="animate-pulse">

          <div className="h-6 w-48 rounded bg-[var(--fixit-background)]" />

          <div className="mt-6 h-24 rounded-2xl bg-[var(--fixit-background)]" />

        </div>

      </div>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Error State
|--------------------------------------------------------------------------
*/

function ProfileErrorState({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-[var(--fixit-error)]/20 bg-[var(--fixit-error-soft)] px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--fixit-error)] shadow-sm">

        <UserRound
          size={22}
        />

      </div>


      <h2 className="mt-5 text-lg font-semibold text-[var(--fixit-text-dark)]">
        We couldn't load your profile
      </h2>


      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
        Something went wrong while loading
        your account information. Please try
        again.
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
| Helpers
|--------------------------------------------------------------------------
*/

function getDisplayName(
  profile: CustomerProfile,
) {
  const name = [
    profile.first_name,
    profile.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();


  return (
    name ||
    "FixIt customer"
  );
}


/*
|--------------------------------------------------------------------------
| Coordinate normalization
|--------------------------------------------------------------------------
*/

function normalizeCoordinate(
  value: string | null,
): number | null {
  if (
    value === null ||
    value.trim() === ""
  ) {
    return null;
  }


  const numericValue =
    Number(value);


  return Number.isFinite(
    numericValue,
  )
    ? numericValue
    : null;
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