import type { WAMessage } from "@adiwajshing/baileys"
import { initGeneralHandler } from "../general-handler"
import { z } from "zod"

const COMMANDS = z.enum(["CLOSE", "KENNY KOYO?"])
export type Command = z.infer<typeof COMMANDS>

export async function initGroupHandler(msg: WAMessage) {
  const general = await initGeneralHandler(msg)
  const { jid } = general

  const send = (text: string) =>
    WA_SOCKET.sendMessage(jid, {
      text,
    })

  return {
    group: {},
    ...general,
    ...msg,
    handleCommand: function (this) {
      const command = getInternalGroupCommand(this)
      if (!command)
        return WA_SOCKET.sendMessage(this.jid, {
          text: "Ngetik opo deg",
        })
      else {
        if (command === "CLOSE") {
          const target =
            this.message?.extendedTextMessage?.contextInfo?.quotedMessage?.contactMessage?.vcard?.split(
              /[:,;]/
            )[4]
          return send(JSON.stringify({ ...this, target }, null, 2))
        }
      }
    },
  }
}

function getInternalGroupCommand(msg: WAMessage) {
  const text =
    msg.message &&
    (msg.message.conversation || msg.message.extendedTextMessage?.text || "")

  const command = COMMANDS.safeParse(text?.trim().toUpperCase())
  if (!command.success) return null
  return command.data
}
