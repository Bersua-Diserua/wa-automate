import type { WAMessage } from "@adiwajshing/baileys"
import { getSysConfig } from "../sys-config"
import { jidToPhone } from "../../utils/parse-number-jid"

export type GeneralHandler = {
  config: Awaited<ReturnType<typeof getSysConfig>>
  jid: string
  getPhoneNumber(): string
  fromMe(): boolean
  getNameAccount(): WAMessage["pushName"]
}

export async function initGeneralHandler(
  msg: WAMessage
): Promise<GeneralHandler> {
  const config = await getSysConfig()

  return {
    config,
    jid: msg.key.remoteJid!,
    getNameAccount: () => msg.pushName,
    getPhoneNumber: () => jidToPhone(msg.key.remoteJid!),
    fromMe: () => msg.key.fromMe || false,
  }
}
