export {}
import { type WASocket } from "@whiskeysockets/baileys"

declare global {
  type TResponse<TObj extends unknown = unknown> = {
    message: string
    payload: TObj
  }

  type Customer = {
    name: string
    phoneNumber: string
  }

  var WA_SOCKET: WASocket

  type TObjUnknown = Record<string, unknown>
}
