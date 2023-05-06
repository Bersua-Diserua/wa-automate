import { api } from "../api"

async function start(phoneNumber: string) {
  return api.post("/live-assist/add", {
    phoneNumber,
  })
}

async function end(phoneNumber: string) {
  return api.post("/live-assist/end", {
    phoneNumber,
  })
}

export function liveAssistApi() {
  return {
    start,
    end,
  }
}
