import apiClient from "../../api/client";

export interface ProfessionalQuote {
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

export interface ProfessionalQuoteCreate {
  professional_service_id: number;
  amount: number;
  note?: string | null;
  expires_at?: string | null;
}

export async function getProfessionalQuotes(): Promise<
  ProfessionalQuote[]
> {
  const response = await apiClient.get<ProfessionalQuote[]>(
    "/professional/quotes"
  );

  return response.data;
}

export async function createProfessionalQuote(
  requestId: number,
  data: ProfessionalQuoteCreate
): Promise<ProfessionalQuote> {
  const response = await apiClient.post<ProfessionalQuote>(
    `/professional/quotes/request/${requestId}`,
    data
  );

  return response.data;
}