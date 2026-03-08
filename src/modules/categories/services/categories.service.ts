import { apiFetch } from "@/shared/lib/api-client";
import { BillTypeEnum } from "../types/categories.types";
import type {
  Category,
  CategoryLimit,
  CreateCategoryRequest,
  ParentCategory,
  UpdateCategoryLimitRequest,
  UpdateCategoryRequest,
} from "../types/categories.types";

async function getByType(type: BillTypeEnum): Promise<ParentCategory[]> {
  return apiFetch<ParentCategory[]>(`/api/categories?type=${type}`, {
    method: "GET",
  });
}

async function create(data: CreateCategoryRequest): Promise<Category> {
  return apiFetch<Category>("/api/categories/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function update(
  id: number,
  data: UpdateCategoryRequest,
): Promise<Category> {
  return apiFetch<Category>(`/api/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

async function remove(id: number): Promise<void> {
  return apiFetch<void>(`/api/categories/${id}`, {
    method: "DELETE",
  });
}

async function getLimit(id: number): Promise<CategoryLimit> {
  return apiFetch<CategoryLimit>(`/api/categories/${id}/limit`, {
    method: "GET",
  });
}

async function updateLimit(
  id: number,
  data: UpdateCategoryLimitRequest,
): Promise<Category> {
  return apiFetch<Category>(`/api/categories/${id}/limit`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export const categoriesService = {
  getByType,
  create,
  update,
  remove,
  getLimit,
  updateLimit,
};
