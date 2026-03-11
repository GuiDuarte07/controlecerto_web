"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Palette } from "lucide-react";
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
import { Spinner } from "@/shared/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import type { IconName } from "@/shared/components/DynamicIcon";
import { SearchableItemSelect } from "@/shared/components/SearchableItemSelect";
import type { SearchableItem } from "@/shared/components/SearchableItemSelect";
import { BillTypeEnum } from "../types/categories.types";
import type { Category, ParentCategory } from "../types/categories.types";
import {
  categoryFormSchema,
  type CategoryFormData,
} from "../schemas/categories.schemas";
import { CategoryIconPicker } from "./CategoryIconPicker";

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308",
  "#84CC16", "#22C55E", "#14B8A6", "#06B6D4",
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7",
  "#EC4899", "#F43F5E", "#78716C", "#64748B",
];

interface CategoryDialogProps {
  open: boolean;
  mode: "create" | "edit";
  category: Category | ParentCategory | null;
  defaultBillType: BillTypeEnum;
  defaultParentId?: number;
  parentOptions: SearchableItem[];
  isSubmitting: boolean;
  error: ApiError | null;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: CategoryFormData) => Promise<void>;
  onUpdate: (id: number, data: CategoryFormData) => Promise<void>;
}

function resolveDefaultValues(
  category: Category | ParentCategory | null,
  defaultBillType: BillTypeEnum,
  defaultParentId?: number,
): CategoryFormData {
  return {
    name: category?.name ?? "",
    icon: category?.icon ?? "leaf",
    billType: category?.billType ?? defaultBillType,
    color: category?.color ?? PRESET_COLORS[8],
    parentId: (category as Category)?.parentId ?? defaultParentId ?? null,
    limit: category?.limit ?? null,
  };
}

function getContrastColor(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness >= 150 ? "#111111" : "#FFFFFF";
}

