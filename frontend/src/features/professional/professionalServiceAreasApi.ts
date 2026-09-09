import apiClient from "../../api/client";

export interface ProfessionalServiceArea {
  id: number;
  professional_profile_id: number;
  city: string;
  state: string;
  postal_code: string | null;
  latitude: string | null;
  longitude: string | null;
  radius_km: string;
  is_active: boolean;
}

export interface ProfessionalServiceAreaCreate {
  city: string;
  state: string;
  postal_code?: string | null;
  radius_km?: number | null;
}

export interface ProfessionalServiceAreaUpdate {
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  radius_km?: number | null;
  is_active?: boolean | null;
}

export async function getProfessionalServiceAreas(): Promise<
  ProfessionalServiceArea[]
> {
  const response = await apiClient.get<ProfessionalServiceArea[]>(
    "/professional/service-areas",
  );

  return response.data;
}

export async function createProfessionalServiceArea(
  data: ProfessionalServiceAreaCreate,
): Promise<ProfessionalServiceArea> {
  const response =
    await apiClient.post<ProfessionalServiceArea>(
      "/professional/service-areas",
      data,
    );

  return response.data;
}

export async function updateProfessionalServiceArea(
  serviceAreaId: number,
  data: ProfessionalServiceAreaUpdate,
): Promise<ProfessionalServiceArea> {
  const response =
    await apiClient.patch<ProfessionalServiceArea>(
      `/professional/service-areas/${serviceAreaId}`,
      data,
    );

  return response.data;
}

export async function deleteProfessionalServiceArea(
  serviceAreaId: number,
): Promise<void> {
  await apiClient.delete(
    `/professional/service-areas/${serviceAreaId}`,
  );
}