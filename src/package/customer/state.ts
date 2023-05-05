import { isGroupJid, jidToPhone } from "../../utils/parse-number-jid"

import type { WAMessage } from "@adiwajshing/baileys"

type CustomerHandler = {
  customer: {}
}

type GroupHandler = {
  group: {}
}

type GeneralHandler = {
  getPhoneNumber(): string
  fromMe(): boolean
  getNameAccount(): WAMessage["pushName"]
}

export type BSMessage<T> = T & WAMessage & GeneralHandler

/* -------------------------------------------------------------------------- */
/*                        Entrypoint of mesage handler                        */
/* -------------------------------------------------------------------------- */
export async function initMessageHandler(msg: WAMessage) {
  const { remoteJid } = msg.key
  const isGroupMessage = isGroupJid(remoteJid!)
  if (isGroupMessage) return initGroupHandler(msg)
  return initCustomerHandler(msg)
}

function initGeneralHandler(msg: WAMessage): GeneralHandler {
  return {
    getNameAccount: () => msg.pushName,
    getPhoneNumber: () => jidToPhone(msg.key.remoteJid!),
    fromMe: () => msg.key.fromMe || false,
  }
}

async function initCustomerHandler(
  msg: WAMessage
): Promise<BSMessage<CustomerHandler>> {
  return {
    customer: {},
    ...initGeneralHandler(msg),
    ...msg,
  }
}

async function initGroupHandler(
  msg: WAMessage
): Promise<BSMessage<GroupHandler>> {
  return {
    group: {},
    ...initGeneralHandler(msg),
    ...msg,
  }
}
