"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Trash2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ApiError } from "@/shared/lib/api-client";
import { useAuthStore } from "../context/authContext";
import { userService } from "../services/userService";

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export function ProfileSettingsCard() {
  const t = useTranslations("settings.profile");
  const user = useAuthStore((state) => state.user);
  const updateAvatar = useAuthStore((state) => state.updateAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isSendingConfirmEmail, setIsSendingConfirmEmail] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(
    null,
  );

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const MAX_SIZE = 10 * 1024 * 1024;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploadError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      const message = t("avatar.errorType");
      setAvatarUploadError(message);
      toast.error(message);
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      const message = t("avatar.errorSize");
      setAvatarUploadError(message);
      toast.error(message);
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const updated = await userService.uploadAvatar(file);
      updateAvatar(updated.avatarUrl ?? null);
      setAvatarUploadError(null);
      toast.success(t("avatar.uploadSuccess"));
    } catch (error) {
      const isPayloadTooLargeError =
        (error instanceof ApiError && error.code === 413) ||
        (error instanceof Error &&
          (error.message.toLowerCase().includes("request body too large") ||
            error.message.toLowerCase().includes("failed to read the request form") ||
            error.message.toLowerCase().includes("payload too large")));

      const message = isPayloadTooLargeError
        ? t("avatar.errorSize")
        : error instanceof Error && error.message
          ? error.message
          : t("avatar.errorUpload");

      setAvatarUploadError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await userService.deleteAvatar();
      updateAvatar(null);
      toast.success(t("avatar.removeSuccess"));
    } catch {
      toast.error(t("avatar.errorType"));
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSendConfirmEmail = async () => {
    setIsSendingConfirmEmail(true);
    try {
      await userService.sendConfirmEmail();
      toast.success(t("emailStatus.confirmationSent"));
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t("emailStatus.confirmationError");
      toast.error(message);
    } finally {
      setIsSendingConfirmEmail(false);
    }
  };

  const memberSince = user
    ? new Date(
        (user as unknown as { createdAt?: string }).createdAt ?? Date.now()
      ).toLocaleDateString(undefined, { year: "numeric", month: "long" })
    : null;

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <Avatar className="h-24 w-24">
            {user?.avatarUrl && (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            )}
            <AvatarFallback className="bg-primary/15 text-primary text-2xl">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isRemoving}
            aria-label={t("avatar.change")}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex flex-col items-center gap-3 sm:items-start">
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground">{t("avatar.label")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground/70">
              {t("avatar.dragHint")}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isRemoving}
            >
              <Camera className="h-3.5 w-3.5" />
              {isUploading ? t("avatar.uploading") : t("avatar.change")}
            </Button>

            {user?.avatarUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading || isRemoving}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isRemoving ? t("avatar.removing") : t("avatar.remove")}
              </Button>
            )}
          </div>

          {avatarUploadError && (
            <p
              role="alert"
              className="text-center text-xs text-destructive sm:text-left"
            >
              {avatarUploadError}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t" />

      {/* User info */}
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("name")}
          </dt>
          <dd className="text-sm font-medium">{user?.name ?? "—"}</dd>
        </div>

        <div className="space-y-1">
          <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("email")}
          </dt>
          <dd className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{user?.email ?? "—"}</span>
            {user?.emailConfirmed ? (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                {t("emailStatus.confirmed")}
              </Badge>
            ) : (
              <>
                <Badge variant="secondary" className="flex items-center gap-1 text-xs text-amber-600">
                  <XCircle className="h-3 w-3" />
                  {t("emailStatus.unconfirmed")}
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSendConfirmEmail}
                  disabled={isSendingConfirmEmail}
                  className="h-6 px-2 text-[11px]"
                >
                  {isSendingConfirmEmail
                    ? t("emailStatus.sending")
                    : t("emailStatus.sendButton")}
                </Button>
              </>
            )}
          </dd>
        </div>

        {memberSince && (
          <div className="space-y-1">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("memberSince")}
            </dt>
            <dd className="text-sm font-medium">{memberSince}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
