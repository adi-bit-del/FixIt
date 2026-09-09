import apiClient from "../../api/client";


/*
|--------------------------------------------------------------------------
| Review Types
|--------------------------------------------------------------------------
|
| These types match the backend ReviewCreate and ReviewResponse schemas.
|
|--------------------------------------------------------------------------
*/


export interface ReviewCreate {
  rating: number;
  comment?: string | null;
}


export interface ReviewResponse {
  id: number;
  booking_id: number;
  customer_profile_id: number;
  professional_profile_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}


/*
|--------------------------------------------------------------------------
| Customer Reviews API
|--------------------------------------------------------------------------
|
| Backend endpoints:
|
| GET  /api/v1/customer/reviews
| POST /api/v1/customer/reviews/booking/{booking_id}
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Get customer reviews
|--------------------------------------------------------------------------
*/

export async function getCustomerReviews(): Promise<
  ReviewResponse[]
> {
  const response =
    await apiClient.get<ReviewResponse[]>(
      "/customer/reviews",
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| Create booking review
|--------------------------------------------------------------------------
*/

export async function createCustomerReview(
  bookingId: number,
  data: ReviewCreate,
): Promise<ReviewResponse> {
  const response =
    await apiClient.post<ReviewResponse>(
      `/customer/reviews/booking/${bookingId}`,
      data,
    );

  return response.data;
}