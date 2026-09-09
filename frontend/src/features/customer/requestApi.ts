import apiClient from "../../api/client";
import type { CustomerServiceRequest } from "../../types/customer";


/*
|--------------------------------------------------------------------------
| Customer Requests API
|--------------------------------------------------------------------------
|
| All customer service-request operations live in this file.
|
| GET  /api/v1/customer/requests
| GET  /api/v1/customer/requests/{request_id}
| POST /api/v1/customer/requests/{request_id}/cancel
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Get all customer requests
|--------------------------------------------------------------------------
*/

export async function getCustomerRequests(): Promise<
  CustomerServiceRequest[]
> {
  const response =
    await apiClient.get<CustomerServiceRequest[]>(
      "/customer/requests",
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| Get a single customer request
|--------------------------------------------------------------------------
*/

export async function getCustomerRequest(
  requestId: number,
): Promise<CustomerServiceRequest> {
  const response =
    await apiClient.get<CustomerServiceRequest>(
      `/customer/requests/${requestId}`,
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| Cancel a customer request
|--------------------------------------------------------------------------
*/

export async function cancelCustomerRequest(
  requestId: number,
): Promise<CustomerServiceRequest> {
  const response =
    await apiClient.post<CustomerServiceRequest>(
      `/customer/requests/${requestId}/cancel`,
    );

  return response.data;
}