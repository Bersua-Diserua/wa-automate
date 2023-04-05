import type { Connection, Channel, ConsumeMessage } from "amqplib"
import { z } from "zod"
import { type WASocket } from "@adiwajshing/baileys"
import { phoneToJid } from "../../utils/parse-number-jid"

const KEY_QUEQUE = "task_backend"

const AVAILABLE_COMMAND = z.enum([
  "MESSAGE.SINGLE",
  "MESSAGE.BULK",
  "RESERVATION.TICKET",
  "RESERVATION.SUCCESS",
  "RESERVATION.MESSAGE",
  "RESERVATION.REJECT",
])

export async function newHandlerBroker(connection: Connection) {
  const channel = await connection.createChannel()
  await channel.assertQueue(KEY_QUEQUE, {
    durable: true,
  })

  channel.prefetch(1)

  await channel.consume(
    KEY_QUEQUE,
    async function (msg) {
      const raw = msg?.content?.toString()
      if (!raw) {
        channel.ack(msg)
      }

      const parsed = JSON.parse(raw)
      const validateCommand = AVAILABLE_COMMAND.safeParse(parsed?.command)

      if (!validateCommand.success) {
        console.log(`${parsed?.command} not available`)
        channel.ack(msg)
        return
      }

      await commandRouting(
        validateCommand.data,
        parsed.payload,
        channel,
        msg,
        WA_SOCKET
      )
    },
    { noAck: false }
  )
}

export async function commandRouting(
  command: z.infer<typeof AVAILABLE_COMMAND>,
  payload: TObjUnknown,
  channel: Channel,
  msg: ConsumeMessage,
  socket: WASocket
) {
  try {
    if (command === "MESSAGE.SINGLE") {
      const { phoneNumber, message } = payload
      socket
        .sendMessage(phoneToJid(String(phoneNumber)), {
          text: String(message),
        })
        .then(() => channel.ack(msg))
      return
    }

    console.log("Unreachable")
  } catch (error) {
    console.error(error)
    channel.nack(msg)
  }
}
