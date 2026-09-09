export interface CustomerServiceRequest {
  id: number;
  customer_profile_id: number;
  professional_profile_id: number;
  service_id: number;
  address_id: number;
  description: string | null;
  preferred_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerQuote {
  id: number;
  service_request_id: number;
  professional_service_id: number;
  amount: string;
  note: string | null;
  status: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerBooking {
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