import type { WAMessage } from "@adiwajshing/baileys"

import Logger from "../utils/logger"
import { CustomerSchema } from "../package/customer"
import { initMessageAdapter } from "../package/message"

type SeruaMessage = {
  commandCode?: number
  customer: CustomerSchema
} & WAMessage

const messageHandler = async (_message: WAMessage) => {
  const jid = _message.key.remoteJid!
  const message = await initMessageAdapter(_message).catch((e) => {
    console.log(`[jid: ${jid}] - Error obtaining data, reason: ${e}`)
    return {
      isError: true,
      reason: e,
    }
  })

  if ("isError" in message) return

  try {
    if (message.fromMe()) return

    if ("group" in message) {
      // console.log(JSON.stringify(message, null, 2))

      // await global.WA_SOCKET.sendMessage(jid, {
      //   text: JSON.stringify(message, null, 2),
      // })

      return await message.handleCommand()
    }

    if ("customer" in message) {
      return await message.responseHandler()
    }

    // const customer = await obtainCustomerByPhoneNumber(phoneNumber)
    // console.log({ customer })

    // const parsedMessage = getParseMessage(message)
    // parsedMessage.customer = customer

    // if (await isKeyAlive(jidToPhone(jid))) {
    //   redisClient.set(jidToPhone(jid), "live-assist", "EX", timeToExpire)
    //   return
    // } else {
    //   if (
    //     parsedMessage &&
    //     parsedMessage.commandCode &&
    //     !isNaN(parsedMessage.commandCode)
    //   ) {
    //     await getResponseByCommand(jidToPhone(jid), parsedMessage.commandCode)
    //     return
    //   } else {
    //     await getDefaultMessage(jidToPhone(jid))
    //     return
    //   }
    // }
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
