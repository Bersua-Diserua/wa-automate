import type { WAMessage, WASocket } from "@adiwajshing/baileys"
import {
  handlerGetDefaultMessage,
  handlerGetResponseByCommand,
} from "../lib/handler-backend.lib"
import { obtainCustomerByPhoneNumber } from "../package/customer"
import { jidToPhone } from "../utils/parse-number-jid"

import Logger from "../utils/logger"
import { isKeyAlive } from "../packages/redis/utils"
import { redisClient } from "../packages/redis"
import { timeToExpire } from "./internal"

type SeruaMessage = { commandCode?: number; customer: Customer } & WAMessage

const messageHandler = async (socket: WASocket, message: WAMessage) => {
  const jid = message.key.remoteJid!
  const phoneNumber = jidToPhone(jid)

  try {
    const customer = await obtainCustomerByPhoneNumber(phoneNumber)

    const parsedMessage = getParseMessage(message)
    parsedMessage.customer = customer

    if (await isKeyAlive(jidToPhone(jid))) {
      console.log("alive")
      redisClient.set(jidToPhone(jid), "live-assist", "EX", timeToExpire)
      return
    } else {
      console.log("die")
      if (parsedMessage) {
        await handlerGetResponseByCommand(
          jidToPhone(jid),
          parsedMessage.commandCode
        )
        return
      } else {
        await handlerGetDefaultMessage(jidToPhone(jid))
        return
      }
    }
  } catch (error) {
    Logger.error(`Message error with jid: ${jid}`, message)
    if (error instanceof Error) {
      Logger.error(`Message handler error: ${error.name}`, error)
    } else {
      Logger.error(`Message handler error`, new Error(error))
    }
  }
}

const getParseMessage = (msg: WAMessage): SeruaMessage =>
  ({
    ...msg,
    commandCode:
      Number(
        msg.message &&
          (msg.message.conversation?.trim() ||
            msg.message.extendedTextMessage?.text?.trim())
      ) ?? undefined,
  } as SeruaMessage)

export { messageHandler }
