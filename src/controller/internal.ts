import Logger from "../utils/logger"
import { SeruaEventMap } from "../types/event"
import { VCARD_CUSTOMER_TEMPLATE } from "../message"
import { WASocket } from "@adiwajshing/baileys"
import { redisClient } from "../packages/redis"

export const timeToExpire = 60 * 1 // format in second
const groupJid = "120363106344820994@g.us"

const internalController = async (
  socket: WASocket,
  data: SeruaEventMap["internal"]
) => {
  try {
    if (data.type === "live-assist") {
      const phone = data.data.phone

      redisClient.set(phone, "live-assist", "EX", timeToExpire)

      //   send to group
      socket.sendMessage(groupJid, {
        text: "Halo ada yang butuh assist",
      })

      socket.sendMessage(groupJid, {
        contacts: {
          displayName: "+" + phone,
          contacts: [{ vcard: VCARD_CUSTOMER_TEMPLATE(phone) }],
        },
      })
    }
  } catch (err) {
    if (err instanceof Error) {
      Logger.error(err.message, err.stack)
    } else {
      Logger.error("error", new Error(err))
    }
  }
}

export { internalController }
