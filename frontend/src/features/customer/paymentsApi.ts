import apiClient from "../../api/client";


/*
|--------------------------------------------------------------------------
| Payment Types
|--------------------------------------------------------------------------
|
| These types match the backend PaymentCreate and PaymentResponse
| schemas verified from the FastAPI OpenAPI contract.
|
|--------------------------------------------------------------------------
*/


export type PaymentMethod =
  | "MOCK_CARD"
  | "MOCK_UPI"
  | "MOCK_CASH";


export type PaymentSimulationResult =
  | "SUCCESS"
  | "FAILED";


export interface PaymentCreate {
  payment_method?: PaymentMethod;
  simulate_result?: PaymentSimulationResult;
}


export interface PaymentResponse {
  id: number;
  booking_id: number;
  amount: string;
  payment_method: string;
  transaction_reference: string;
  status: string;
}


/*
|--------------------------------------------------------------------------
| Customer Payments API
|--------------------------------------------------------------------------
|
| Backend endpoints:
|
| GET  /api/v1/customer/payments
| GET  /api/v1/customer/payments/{payment_id}
| POST /api/v1/customer/payments/booking/{booking_id}
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Get all customer payments
|--------------------------------------------------------------------------
*/

export async function getCustomerPayments(): Promise<
  PaymentResponse[]
> {
  const response =
    await apiClient.get<PaymentResponse[]>(
      "/customer/payments",
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| Get one customer payment
|--------------------------------------------------------------------------
*/

export async function getCustomerPayment(
  paymentId: number,
): Promise<PaymentResponse> {
  const response =
    await apiClient.get<PaymentResponse>(
      `/customer/payments/${paymentId}`,
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| Make payment for a booking
|--------------------------------------------------------------------------
*/

export async function makeCustomerPayment(
  bookingId: number,
  data: PaymentCreate,
): Promise<PaymentResponse> {
  const response =
    await apiClient.post<PaymentResponse>(
      `/customer/payments/booking/${bookingId}`,
      data,
    );

  return response.data;
}