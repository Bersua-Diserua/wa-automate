import qs from "qs"
import { api } from "../api"

type ResCustomer = TResponse<{ customer: Customer }>

export async function obtainCustomerByPhoneNumber(phoneNumber: string) {
  const query = qs.stringify({ phoneNumber })
  const { data } = await api.get<ResCustomer>("/customer/data?" + query)
  return data.payload.customer
}
