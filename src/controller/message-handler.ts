import type { WAMessage, WASocket } from "@adiwajshing/baileys"
import {
  handlerGetDefaultMessage,
  handlerGetResponseByCommand,
} from "../lib/handler-backend.lib"
import { obtainCustomerByPhoneNumber } from "../package/customer"

import { jidToPhone } from "../utils/parse-number-jid"

type SeruaMessage = { commandCode?: number } & WAMessage

const messageHandler = async (socket: WASocket, message: WAMessage) => {
  const jid = message.key.remoteJid!
  try {
    const parsedMessage: SeruaMessage = getParseMessage(message)

    if (!parsedMessage) {
      await handlerGetDefaultMessage(jidToPhone(jid))
      return
    } else {
      await handlerGetResponseByCommand(
        jidToPhone(jid),
        parsedMessage.commandCode
      )
      return
    }
  } catch (error) {
    console.log({
      message: `Message error with jid: ${jid}`,
      context: message,
    })
    if (error instanceof Error) {
      console.log({
        message: `Message handler error: ${error.name}`,
        context: error,
      })
    } else {
      console.log({
        message: `Message handler error`,
        context: new Error(error),
      })
    }
  }
}

const getParseMessage = (msg: WAMessage): SeruaMessage => ({
  ...msg,
  commandCode:
    Number(
      msg.message &&
        (msg.message.conversation?.trim() ||
          msg.message.extendedTextMessage?.text?.trim())
    ) ?? undefined,
})

export { messageHandler }
