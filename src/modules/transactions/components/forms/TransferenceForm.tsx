"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { SearchableItemSelect } from "@/shared/components/SearchableItemSelect";
import { useAccountsStore } from "@/modules/accounts/context/accountsContext";
import { toAccountSearchableItem } from "@/modules/accounts";
import { transferenceFormSchema, type TransferenceFormData } from "../../schemas/transactions.schemas";
import { CurrencyInput } from "./CurrencyInput";
import { DatePickerInput } from "./DatePickerInput";

interface TransferenceFormProps {
  onSubmit: (data: TransferenceFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: Partial<TransferenceFormData>;
}

export function TransferenceForm({ onSubmit, onCancel, isSubmitting, initialData }: TransferenceFormProps) {
  const t = useTranslations("transactions");
  const accounts = useAccountsStore((s) => s.accounts);

  const accountOptions = useMemo(
    () => accounts.map(toAccountSearchableItem),
    [accounts],
  );

  const resolveErrorMessage = (message?: string) => {
    if (!message) return "";
    try {
      return t(message as Parameters<typeof t>[0]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      return message;
    }
  };

  const form = (useForm<TransferenceFormData>({
    // @ts-ignore - Temporary Zod v4 resolver typing mismatch
    resolver: zodResolver(transferenceFormSchema),
    defaultValues: {
      amount: initialData?.amount ?? undefined,
      purchaseDate: initialData?.purchaseDate ?? new Date(),
      accountOriginId: initialData?.accountOriginId ?? undefined,
      accountDestinyId: initialData?.accountDestinyId ?? undefined,
      description: initialData?.description ?? "",
    },
  }) as unknown) as UseFormReturn<TransferenceFormData>;

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create.amount")}</FormLabel>
              <FormControl>
                <CurrencyInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage>{errors.amount && resolveErrorMessage(errors.amount.message)}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purchaseDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create.date")}</FormLabel>
              <FormControl>
                <DatePickerInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage>{errors.purchaseDate && resolveErrorMessage(errors.purchaseDate.message)}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountOriginId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create.accountOrigin")}</FormLabel>
              <FormControl>
                <SearchableItemSelect
                  items={accountOptions}
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                  placeholder={t("create.accountOrigin")}
                />
              </FormControl>
              <FormMessage>{errors.accountOriginId && resolveErrorMessage(errors.accountOriginId.message)}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountDestinyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create.accountDestiny")}</FormLabel>
              <FormControl>
                <SearchableItemSelect
                  items={accountOptions}
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                  placeholder={t("create.accountDestiny")}
                />
              </FormControl>
              <FormMessage>{errors.accountDestinyId && resolveErrorMessage(errors.accountDestinyId.message)}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create.description")}</FormLabel>
              <FormControl>
                <Input {...field} maxLength={100} placeholder={t("create.description")} />
              </FormControl>
              <FormMessage>{errors.description && resolveErrorMessage(errors.description.message)}</FormMessage>
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            {t("create.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? t("create.saving") : t("create.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
