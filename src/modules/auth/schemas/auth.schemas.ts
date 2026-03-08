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

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
