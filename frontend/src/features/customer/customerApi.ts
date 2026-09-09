import apiClient from "../../api/client";

import type {
  CustomerBooking,
  CustomerQuote,
  CustomerServiceRequest,
} from "../../types/customer";


export async function getCustomerRequests(): Promise<
  CustomerServiceRequest[]
> {
  const response = await apiClient.get<CustomerServiceRequest[]>(
    "/customer/requests",
  );

  return response.data;
}


export async function getCustomerQuotes(): Promise<
  CustomerQuote[]
> {
  const response = await apiClient.get<CustomerQuote[]>(
    "/customer/quotes",
  );

  return response.data;
}


export async function getCustomerBookings(): Promise<
  CustomerBooking[]
> {
  const response = await apiClient.get<CustomerBooking[]>(
    "/customer/bookings",
  );

  return response.data;
}