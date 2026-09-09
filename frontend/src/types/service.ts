export interface ServiceCategory {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface Service {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  base_price: string;
  is_active: boolean;
}