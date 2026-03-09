import type { SearchableItem } from "@/shared/components/SearchableItemSelect";
import type { Account } from "../types/accounts.types";

export function toAccountSearchableItem(account: Account): SearchableItem {
  return {
    id: account.id,
    label: account.bank,
    color: account.color,
    iconName: "banknote",
  };
}
