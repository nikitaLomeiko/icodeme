import z from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "Введите имя"),
  avatar: z.string().min(1, "Выберите аватарку"),
  bio: z.string().min(1, "Расскажите о себе"),
  info: z.string().min(1, "Пройдите опрос до конца"),
});

export const profileEditSchema = z.object({
  name: z
    .string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(50, "Имя не может превышать 50 символов")
    .regex(
      /^[a-zA-Zа-яА-ЯёЁ0-9\s_-]+$/,
      "Имя может содержать только буквы, цифры, пробелы, дефисы и нижние подчеркивания",
    )
    .trim()
    .transform((val) => val.replace(/\s+/g, " ")),
  avatar: z.string().min(1, "Выберите аватар"),
});

export const aboutEditSchema = z.object({
  about: z.string().max(2000, "Описание не может превышать 2000 символов"),
});

export const languageAddSchema = z.object({
  language: z
    .string()
    .min(1, "Выберите язык программирования")
    .min(2, "Название языка должно содержать минимум 2 символа")
    .max(30, "Название языка не может превышать 30 символов")
    .regex(
      /^[a-zA-Zа-яА-ЯёЁ0-9\s#+-]+$/,
      "Название может содержать только буквы, цифры, пробелы и символы #, +, -",
    )
    .trim(),
});

export type LanguageAddFormData = z.infer<typeof languageAddSchema>;

export type AboutEditFormData = z.infer<typeof aboutEditSchema>;

export type ProfileEditFormData = z.infer<typeof profileEditSchema>;

export type ProfileFormData = z.infer<typeof profileSchema>;
