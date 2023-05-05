export * from "./state"

import { api } from "../api"
import qs from "qs"
import { z } from "zod"

type ResCustomer = TResponse<{ customer: Customer }>

const customerSchema = z.object({
  isBlocked: z.boolean().catch(false),
  id: z.string().min(1),
  name: z.string().min(1).nullable().catch(null),
  phoneNumber: z.string().min(1),
})

export type CustomerSchema = z.infer<typeof customerSchema>

export async function obtainCustomerByPhoneNumber(phoneNumber: string) {
  const query = qs.stringify({ phoneNumber })
  const { data } = await api.get("/customer/data?" + query)
  const validate = customerSchema.safeParse(data.payload.customer)
  if (!validate.success) throw new Error(validate.error.toString())
  return validate.data
}
