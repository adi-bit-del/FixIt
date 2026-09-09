import apiClient from "../../api/client";
import type { CustomerServiceRequest } from "../../types/customer";

export interface CreateServiceRequestPayload {
  professional_profile_id: number;
  service_id: number;
  address_id: number;
  description?: string | null;
  preferred_date?: string | null;
}

export async function createServiceRequest(
  payload: CreateServiceRequestPayload,
): Promise<CustomerServiceRequest> {
  const response =
    await apiClient.post<CustomerServiceRequest>(
      "/customer/requests",
      payload,
    );

  return response.data;
}