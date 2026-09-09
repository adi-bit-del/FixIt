import apiClient from "../../api/client";

export interface ProfessionalReview {
  id: number;
  booking_id: number;
  customer_profile_id: number;
  professional_profile_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export async function getProfessionalReviews(
  professionalProfileId: number,
): Promise<ProfessionalReview[]> {
  const response = await apiClient.get<ProfessionalReview[]>(
    `/professionals/${professionalProfileId}/reviews`,
  );

  return response.data;
}