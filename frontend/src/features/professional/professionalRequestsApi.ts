import apiClient from "../../api/client";

export interface ProfessionalServiceRequest {
  id: number;
  customer_profile_id: number;
  professional_profile_id: number;
  service_id: number;
  address_id: number;
  description: string | null;
  preferred_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function getProfessionalRequests(): Promise<
  ProfessionalServiceRequest[]
> {
  const response = await apiClient.get<ProfessionalServiceRequest[]>(
    "/professional/requests"
  );

  return response.data;
}

export async function acceptProfessionalRequest(
  requestId: number
): Promise<ProfessionalServiceRequest> {
  const response = await apiClient.post<ProfessionalServiceRequest>(
    `/professional/requests/${requestId}/accept`
  );

  return response.data;
}

export async function rejectProfessionalRequest(
  requestId: number
): Promise<ProfessionalServiceRequest> {
  const response = await apiClient.post<ProfessionalServiceRequest>(
    `/professional/requests/${requestId}/reject`
  );

  return response.data;
}