import {
  Check,
  Edit3,
  Plus,
  Power,
  RotateCcw,
  Search,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAdminService,
  getAdminCategories,
  getAdminServices,
  updateAdminService,
} from "./adminApi";

type ServiceFilter = "ALL" | "ACTIVE" | "INACTIVE";

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: string;
          };
        };
      }
    ).response;

    if (response?.data?.detail) {
      return response.data.detail;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

function formatPrice(value: string | number) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "₹0";
  }

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default function AdminServicesPage() {
  const queryClient = useQueryClient();

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");

  const [editingId, setEditingId] = useState<number | null>(
    null,
  );
  const [editingCategoryId, setEditingCategoryId] =
    useState("");
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] =
    useState("");
  const [editingPrice, setEditingPrice] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<ServiceFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAdminCategories,
  });

  const servicesQuery = useQuery({
    queryKey: ["admin-services"],
    queryFn: getAdminServices,
  });

  const createMutation = useMutation({
    mutationFn: createAdminService,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-services"],
      });

      setCategoryId("");
      setName("");
      setDescription("");
      setBasePrice("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        category_id?: number | null;
        name?: string | null;
        description?: string | null;
        base_price?: number | null;
        is_active?: boolean | null;
      };
    }) => updateAdminService(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-services"],
      });

      setEditingId(null);
      setEditingCategoryId("");
      setEditingName("");
      setEditingDescription("");
      setEditingPrice("");
    },
  });

  const categories = categoriesQuery.data ?? [];
  const services = servicesQuery.data ?? [];

  const activeServices = services.filter(
    (service) => service.is_active,
  );

  const inactiveServices = services.filter(
    (service) => !service.is_active,
  );

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesStatus =
        filter === "ALL" ||
        (filter === "ACTIVE" && service.is_active) ||
        (filter === "INACTIVE" && !service.is_active);

      if (!matchesStatus) {
        return false;
      }

      if (
        categoryFilter &&
        String(service.category_id) !== categoryFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const categoryName =
        categories.find(
          (category) => category.id === service.category_id,
        )?.name ?? "";

      return [
        service.name,
        service.description ?? "",
        categoryName,
        String(service.id),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [
    categories,
    categoryFilter,
    filter,
    search,
    services,
  ]);

  const activeCategories = categories.filter(
    (category) => category.is_active,
  );

  const addService = () => {
    const numericPrice = Number(basePrice);

    if (
      !categoryId ||
      !name.trim() ||
      !basePrice ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      return;
    }

    createMutation.mutate({
      category_id: Number(categoryId),
      name: name.trim(),
      description: description.trim() || null,
      base_price: numericPrice,
    });
  };

  const startEditing = (
    serviceId: number,
    serviceCategoryId: number,
    serviceName: string,
    serviceDescription: string | null,
    servicePrice: string,
  ) => {
    setEditingId(serviceId);
    setEditingCategoryId(String(serviceCategoryId));
    setEditingName(serviceName);
    setEditingDescription(serviceDescription ?? "");
    setEditingPrice(servicePrice);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingCategoryId("");
    setEditingName("");
    setEditingDescription("");
    setEditingPrice("");
  };

  const saveService = (serviceId: number) => {
    const numericPrice = Number(editingPrice);

    if (
      !editingCategoryId ||
      !editingName.trim() ||
      !editingPrice ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      return;
    }

    updateMutation.mutate({
      id: serviceId,
      data: {
        category_id: Number(editingCategoryId),
        name: editingName.trim(),
        description: editingDescription.trim() || null,
        base_price: numericPrice,
      },
    });
  };

  const toggleService = (
    serviceId: number,
    isActive: boolean,
  ) => {
    updateMutation.mutate({
      id: serviceId,
      data: {
        is_active: !isActive,
      },
    });
  };

  const clearFilters = () => {
    setSearch("");
    setFilter("ALL");
    setCategoryFilter("");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <header className="mb-8">
        <p className="text-sm font-medium text-[var(--fixit-primary)]">
          Catalog
        </p>

        <div className="mt-1 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--fixit-text)] sm:text-3xl">
              Services
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)] sm:text-base">
              Manage the services available throughout the FixIt
              marketplace.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--fixit-text-muted)]">
            <Wrench className="h-4 w-4" />
            <span>
              {services.length} service
              {services.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </header>

      {/* Summary */}
      <section
        aria-label="Service summary"
        className="grid gap-3 sm:grid-cols-3"
      >
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={[
            "rounded-2xl border p-4 text-left shadow-sm transition",
            filter === "ALL"
              ? "border-[var(--fixit-primary-ring)] bg-[var(--fixit-primary-soft)]"
              : "border-[var(--fixit-border)] bg-white hover:border-[var(--fixit-primary-ring)]",
          ].join(" ")}
        >
          <p className="text-sm font-medium text-[var(--fixit-text-muted)]">
            All services
          </p>

          <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
            {servicesQuery.isLoading ? "—" : services.length}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter("ACTIVE")}
          className={[
            "rounded-2xl border p-4 text-left shadow-sm transition",
            filter === "ACTIVE"
              ? "border-emerald-200 bg-emerald-50"
              : "border-[var(--fixit-border)] bg-white hover:border-emerald-200",
          ].join(" ")}
        >
          <p className="text-sm font-medium text-[var(--fixit-text-muted)]">
            Active
          </p>

          <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
            {servicesQuery.isLoading ? "—" : activeServices.length}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter("INACTIVE")}
          className={[
            "rounded-2xl border p-4 text-left shadow-sm transition",
            filter === "INACTIVE"
              ? "border-slate-300 bg-slate-100"
              : "border-[var(--fixit-border)] bg-white hover:border-slate-300",
          ].join(" ")}
        >
          <p className="text-sm font-medium text-[var(--fixit-text-muted)]">
            Inactive
          </p>

          <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
            {servicesQuery.isLoading ? "—" : inactiveServices.length}
          </p>
        </button>
      </section>

      {/* Main content */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* Create service */}
        <section className="h-fit rounded-2xl border border-[var(--fixit-border)] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)]">
              <Plus className="h-5 w-5 text-[var(--fixit-primary)]" />
            </div>

            <div>
              <h2 className="font-semibold text-[var(--fixit-text)]">
                Add service
              </h2>

              <p className="mt-1 text-sm leading-5 text-[var(--fixit-text-muted)]">
                Add a service to an active category.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="service-category"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
              >
                Category
              </label>

              <select
                id="service-category"
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
                className="w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 py-2.5 text-sm text-[var(--fixit-text)] outline-none transition focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
              >
                <option value="">Select category</option>

                {activeCategories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              {activeCategories.length === 0 && (
                <p className="mt-2 text-xs leading-5 text-[var(--fixit-text-muted)]">
                  Create or restore an active category before adding
                  services.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="service-name"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
              >
                Service name
              </label>

              <input
                id="service-name"
                value={name}
                maxLength={150}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="AC repair"
                className="w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 py-2.5 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-disabled)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
              />
            </div>

            <div>
              <label
                htmlFor="service-description"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
              >
                Description
              </label>

              <textarea
                id="service-description"
                value={description}
                maxLength={500}
                rows={4}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Professional AC repair service"
                className="w-full resize-none rounded-xl border border-[var(--fixit-border)] bg-white px-3 py-2.5 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-disabled)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
              />
            </div>

            <div>
              <label
                htmlFor="service-base-price"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
              >
                Base price
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--fixit-text-muted)]">
                  ₹
                </span>

                <input
                  id="service-base-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={basePrice}
                  onChange={(event) =>
                    setBasePrice(event.target.value)
                  }
                  placeholder="299"
                  className="w-full rounded-xl border border-[var(--fixit-border)] bg-white py-2.5 pl-8 pr-3 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-disabled)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
                />
              </div>
            </div>

            {createMutation.isError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-[var(--fixit-danger)]">
                {getErrorMessage(createMutation.error)}
              </div>
            )}

            {createMutation.isSuccess && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-5 text-emerald-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Service created successfully.</span>
              </div>
            )}

            <button
              type="button"
              disabled={
                createMutation.isPending ||
                !categoryId ||
                !name.trim() ||
                !basePrice ||
                activeCategories.length === 0
              }
              onClick={addService}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 py-3 text-sm font-semibold !text-white transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--fixit-disabled)] disabled:!text-white"
            >
              <Plus className="h-4 w-4" />

              {createMutation.isPending
                ? "Creating..."
                : "Create service"}
            </button>
          </div>
        </section>

        {/* Service catalog */}
        <section className="min-w-0 rounded-2xl border border-[var(--fixit-border)] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--fixit-text)]">
                  Service catalog
                </h2>

                <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
                  {filteredServices.length} of {services.length}{" "}
                  service
                  {services.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)]">
                <Wrench className="h-4.5 w-4.5 text-[var(--fixit-primary)]" />
              </div>
            </div>

            {/* Search + category filter */}
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fixit-text-muted)]" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search services..."
                  aria-label="Search services"
                  className="w-full rounded-xl border border-[var(--fixit-border)] bg-white py-2.5 pl-10 pr-3 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-disabled)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                aria-label="Filter by category"
                className="w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 py-2.5 text-sm text-[var(--fixit-text)] outline-none transition focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
              >
                <option value="">All categories</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["ALL", "All"],
                  ["ACTIVE", "Active"],
                  ["INACTIVE", "Inactive"],
                ] as const
              ).map(([value, label]) => {
                const active = filter === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFilter(value as ServiceFilter)
                    }
                    className={[
                      "rounded-full px-3.5 py-2 text-xs font-semibold transition",
                      active
                        ? "bg-[var(--fixit-primary)] !text-white"
                        : "border border-[var(--fixit-border)] bg-white text-[var(--fixit-text-muted)] hover:border-[var(--fixit-primary-ring)] hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)]",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}

              {(search ||
                categoryFilter ||
                filter !== "ALL") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full px-3.5 py-2 text-xs font-semibold text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-background)] hover:text-[var(--fixit-text)]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {servicesQuery.isLoading ? (
            <div className="mt-6 space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border border-[var(--fixit-border)] p-4"
                >
                  <div className="flex justify-between gap-4">
                    <div className="flex-1">
                      <div className="h-4 w-44 rounded bg-slate-100" />
                      <div className="mt-3 h-3 w-28 rounded bg-slate-100" />
                      <div className="mt-3 h-3 w-64 rounded bg-slate-100" />
                    </div>

                    <div className="h-5 w-16 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : servicesQuery.isError ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="font-semibold text-[var(--fixit-danger)]">
                Unable to load services
              </p>

              <p className="mt-1 text-sm leading-6 text-red-700">
                {getErrorMessage(servicesQuery.error)}
              </p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-[var(--fixit-border)] bg-[var(--fixit-background)] p-10 text-center">
              <Wrench className="mx-auto h-10 w-10 text-[var(--fixit-disabled)]" />

              <p className="mt-4 font-semibold text-[var(--fixit-text)]">
                {services.length === 0
                  ? "No services yet"
                  : "No matching services"}
              </p>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
                {services.length === 0
                  ? "Create your first service to start building the FixIt catalog."
                  : "Try another search term or clear the current filters."}
              </p>

              {services.length > 0 &&
                (search ||
                  categoryFilter ||
                  filter !== "ALL") && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-[var(--fixit-primary-hover)]"
                  >
                    Clear filters
                  </button>
                )}
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {filteredServices.map((service) => {
                const editing = editingId === service.id;
                const updating =
                  updateMutation.isPending &&
                  updateMutation.variables?.id === service.id;

                const category = categories.find(
                  (item) => item.id === service.category_id,
                );

                return (
                  <article
                    key={service.id}
                    className={[
                      "rounded-xl border p-4 transition",
                      service.is_active
                        ? "border-[var(--fixit-border)] bg-white"
                        : "border-slate-200 bg-slate-50/70",
                    ].join(" ")}
                  >
                    {!editing ? (
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-[var(--fixit-text)]">
                              {service.name}
                            </p>

                            <span
                              className={[
                                "rounded-full px-2.5 py-1 text-xs font-semibold",
                                service.is_active
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-200 text-slate-600",
                              ].join(" ")}
                            >
                              {service.is_active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
                            {category?.name ??
                              `Category #${service.category_id}`}
                          </p>

                          {service.description && (
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)]">
                              {service.description}
                            </p>
                          )}

                          <p className="mt-2 text-xs text-[var(--fixit-disabled)]">
                            Service #{service.id}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
                          <p className="text-lg font-semibold text-[var(--fixit-text)]">
                            {formatPrice(service.base_price)}
                          </p>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                startEditing(
                                  service.id,
                                  service.category_id,
                                  service.name,
                                  service.description,
                                  service.base_price,
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-3 py-2.5 text-sm font-semibold text-[var(--fixit-text-muted)] transition hover:border-[var(--fixit-primary-ring)] hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)]"
                            >
                              <Edit3 className="h-4 w-4" />
                              <span className="hidden sm:inline">
                                Edit
                              </span>
                            </button>

                            <button
                              type="button"
                              disabled={updating}
                              onClick={() =>
                                toggleService(
                                  service.id,
                                  service.is_active,
                                )
                              }
                              className={
                                service.is_active
                                  ? "inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm font-semibold text-[var(--fixit-danger)] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-[var(--fixit-border)] disabled:bg-white disabled:text-[var(--fixit-disabled)]"
                                  : "inline-flex items-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-3 py-2.5 text-sm font-semibold text-[var(--fixit-primary)] transition hover:border-[var(--fixit-primary-ring)] hover:bg-[var(--fixit-primary-soft)] disabled:cursor-not-allowed disabled:text-[var(--fixit-disabled)]"
                              }
                            >
                              {service.is_active ? (
                                <>
                                  <Power className="h-4 w-4" />
                                  <span className="hidden sm:inline">
                                    {updating
                                      ? "Deactivating..."
                                      : "Deactivate"}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="h-4 w-4" />
                                  <span className="hidden sm:inline">
                                    {updating
                                      ? "Activating..."
                                      : "Activate"}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor={`service-category-${service.id}`}
                            className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
                          >
                            Category
                          </label>

                          <select
                            id={`service-category-${service.id}`}
                            value={editingCategoryId}
                            onChange={(event) =>
                              setEditingCategoryId(
                                event.target.value,
                              )
                            }
                            className="w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 py-2.5 text-sm text-[var(--fixit-text)] outline-none transition focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
                          >
                            {categories.map((category) => (
                              <option
                                key={category.id}
                                value={category.id}
                              >
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor={`service-name-${service.id}`}
                            className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
                          >
                            Service name
                          </label>

                          <input
                            id={`service-name-${service.id}`}
                            value={editingName}
                            maxLength={150}
                            onChange={(event) =>
                              setEditingName(
                                event.target.value,
                              )
                            }
                            className="w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 py-2.5 text-sm text-[var(--fixit-text)] outline-none transition focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`service-description-${service.id}`}
                            className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
                          >
                            Description
                          </label>

                          <textarea
                            id={`service-description-${service.id}`}
                            value={editingDescription}
                            maxLength={500}
                            rows={3}
                            onChange={(event) =>
                              setEditingDescription(
                                event.target.value,
                              )
                            }
                            className="w-full resize-none rounded-xl border border-[var(--fixit-border)] bg-white px-3 py-2.5 text-sm text-[var(--fixit-text)] outline-none transition focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`service-price-${service.id}`}
                            className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
                          >
                            Base price
                          </label>

                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--fixit-text-muted)]">
                              ₹
                            </span>

                            <input
                              id={`service-price-${service.id}`}
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={editingPrice}
                              onChange={(event) =>
                                setEditingPrice(
                                  event.target.value,
                                )
                              }
                              className="w-full rounded-xl border border-[var(--fixit-border)] bg-white py-2.5 pl-8 pr-3 text-sm text-[var(--fixit-text)] outline-none transition focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-background)] hover:text-[var(--fixit-text)]"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </button>

                          <button
                            type="button"
                            disabled={
                              updateMutation.isPending ||
                              !editingCategoryId ||
                              !editingName.trim() ||
                              !editingPrice ||
                              Number(editingPrice) <= 0
                            }
                            onClick={() =>
                              saveService(service.id)
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--fixit-disabled)] disabled:!text-white"
                          >
                            <Check className="h-4 w-4" />
                            {updateMutation.isPending
                              ? "Saving..."
                              : "Save changes"}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {updateMutation.isError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-[var(--fixit-danger)]">
              {getErrorMessage(updateMutation.error)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}