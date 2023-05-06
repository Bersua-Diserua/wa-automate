import type { WAMessage } from "@adiwajshing/baileys"
import { initGeneralHandler } from "../general-handler"
import { obtainCustomerByPhoneNumber } from "../../customer"
import {
  getDefaultMessage,
  getResponseByCommand,
} from "../../../lib/backend.lib"

export async function initCustomerHandler(msg: WAMessage) {
  const general = await initGeneralHandler(msg)
  const { getPhoneNumber } = general

  const phoneNumber = getPhoneNumber()
  const customer = await obtainCustomerByPhoneNumber(phoneNumber)

  return {
    customer: {
      ...customer,
    },
    ...general,
    ...msg,
    responseHandler: async function (this) {
      if (customer.isLiveAssist) return

      const command = getCommandCodeMessage(this)
      if (Number.isNaN(command)) {
        return await getDefaultMessage(phoneNumber)
      } else {
        return await getResponseByCommand(phoneNumber, command)
      }
    },
  }
}

function getCommandCodeMessage(msg: WAMessage) {
  return Number(
    msg.message &&
      (msg.message.conversation?.trim() ||
        msg.message.extendedTextMessage?.text?.trim())
  )
}
