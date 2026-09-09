import apiClient from "../../api/client";

export interface ProfessionalBooking {
  id: number;
  service_request_id: number;
  quote_id: number;
  customer_profile_id: number;
  professional_profile_id: number;
  service_id: number;
  address_id: number;
  amount: string;
  scheduled_at: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function getProfessionalBookings(): Promise<
  ProfessionalBooking[]
> {
  const response = await apiClient.get<ProfessionalBooking[]>(
    "/professional/bookings"
  );

  return response.data;
}

export async function startProfessionalBooking(
  bookingId: number
): Promise<ProfessionalBooking> {
  const response = await apiClient.post<ProfessionalBooking>(
    `/professional/bookings/${bookingId}/start`
  );

  return response.data;
}

export async function completeProfessionalBooking(
  bookingId: number
): Promise<ProfessionalBooking> {
  const response = await apiClient.post<ProfessionalBooking>(
    `/professional/bookings/${bookingId}/complete`
  );

  return response.data;
}