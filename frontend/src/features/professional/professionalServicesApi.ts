import apiClient from "../../api/client";

export interface ProfessionalService {
  id: number;
  professional_profile_id: number;
  service_id: number;
  custom_price: string | null;
  is_active: boolean;
}

export interface ProfessionalServiceCreate {
  service_id: number;
  custom_price?: number | null;
}

export interface ProfessionalServiceUpdate {
  custom_price?: number | null;
  is_active?: boolean | null;
}

export async function getProfessionalServices(): Promise<
  ProfessionalService[]
> {
  const response = await apiClient.get<ProfessionalService[]>(
    "/professional/services"
  );

  return response.data;
}

export async function createProfessionalService(
  data: ProfessionalServiceCreate
): Promise<ProfessionalService> {
  const response = await apiClient.post<ProfessionalService>(
    "/professional/services",
    data
  );

  return response.data;
}

export async function updateProfessionalService(
  professionalServiceId: number,
  data: ProfessionalServiceUpdate
): Promise<ProfessionalService> {
  const response = await apiClient.patch<ProfessionalService>(
    `/professional/services/${professionalServiceId}`,
    data
  );

  return response.data;
}

export async function deleteProfessionalService(
  professionalServiceId: number
): Promise<void> {
  await apiClient.delete(
    `/professional/services/${professionalServiceId}`
  );
}