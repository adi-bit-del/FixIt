import apiClient from "../../api/client";


/*
|--------------------------------------------------------------------------
| Booking Types
|--------------------------------------------------------------------------
|
| These types match the backend BookingResponse schema.
|
|--------------------------------------------------------------------------
*/

export interface BookingResponse {
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


export interface BookingCreate {
  scheduled_at: string;
}


/*
|--------------------------------------------------------------------------
| Customer Bookings API
|--------------------------------------------------------------------------
|
| Backend endpoints:
|
| GET  /api/v1/customer/bookings
| GET  /api/v1/customer/bookings/{booking_id}
| POST /api/v1/customer/bookings/quote/{quote_id}
| POST /api/v1/customer/bookings/{booking_id}/cancel
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Get all customer bookings
|--------------------------------------------------------------------------
*/

export async function getCustomerBookings(): Promise<
  BookingResponse[]
> {
  const response =
    await apiClient.get<BookingResponse[]>(
      "/customer/bookings",
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| Get one customer booking
|--------------------------------------------------------------------------
*/

export async function getCustomerBooking(
  bookingId: number,
): Promise<BookingResponse> {
  const response =
    await apiClient.get<BookingResponse>(
      `/customer/bookings/${bookingId}`,
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| Create booking from accepted quote
|--------------------------------------------------------------------------
*/

export async function createCustomerBooking(
  quoteId: number,
  data: BookingCreate,
): Promise<BookingResponse> {
  const response =
    await apiClient.post<BookingResponse>(
      `/customer/bookings/quote/${quoteId}`,
      data,
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| Cancel customer booking
|--------------------------------------------------------------------------
*/

export async function cancelCustomerBooking(
  bookingId: number,
): Promise<BookingResponse> {
  const response =
    await apiClient.post<BookingResponse>(
      `/customer/bookings/${bookingId}/cancel`,
    );

  return response.data;
}