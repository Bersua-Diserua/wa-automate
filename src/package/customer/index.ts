import qs from "qs"
import { api } from "../api"

export async function obtainCustomerByPhoneNumber(phoneNumber: string) {
  const query = qs.stringify({ phoneNumber })
  const { data } = await api.get("/customer/data?" + query)
  return data
}
