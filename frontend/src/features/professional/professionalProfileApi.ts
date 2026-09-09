import apiClient from "../../api/client";

export interface ProfessionalProfile {
  id: number;
  user_id: number;
  business_name: string;
  bio: string | null;
  experience_years: number;
  phone: string | null;
  profile_image_url: string | null;
  verification_status: string;
}

export interface ProfessionalProfileUpdate {
  business_name?: string;
  bio?: string | null;
  experience_years?: number;
  phone?: string | null;
  profile_image_url?: string | null;
}

export async function getProfessionalProfile(): Promise<ProfessionalProfile> {
  const response = await apiClient.get<ProfessionalProfile>(
    "/professional/profile",
  );

  return response.data;
}

export async function updateProfessionalProfile(
  data: ProfessionalProfileUpdate,
): Promise<ProfessionalProfile> {
  const response = await apiClient.patch<ProfessionalProfile>(
    "/professional/profile",
    data,
  );

  return response.data;
}