import { z } from 'zod';
export const email = z.string().email('Проверьте адрес почты');
export const password = z.string().min(12, 'Минимум 12 символов').max(128, 'Максимум 128 символов');
export const loginSchema = z.object({ email, password: z.string().min(1, 'Введите пароль') });
export const registerSchema = z.object({ email, password, confirmPassword: z.string() }).refine(v => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Пароли не совпадают' });
export const itemInputSchema = z.object({ title: z.string().trim().min(2, 'Введите название').max(120), categoryId: z.string().min(1, 'Выберите категорию'), description: z.string().max(5000), year: z.string().max(30), country: z.string().max(100), condition: z.string().max(200), notes: z.string().max(10000), material: z.string().max(100) });
export const listingInputSchema = itemInputSchema.extend({ price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Введите цену, например 250.00').refine(v => Number(v) > 0, 'Цена должна быть больше нуля'), currency: z.enum(['USD', 'UZS', 'EUR']), location: z.string().trim().min(2, 'Укажите город'), priceType: z.enum(['fixed', 'negotiable']), contactPreference: z.enum(['in_app', 'request']) });
