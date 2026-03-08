"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import type { IconName } from "@/shared/components/DynamicIcon";
import { getContrastTextColor } from "@/shared/utils";
import type { Category, ParentCategory } from "../types/categories.types";

interface CategoriesListProps {
  categories: ParentCategory[];
  isLoading: boolean;
  deletingIds: number[];
  onCreateForTab: () => void;
  onEdit: (category: Category | ParentCategory) => void;
  onAddSubcategory: (parent: ParentCategory) => void;
  onDelete: (id: number) => Promise<void>;
}

function CategoryIconBox({ color, icon }: { color: string; icon: string }) {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: color }}
    >
      <DynamicIcon
        name={icon as IconName}
        className="h-4 w-4"
        style={{ color: getContrastTextColor(color) }}
      />
    </span>
  );
}

function DeleteButton({
  id,
  isDeleting,
  onDelete,
  t,
}: {
  id: number;
  isDeleting: boolean;
  onDelete: (id: number) => Promise<void>;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isDeleting}
          aria-label={t("delete")}
          title={t("delete")}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteConfirmDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => void onDelete(id)}
          >
            {isDeleting ? t("deleting") : t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CategoriesList({
  categories,
  isLoading,
  deletingIds,
  onCreateForTab,
  onEdit,
  onAddSubcategory,
  onDelete,
}: CategoriesListProps) {
  const t = useTranslations("categories");

  const deletingSet = useMemo(() => new Set(deletingIds), [deletingIds]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderOpen className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t("empty")}</EmptyTitle>
              <EmptyDescription>{t("createFirst")}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={onCreateForTab}>{t("actionLabel")}</Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y">
          {categories.map((parent) => {
            const isParentDeleting = deletingSet.has(parent.id);

            return (
              <li key={parent.id}>
                {/* Parent row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <CategoryIconBox color={parent.color} icon={parent.icon} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{parent.name}</span>
                      {parent.limit != null && parent.limit > 0 && (
                        <Badge variant="outline" className="border px-1.5 py-0.5 text-xs">
                          {t("limit")}:{" "}
                          <span className="text-emerald-600 dark:text-emerald-400">
                            R$ {parent.limit.toFixed(2)}
                          </span>
                        </Badge>
                      )}
                    </div>
                    {parent.subCategories.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {parent.subCategories.length}{" "}
                        {t("subcategories")}
                      </span>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("addSubcategory")}
                      title={t("addSubcategory")}
                      className="text-muted-foreground"
                      onClick={() => onAddSubcategory(parent)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("edit")}
                      title={t("edit")}
                      className="text-muted-foreground"
                      onClick={() => onEdit(parent)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DeleteButton
                      id={parent.id}
                      isDeleting={isParentDeleting}
                      onDelete={onDelete}
                      t={t}
                    />
                  </div>
                </div>

                {/* Subcategory rows */}
                {parent.subCategories.map((sub) => {
                  const isSubDeleting = deletingSet.has(sub.id);

                  return (
                    <div
                      key={sub.id}
                      className="flex items-center gap-3 border-t border-dashed bg-muted/20 py-2 pl-10 pr-4"
                    >
                      <CategoryIconBox color={sub.color} icon={sub.icon} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm">{sub.name}</span>
                          {sub.limit != null && sub.limit > 0 && (
                            <Badge variant="outline" className="border px-1.5 py-0.5 text-xs">
                              {t("limit")}:{" "}
                              <span className="text-emerald-600 dark:text-emerald-400">
                                R$ {sub.limit.toFixed(2)}
                              </span>
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t("edit")}
                          title={t("edit")}
                          className="text-muted-foreground"
                          onClick={() => onEdit(sub)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DeleteButton
                          id={sub.id}
                          isDeleting={isSubDeleting}
                          onDelete={onDelete}
                          t={t}
                        />
                      </div>
                    </div>
                  );
                })}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
