import type { WAMessage } from "@adiwajshing/baileys"
import { getDefaultMessage, getResponseByCommand } from "../lib/backend.lib"

import Logger from "../utils/logger"
import { isKeyAlive } from "../packages/redis/utils"
import { jidToPhone } from "../utils/parse-number-jid"
import {
  CustomerSchema,
  obtainCustomerByPhoneNumber,
} from "../package/customer"
import { redisClient } from "../packages/redis"
import { timeToExpire } from "./internal"
import { initMessageHandler } from "../package/customer"

type SeruaMessage = {
  commandCode?: number
  customer: CustomerSchema
} & WAMessage

const messageHandler = async (_message: WAMessage) => {
  const jid = _message.key.remoteJid!
  const message = await initMessageHandler(_message).catch(() => {
    console.log(`[jid: ${jid}] - Error obtaining data`)
    return 1
  })

  if (typeof message === "number") return
  if ("group" in message) return
  const phoneNumber = message.getPhoneNumber()

  try {
    const customer = await obtainCustomerByPhoneNumber(phoneNumber)
    console.log({ customer })

    const parsedMessage = getParseMessage(message)
    parsedMessage.customer = customer

    if (await isKeyAlive(jidToPhone(jid))) {
      redisClient.set(jidToPhone(jid), "live-assist", "EX", timeToExpire)
      return
    } else {
      if (
        parsedMessage &&
        parsedMessage.commandCode &&
        !isNaN(parsedMessage.commandCode)
      ) {
        await getResponseByCommand(jidToPhone(jid), parsedMessage.commandCode)
        return
      } else {
        await getDefaultMessage(jidToPhone(jid))
        return
      }
    }
  } catch (error) {
    Logger.error(`Message error with jid: ${jid}`, message)
    if (error instanceof Error) {
      Logger.error(`Message handler error: ${error.name}`, error)
    } else {
      Logger.error(`Message handler error`, new Error(error as string))
    }
  }
}

function getParseMessage(msg: WAMessage): SeruaMessage {
  return {
    ...msg,
    commandCode:
      Number(
        msg.message &&
          (msg.message.conversation?.trim() ||
            msg.message.extendedTextMessage?.text?.trim())
      ) ?? undefined,
  } as SeruaMessage
}

export { messageHandler }
