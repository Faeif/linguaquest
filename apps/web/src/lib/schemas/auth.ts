import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
  .regex(/[A-Z]/, 'ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว')

export const RegisterSchema = z
  .object({
    name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร').max(50),
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'กรุณายอมรับข้อตกลงการใช้งานก่อนดำเนินการต่อ' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
  })

export const LoginSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
})

export const ResetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
