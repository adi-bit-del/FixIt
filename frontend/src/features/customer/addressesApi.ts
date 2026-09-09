import apiClient from "../../api/client";

import type {
  CustomerAddress,
} from "../../types/address";


/*
|--------------------------------------------------------------------------
| Address Types
|--------------------------------------------------------------------------
|
| These types match the verified backend AddressCreate and AddressUpdate
| schemas.
|
|--------------------------------------------------------------------------
*/

export interface CustomerAddressCreate {
  label: string;
  address_line_1: string;
  address_line_2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean;
}


export interface CustomerAddressUpdate {
  label?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean | null;
}


/*
|--------------------------------------------------------------------------
| Get customer addresses
|--------------------------------------------------------------------------
|
| GET /api/v1/customer/addresses
|
|--------------------------------------------------------------------------
*/

export async function getCustomerAddresses(): Promise<
  CustomerAddress[]
> {
  const response =
    await apiClient.get<CustomerAddress[]>(
      "/customer/addresses",
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| Create customer address
|--------------------------------------------------------------------------
|
| POST /api/v1/customer/addresses
|
|--------------------------------------------------------------------------
*/

export async function createCustomerAddress(
  data: CustomerAddressCreate,
): Promise<CustomerAddress> {
  const response =
    await apiClient.post<CustomerAddress>(
      "/customer/addresses",
      data,
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| Update customer address
|--------------------------------------------------------------------------
|
| PATCH /api/v1/customer/addresses/{address_id}
|
|--------------------------------------------------------------------------
*/

export async function updateCustomerAddress(
  addressId: number,
  data: CustomerAddressUpdate,
): Promise<CustomerAddress> {
  const response =
    await apiClient.patch<CustomerAddress>(
      `/customer/addresses/${addressId}`,
      data,
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| Delete customer address
|--------------------------------------------------------------------------
|
| DELETE /api/v1/customer/addresses/{address_id}
|
| Backend returns 204 No Content.
|
|--------------------------------------------------------------------------
*/

export async function deleteCustomerAddress(
  addressId: number,
): Promise<void> {
  await apiClient.delete(
    `/customer/addresses/${addressId}`,
  );
}