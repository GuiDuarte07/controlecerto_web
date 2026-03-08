export enum BillTypeEnum {
  EXPENSE = 0,
  INCOME = 1,
}

export interface Category {
  id: number;
  parentId: number | null;
  name: string;
  icon: string;
  billType: BillTypeEnum;
  color: string;
  limit: number | null;
}

export interface ParentCategory {
  id: number;
  name: string;
  icon: string;
  billType: BillTypeEnum;
  color: string;
  amount: number;
  limit: number | null;
  subCategories: Category[];
}

export interface CategoryLimit {
  isParentLimit: boolean;
  actualLimit: number;
  availableMonthLimit: number;
  accumulatedLimit: number;
}

export interface CreateCategoryRequest {
  name: string;
  icon: string;
  billType: BillTypeEnum;
  color: string;
  parentId?: number | null;
  limit?: number | null;
}

export interface UpdateCategoryRequest {
  id: number;
  name?: string;
  icon?: string;
  color?: string;
  parentId?: number | null;
}

export interface UpdateCategoryLimitRequest {
  categoryId: number;
  amount: number;
}
