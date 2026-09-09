import apiClient from "../../api/client";
import type { ProfessionalDiscovery } from "../../types/professional";

export interface ProfessionalSearchParams {
  serviceId?: number;
  city?: string;
  postalCode?: string;
}

export async function getProfessionals(
  params: ProfessionalSearchParams = {},
): Promise<ProfessionalDiscovery[]> {
  const response = await apiClient.get<ProfessionalDiscovery[]>(
    "/professionals",
    {
      params: {
        service_id: params.serviceId,
        city: params.city || undefined,
        postal_code: params.postalCode || undefined,
      },
    },
  );

  return response.data;
}