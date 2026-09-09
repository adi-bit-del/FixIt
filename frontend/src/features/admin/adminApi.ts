import apiClient from "../../api/client";

/* ============================================================================
 * PROFESSIONALS
 * ========================================================================== */

export interface AdminProfessional {
  id: number;
  user_id: number;
  business_name: string;
  bio: string | null;
  experience_years: number;
  phone: string | null;
  profile_image_url: string | null;
  verification_status: string;
}

export interface ProfessionalVerificationUpdate {
  verification_status: string;
}

/* ============================================================================
 * CUSTOMERS
 * ========================================================================== */

export interface AdminCustomer {
  id: number;
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  profile_image_url: string | null;
  email: string;
  is_active: boolean;
  created_at: string;
  requests_count: number;
  bookings_count: number;
}

export interface AdminCustomerStatusUpdate {
  is_active: boolean;
}

/* ============================================================================
 * CATEGORIES
 * ========================================================================== */

export interface AdminCategory {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface AdminCategoryCreate {
  name: string;
  description?: string | null;
}

export interface AdminCategoryUpdate {
  name?: string | null;
  description?: string | null;
  is_active?: boolean | null;
}

/* ============================================================================
 * SERVICES
 * ========================================================================== */

export interface AdminService {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  base_price: string;
  is_active: boolean;
}

export interface AdminServiceCreate {
  category_id: number;
  name: string;
  description?: string | null;
  base_price: number;
}

export interface AdminServiceUpdate {
  category_id?: number | null;
  name?: string | null;
  description?: string | null;
  base_price?: number | null;
  is_active?: boolean | null;
}

/* ============================================================================
 * REVIEWS
 * ========================================================================== */

export interface AdminReview {
  id: number;
  booking_id: number;
  customer_profile_id: number;
  customer_name: string;
  professional_profile_id: number;
  professional_name: string;
  service_id: number;
  service_name: string;
  rating: number;
  comment: string | null;
  moderation_status: "VISIBLE" | "HIDDEN";
  created_at: string;
  updated_at: string;
}

/* ============================================================================
 * PROFESSIONAL API
 * ========================================================================== */

export async function getAdminProfessionals() {
  const response = await apiClient.get<AdminProfessional[]>(
    "/admin/professionals",
  );

  return response.data;
}

export async function updateProfessionalVerification(
  professionalProfileId: number,
  verificationStatus: string,
) {
  const response = await apiClient.patch<AdminProfessional>(
    `/admin/professionals/${professionalProfileId}/verification`,
    {
      verification_status: verificationStatus,
    },
  );

  return response.data;
}

/* ============================================================================
 * CUSTOMER API
 * ========================================================================== */

export async function getAdminCustomers() {
  const response = await apiClient.get<AdminCustomer[]>(
    "/admin/customers",
  );

  return response.data;
}

export async function updateAdminCustomerStatus(
  customerProfileId: number,
  isActive: boolean,
) {
  const response = await apiClient.patch<AdminCustomer>(
    `/admin/customers/${customerProfileId}/status`,
    {
      is_active: isActive,
    },
  );

  return response.data;
}

/* ============================================================================
 * CATEGORY API
 * ========================================================================== */

export async function getAdminCategories() {
  const response = await apiClient.get<AdminCategory[]>(
    "/services/categories",
  );

  return response.data;
}

export async function createAdminCategory(
  data: AdminCategoryCreate,
) {
  const response = await apiClient.post<AdminCategory>(
    "/admin/services/categories",
    data,
  );

  return response.data;
}

export async function updateAdminCategory(
  categoryId: number,
  data: AdminCategoryUpdate,
) {
  const response = await apiClient.patch<AdminCategory>(
    `/admin/services/categories/${categoryId}`,
    data,
  );

  return response.data;
}

/* ============================================================================
 * SERVICE API
 * ========================================================================== */

export async function getAdminServices() {
  const response = await apiClient.get<AdminService[]>(
    "/services",
  );

  return response.data;
}

export async function createAdminService(
  data: AdminServiceCreate,
) {
  const response = await apiClient.post<AdminService>(
    "/admin/services",
    data,
  );

  return response.data;
}

export async function updateAdminService(
  serviceId: number,
  data: AdminServiceUpdate,
) {
  const response = await apiClient.patch<AdminService>(
    `/admin/services/${serviceId}`,
    data,
  );

  return response.data;
}

/* ============================================================================
 * REVIEW API
 * ========================================================================== */

export async function getAdminReviews() {
  const response = await apiClient.get<AdminReview[]>(
    "/admin/reviews",
  );

  return response.data;
}

export async function updateAdminReviewModeration(
  reviewId: number,
  moderationStatus: "VISIBLE" | "HIDDEN",
) {
  const response = await apiClient.patch<AdminReview>(
    `/admin/reviews/${reviewId}/moderation`,
    {
      moderation_status: moderationStatus,
    },
  );

  return response.data;
}

export type AdminRequest = {
  id: number;
  customer_profile_id: number;
  customer_name: string;
  professional_profile_id: number;
  professional_name: string;
  service_id: number;
  service_name: string;
  address_id: number;
  description: string | null;
  preferred_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export async function getAdminRequests() {
  const response = await apiClient.get<AdminRequest[]>("/admin/requests");
  return response.data;
}

export type AdminQuote = {
  id: number;
  service_request_id: number;
  professional_service_id: number;

  customer_profile_id: number;
  customer_name: string;

  professional_profile_id: number;
  professional_name: string;

  service_id: number;
  service_name: string;

  amount: number;
  note: string | null;
  status: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function getAdminQuotes() {
  const response = await apiClient.get<AdminQuote[]>("/admin/quotes");
  return response.data;
}

export type AdminBooking = {
  id: number;
  service_request_id: number;
  quote_id: number;

  customer_profile_id: number;
  customer_name: string;

  professional_profile_id: number;
  professional_name: string;

  service_id: number;
  service_name: string;

  address_id: number;
  amount: number;
  scheduled_at: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export async function getAdminBookings() {
  const response = await apiClient.get<AdminBooking[]>(
    "/admin/bookings",
  );

  return response.data;
}

export type AdminPayment = {
  id: number;
  booking_id: number;

  customer_profile_id: number;
  customer_name: string;

  professional_profile_id: number;
  professional_name: string;

  service_id: number;
  service_name: string;

  amount: number;
  payment_method: string;
  transaction_reference: string;
  status: string;
};

export async function getAdminPayments() {
  const response = await apiClient.get<AdminPayment[]>(
    "/admin/payments",
  );

  return response.data;
}