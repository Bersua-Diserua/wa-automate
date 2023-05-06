import { api } from "../api"

export async function addLiveAssits(phoneNumber: string) {
  return api.post("/live-assist/add", {
    phoneNumber,
  })
}
