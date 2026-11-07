import z from "zod";

export const loginSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Неверный формат email"),
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
    confirmPassword: z.string(),
    agreedToTerms: z
      .boolean()
      .refine((val) => val === true, "Необходимо согласиться с условиями"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const forgotSchema = z.object({
  email: z.string().email("Неверный формат email"),
});

export const verifySchema = z.object({
  code: z.string().length(5, "Код должен содержать 5 цифр"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(5, "Пароль должен содержать минимум 5 символов"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotFormData = z.infer<typeof forgotSchema>;
export type VerifyFormData = z.infer<typeof verifySchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
