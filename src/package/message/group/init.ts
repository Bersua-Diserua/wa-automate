import type { WAMessage } from "@adiwajshing/baileys"
import { initGeneralHandler } from "../general-handler"
import { z } from "zod"
import { liveAssistApi } from "../../live-assist"
import { phoneToJid } from "../../../utils/parse-number-jid"
import { getRsvpManagement } from "../../api/rsvp"
import { zonedTimeToUtc } from "date-fns-tz"

const COMMANDS = z.enum(["CLOSE", "COMMANDS", "TEST", "PERINTAH", "RSVP1"])
export type Command = z.infer<typeof COMMANDS>

export async function initGroupHandler(msg: WAMessage) {
  const general = await initGeneralHandler(msg)
  const { jid } = general

  const sendText = (text: string, isReplay = false) =>
    WA_SOCKET.sendMessage(jid, { text }, { quoted: isReplay ? msg : undefined })

  return {
    group: {
      sendText,
    },
    ...general,
    ...msg,
    handleCommand: async function (this) {
      const command = getInternalGroupCommand(this)
      if (!command) return
      // return WA_SOCKET.sendMessage(this.jid, {
      //   text: "Perintah tidak ditemukan",
      // })
      else {
        switch (command) {
          case "TEST":
            break
          case "CLOSE":
            const target =
              this.message?.extendedTextMessage?.contextInfo?.quotedMessage?.contactMessage?.vcard
                ?.split(/[:,;]/)[4]
                .replace("+", "")

            if (!target)
              return sendText(
                `Error: ${target} is invalid type as phone number`
              )

            await Promise.all([
              liveAssistApi().end(target),
              WA_SOCKET.chatModify({ pin: false }, phoneToJid(target)),
              WA_SOCKET.sendMessage(phoneToJid(target), {
                text: "Sesi live chat mu berhenti",
              }),
              sendText(`Sesi live chat dihentikan: ${target}`, true),
            ])
            break
          case "COMMANDS":
          case "PERINTAH":
            await sendText(COMMANDS.options.join(" | "), true)
            break
          case "RSVP1":
            const rsvp = await getRsvpManagement(new Date().toISOString())
            const parsedMsg = `List reservasi: ${zonedTimeToUtc(
              new Date().toISOString(),
              "America/Sitka"
            )}
`
            await sendText(parsedMsg, true)
            break
          default:
            console.error("Unreachable")
            break
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
