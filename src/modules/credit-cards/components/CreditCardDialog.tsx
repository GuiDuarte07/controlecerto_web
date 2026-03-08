"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiError } from "@/shared/lib/api-client";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Spinner } from "@/shared/components/ui/spinner";
import { SearchableItemSelect } from "@/shared/components/SearchableItemSelect";
import type { SearchableItem } from "@/shared/components/SearchableItemSelect";
import {
  creditCardFormSchema,
  updateCreditCardFormSchema,
  type CreditCardFormData,
  type UpdateCreditCardFormData,
} from "../schemas/creditCards.schemas";
import type { CreditCard } from "../types/creditCards.types";

interface CreditCardDialogProps {
  open: boolean;
  mode: "create" | "edit";
  card: CreditCard | null;
  accountOptions: SearchableItem[];
  isSubmitting: boolean;
  error: ApiError | null;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: CreditCardFormData) => Promise<void>;
  onUpdate: (id: number, data: UpdateCreditCardFormData) => Promise<void>;
}

function resolveDefaultValues(card: CreditCard | null): CreditCardFormData {
  return {
    totalLimit: card?.totalLimit ?? 0,
    description: card?.description ?? "",
    accountId: card?.account.id ?? 0,
    closeDay: card?.closeDay ?? 1,
    dueDay: card?.dueDay ?? 10,
    skipWeekend: card?.skipWeekend ?? false,
  };
}

function resolveEditValues(card: CreditCard | null): UpdateCreditCardFormData {
  return {
    totalLimit: card?.totalLimit ?? 0,
    description: card?.description ?? "",
  };
}

export function CreditCardDialog({
  open,
  mode,
  card,
  accountOptions,
  isSubmitting,
  error,
  onOpenChange,
  onCreate,
  onUpdate,
}: CreditCardDialogProps) {
  const t = useTranslations("creditCards");

  const resolveErrorMessage = (message?: string) => {
    if (!message) return "";
    if (t.has(message as never)) return t(message as never);
    return message;
  };

  const createForm = (useForm<CreditCardFormData>({
    // @ts-expect-error - Zod v4 incompatibility with @hookform/resolvers
    resolver: zodResolver(creditCardFormSchema),
    defaultValues: resolveDefaultValues(card),
  }) as unknown) as UseFormReturn<CreditCardFormData>;

  const editForm = (useForm<UpdateCreditCardFormData>({
    // @ts-expect-error - Zod v4 incompatibility with @hookform/resolvers
    resolver: zodResolver(updateCreditCardFormSchema),
    defaultValues: resolveEditValues(card),
  }) as unknown) as UseFormReturn<UpdateCreditCardFormData>;

  useEffect(() => {
    if (open) {
      if (mode === "create") {
        createForm.reset(resolveDefaultValues(card));
      } else {
        editForm.reset(resolveEditValues(card));
      }
    }
  }, [open, card, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = createForm.handleSubmit(async (data) => {
    await onCreate(data);
  });

  const handleUpdate = editForm.handleSubmit(async (data) => {
    if (!card) return;
    await onUpdate(card.id, data);
  });

  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("dialog.editTitle") : t("dialog.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("dialog.editDescription") : t("dialog.createDescription")}
          </DialogDescription>
        </DialogHeader>

        {isEdit ? (
          <Form {...editForm}>
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <FormField
                control={editForm.control}
                name="totalLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dialog.totalLimit")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={t("dialog.totalLimitPlaceholder")}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage>
                      {editForm.formState.errors.totalLimit && resolveErrorMessage(editForm.formState.errors.totalLimit.message)}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dialog.description")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("dialog.descriptionPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage>
                      {editForm.formState.errors.description && resolveErrorMessage(editForm.formState.errors.description.message)}
                    </FormMessage>
                  </FormItem>
                )}
              />

              {error && (
                <p className="text-sm text-destructive">
                  {resolveErrorMessage(error.message)}
                </p>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t("dialog.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      {t("dialog.saving")}
                    </>
                  ) : (
                    t("dialog.save")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...createForm}>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dialog.description")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("dialog.descriptionPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage>
                      {createForm.formState.errors.description && resolveErrorMessage(createForm.formState.errors.description.message)}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="totalLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dialog.totalLimit")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={t("dialog.totalLimitPlaceholder")}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage>
                      {createForm.formState.errors.totalLimit && resolveErrorMessage(createForm.formState.errors.totalLimit.message)}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dialog.account")}</FormLabel>
                    <FormControl>
                      <SearchableItemSelect
                        items={accountOptions}
                        value={field.value || null}
                        onChange={(val) => field.onChange(val ?? 0)}
                        placeholder={t("dialog.accountPlaceholder")}
                        searchPlaceholder={t("dialog.accountSearchPlaceholder")}
                        clearLabel={t("dialog.accountClear")}
                      />
                    </FormControl>
                    <FormMessage>
                      {createForm.formState.errors.accountId && resolveErrorMessage(createForm.formState.errors.accountId.message)}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="closeDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("dialog.closeDay")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          placeholder="1–31"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage>
                        {createForm.formState.errors.closeDay && resolveErrorMessage(createForm.formState.errors.closeDay.message)}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="dueDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("dialog.dueDay")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          placeholder="1–31"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage>
                        {createForm.formState.errors.dueDay && resolveErrorMessage(createForm.formState.errors.dueDay.message)}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>

              <Controller
                control={createForm.control}
                name="skipWeekend"
                render={({ field }) => (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label htmlFor="skipWeekend" className="text-sm font-medium">
                        {t("dialog.skipWeekend")}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("dialog.skipWeekendHint")}
                      </p>
                    </div>
                    <Switch
                      id="skipWeekend"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />

              {error && (
                <p className="text-sm text-destructive">
                  {resolveErrorMessage(error.message)}
                </p>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t("dialog.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      {t("dialog.saving")}
                    </>
                  ) : (
                    t("dialog.save")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