export function CategoryDialog({
  open,
  mode,
  category,
  defaultBillType,
  defaultParentId,
  parentOptions,
  isSubmitting,
  error,
  onOpenChange,
  onCreate,
  onUpdate,
}: CategoryDialogProps) {
  const t = useTranslations("categories");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const form = (useForm<CategoryFormData>({
    // @ts-expect-error - Zod v4 incompatibility with @hookform/resolvers
    resolver: zodResolver(categoryFormSchema),
    defaultValues: resolveDefaultValues(category, defaultBillType, defaultParentId),
  }) as unknown) as UseFormReturn<CategoryFormData>;

  const { watch, setValue, reset, formState: { errors } } = form;

  useEffect(() => {
    if (open) {
      reset(resolveDefaultValues(category, defaultBillType, defaultParentId));
    }
  }, [open, category, defaultBillType, defaultParentId, reset]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedColor = watch("color") ?? PRESET_COLORS[8];
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedIcon = watch("icon") ?? "leaf";

  const safeColor = useMemo(
    () => (HEX_COLOR_REGEX.test(watchedColor) ? watchedColor : PRESET_COLORS[8]),
    [watchedColor],
  );

  const filteredParentOptions = useMemo(
    () => parentOptions,
    [parentOptions],
  );

  const resolveErrorMessage = (message?: string) => {
    if (!message) return "";
    if (t.has(message)) return t(message as never);
    return message;
  };

  const onSubmit = form.handleSubmit(async (data) => {
    const payload = data as unknown as CategoryFormData;
    if (mode === "edit" && category) {
      await onUpdate(category.id, payload);
    } else {
      await onCreate(payload);
    }
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] w-[95vw] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? t("dialog.editTitle") : t("dialog.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {mode === "edit"
                ? t("dialog.editDescription")
                : t("dialog.createDescription")}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-5">
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {resolveErrorMessage(error.message)}
                </div>
              )}

              {/* Preview */}
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: safeColor }}
                >
                  <DynamicIcon
                    name={watchedIcon as IconName}
                    className="h-5 w-5"
                    style={{ color: getContrastColor(safeColor) }}
                  />
                </span>
                <div>
                  <p className="text-sm font-medium">
                    {watch("name") || t("dialog.namePlaceholder")}
                  </p>
                  <p className="text-xs text-muted-foreground">{safeColor}</p>
                </div>
              </div>

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dialog.name")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("dialog.namePlaceholder")}
                        maxLength={60}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage>
                      {errors.name && resolveErrorMessage(errors.name.message)}
                    </FormMessage>
                  </FormItem>
                )}
              />

              {/* Bill Type + Icon row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Bill Type */}
                <FormField
                  control={form.control}
                  name="billType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("dialog.type")}</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          value={String(field.value)}
                          onValueChange={(v) => {
                            if (v !== "") field.onChange(Number(v) as BillTypeEnum);
                          }}
                          className="justify-start"
                          disabled={isSubmitting}
                        >
                          <ToggleGroupItem value={String(BillTypeEnum.EXPENSE)} className="flex-1 text-xs">
                            {t("dialog.expense")}
                          </ToggleGroupItem>
                          <ToggleGroupItem value={String(BillTypeEnum.INCOME)} className="flex-1 text-xs">
                            {t("dialog.income")}
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage>
                        {errors.billType && resolveErrorMessage(errors.billType.message)}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                {/* Icon */}
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("dialog.icon")}</FormLabel>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start gap-2 font-normal"
                          disabled={isSubmitting}
                          onClick={() => setIconPickerOpen(true)}
                        >
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                            style={{ backgroundColor: safeColor }}
                          >
                            <DynamicIcon
                              name={field.value as IconName}
                              className="h-3 w-3"
                              style={{ color: getContrastColor(safeColor) }}
                            />
                          </span>
                          <span className="truncate text-xs">{field.value}</span>
                        </Button>
                      </FormControl>
                      <FormMessage>
                        {errors.icon && resolveErrorMessage(errors.icon.message)}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>

              {/* Color */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dialog.color")}</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {PRESET_COLORS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              title={preset}
                              disabled={isSubmitting}
                              onClick={() => field.onChange(preset)}
                              className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                              style={{
                                backgroundColor: preset,
                                borderColor: field.value === preset ? "#111" : "transparent",
                                transform: field.value === preset ? "scale(1.2)" : undefined,
                              }}
                            />
                          ))}
                          {/* Custom color picker */}
                          <div className="relative">
                            <input
                              type="color"
                              value={safeColor}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              disabled={isSubmitting}
                              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                              title={t("dialog.colorHint")}
                            />
                            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 bg-background hover:border-primary">
                              <Palette className="h-3 w-3 text-muted-foreground" />
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Input
                            {...field}
                            placeholder="#3B82F6"
                            maxLength={7}
                            disabled={isSubmitting}
                            className="h-8 w-28 font-mono text-xs uppercase"
                          />
                          <p className="text-xs text-muted-foreground">
                            {t("dialog.colorHint")}
                          </p>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage>
                      {errors.color && resolveErrorMessage(errors.color.message)}
                    </FormMessage>
                  </FormItem>
                )}
              />

              {/* Parent Category */}
              <Controller
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dialog.parentCategory")}</FormLabel>
                    <FormControl>
                      <SearchableItemSelect
                        items={filteredParentOptions}
                        value={field.value ?? null}
                        onChange={(v) => field.onChange(v ? Number(v) : null)}
                        placeholder={t("dialog.noParent")}
                        searchPlaceholder={t("parentSelect.searchPlaceholder")}
                        clearLabel={t("dialog.noParent")}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Limit */}
              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("dialog.limit")}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({t("dialog.limitOptional")})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={t("dialog.limitPlaceholder")}
                        disabled={isSubmitting}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? null : e.target.value)
                        }
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">{t("dialog.limitHint")}</p>
                    <FormMessage>
                      {errors.limit && resolveErrorMessage(errors.limit.message as string)}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={() => onOpenChange(false)}
                >
                  {t("dialog.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Spinner className="mr-2 h-4 w-4" />{t("dialog.saving")}</>
                  ) : (
                    t("dialog.save")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <CategoryIconPicker
        open={iconPickerOpen}
        value={watchedIcon}
        previewColor={safeColor}
        onOpenChange={setIconPickerOpen}
        onSelect={(icon) => {
          setValue("icon", icon, { shouldValidate: true });
        }}
      />
    </>
  );
}
