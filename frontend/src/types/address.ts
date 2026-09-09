export interface CustomerAddress {
  id: number;
  customer_profile_id: number;
  label: string;
  address_line_1: string;
  address_line_2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postal_code: string;
  latitude: string | null;
  longitude: string | null;
  is_default: boolean;
}