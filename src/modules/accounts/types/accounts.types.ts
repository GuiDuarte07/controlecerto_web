export interface Account {
  id: number;
  balance: number;
  description: string | null;
  bank: string;
  color: string;
}

export interface CreateAccountRequest {
  balance: number;
  description?: string;
  bank: string;
  color: string;
}

export interface UpdateAccountRequest {
  id: number;
  balance?: number;
  description?: string;
  bank?: string;
  color?: string;
}
