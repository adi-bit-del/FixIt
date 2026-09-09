import apiClient from "../../api/client";
import type {
  Service,
  ServiceCategory,
} from "../../types/service";

export async function getServiceCategories(): Promise<
  ServiceCategory[]
> {
  const response = await apiClient.get<ServiceCategory[]>(
    "/services/categories",
  );

  return response.data;
}

export async function getServices(
  categoryId?: number,
): Promise<Service[]> {
  const response = await apiClient.get<Service[]>(
    "/services",
    {
      params:
        categoryId !== undefined
          ? { category_id: categoryId }
          : undefined,
    },
  );

  return response.data;
}