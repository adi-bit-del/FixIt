/*
|--------------------------------------------------------------------------
| Quote Types
|--------------------------------------------------------------------------
|
| Matches the backend QuoteResponse schema:
|
| id
| service_request_id
| professional_service_id
| amount
| note
| status
| expires_at
| created_at
| updated_at
|
|--------------------------------------------------------------------------
*/

export interface QuoteResponse {
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