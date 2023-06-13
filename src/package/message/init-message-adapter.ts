import { GeneralHandler } from "./general-handler"
import type { WAMessage } from "@whiskeysockets/baileys"
import { initCustomerHandler } from "./customer"
import { initGroupHandler } from "./group"
import { isGroupJid } from "../../utils/parse-number-jid"

export type BSMessage<T extends unknown = unknown> = T &
  WAMessage &
  GeneralHandler

/* -------------------------------------------------------------------------- */
/*                        Entrypoint of mesage handler                        */
/* -------------------------------------------------------------------------- */
export async function initMessageAdapter(msg: WAMessage) {
  const { remoteJid } = msg.key

  const isGroupMessage = isGroupJid(remoteJid!)
  if (isGroupMessage) return initGroupHandler(msg)
  return initCustomerHandler(msg)
}
