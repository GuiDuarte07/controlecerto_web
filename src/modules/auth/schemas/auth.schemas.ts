import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email({ message: "auth.login.errors.emailInvalid" })
    .min(1, { message: "auth.login.errors.emailRequired" }),
  password: z
    .string()
    .min(1, { message: "auth.login.errors.passwordRequired" })
    .min(4, { message: "auth.login.errors.passwordTooShort" }),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "auth.register.errors.nameRequired" })
      .min(5, { message: "auth.register.errors.nameTooShort" }),
    email: z
      .email({ message: "auth.register.errors.emailInvalid" })
      .min(1, { message: "auth.register.errors.emailRequired" }),
    password: z
      .string()
      .min(1, { message: "auth.register.errors.passwordRequired" })
      .min(4, { message: "auth.register.errors.passwordTooShort" })
      .max(30, { message: "auth.register.errors.passwordTooLong" }),
    confirmPassword: z
      .string()
      .min(1, { message: "auth.register.errors.passwordRequired" }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "auth.register.errors.termsRequired",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "auth.register.errors.passwordMismatch",
    path: ["confirmPassword"],
  });

export const forgotPasswordRequestSchema = z.object({
  email: z
    .email({ message: "auth.forgotPasswordRequest.errors.emailInvalid" })
    .min(1, { message: "auth.forgotPasswordRequest.errors.emailRequired" }),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, { message: "auth.resetPassword.errors.passwordRequired" })
      .min(4, { message: "auth.resetPassword.errors.passwordTooShort" })
      .max(30, { message: "auth.resetPassword.errors.passwordTooLong" }),
    confirmPassword: z.string().min(1, {
      message: "auth.resetPassword.errors.confirmPasswordRequired",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "auth.resetPassword.errors.passwordMismatch",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, { message: "settings.security.errors.oldPasswordRequired" })
      .min(4, { message: "settings.security.errors.passwordTooShort" })
      .max(30, { message: "settings.security.errors.passwordTooLong" }),
    newPassword: z
      .string()
      .min(1, { message: "settings.security.errors.newPasswordRequired" })
      .min(4, { message: "settings.security.errors.passwordTooShort" })
      .max(30, { message: "settings.security.errors.passwordTooLong" }),
    confirmNewPassword: z.string().min(1, {
      message: "settings.security.errors.confirmNewPasswordRequired",
    }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "settings.security.errors.passwordMismatch",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "settings.security.errors.samePassword",
    path: ["newPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordRequestFormData = z.infer<
  typeof forgotPasswordRequestSchema
>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
