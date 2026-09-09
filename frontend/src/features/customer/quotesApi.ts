import apiClient from "../../api/client";
import type { QuoteResponse } from "../../types/quote";


/*
|--------------------------------------------------------------------------
| Customer Quotes API
|--------------------------------------------------------------------------
|
| Backend endpoints:
|
| GET  /api/v1/customer/quotes
| POST /api/v1/customer/quotes/{quote_id}/accept
| POST /api/v1/customer/quotes/{quote_id}/reject
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Get customer quotes
|--------------------------------------------------------------------------
*/

export async function getCustomerQuotes(): Promise<
  QuoteResponse[]
> {
  const response =
    await apiClient.get<QuoteResponse[]>(
      "/customer/quotes",
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| Accept a quote
|--------------------------------------------------------------------------
*/

export async function acceptCustomerQuote(
  quoteId: number,
): Promise<QuoteResponse> {
  const response =
    await apiClient.post<QuoteResponse>(
      `/customer/quotes/${quoteId}/accept`,
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| Reject a quote
|--------------------------------------------------------------------------
*/

export async function rejectCustomerQuote(
  quoteId: number,
): Promise<QuoteResponse> {
  const response =
    await apiClient.post<QuoteResponse>(
      `/customer/quotes/${quoteId}/reject`,
    );

  return response.data;
}