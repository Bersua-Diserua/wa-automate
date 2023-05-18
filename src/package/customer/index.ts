import { api } from "../api"
import { z } from "zod"

const customerSchema = z.object({
  isBlocked: z.boolean().catch(false),
  id: z.string().min(1),
  name: z.string().min(1).nullable().catch(null),
  phoneNumber: z.string().min(1),
  isLiveAssist: z.boolean().catch(false),
})

export type CustomerSchema = z.infer<typeof customerSchema>

export async function obtainCustomerByPhoneNumber(phoneNumber: string) {
  const { data, status } = await api.get("/customer/data", {
    params: { phoneNumber },
  })

  const validate = customerSchema.safeParse(data.payload.customer)
  if (!validate.success) {
    console.log(validate.error)
    throw new Error(validate.error.toString())
  }
  return validate.data
}
