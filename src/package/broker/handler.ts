import type { Connection, Channel, ConsumeMessage, Message } from "amqplib"
import { z } from "zod"
import { type WASocket } from "@adiwajshing/baileys"
import { phoneToJid } from "../../utils/parse-number-jid"
import { VCARD_CUSTOMER_TEMPLATE } from "../../message"
import { redisClient } from "../../packages/redis"

const KEY_QUEQUE = "task_backend"

const groupJid = "120363106344820994@g.us"

const wording = ["terhubung", "hubungkan"]

export const timeToExpire = 60 * 1 // format in second

const AVAILABLE_COMMAND = z.enum([
  "MESSAGE.SINGLE",
  "MESSAGE.TEXT",
  "MESSAGE.IMAGE",
  "MESSAGE.CONTACT",
  "MESSAGE.GROUP",
  "MESSAGE.BULK",
  "RESERVATION.TICKET",
  "RESERVATION.SUCCESS",
  "RESERVATION.MESSAGE",
  "RESERVATION.REJECT",
])

export async function newHandlerBroker(connection: Connection) {
  try {
    const channel = await connection.createChannel()
    await channel.assertQueue(KEY_QUEQUE, {
      durable: true,
    })

    await channel.prefetch(1_000)

    await channel.consume(
      KEY_QUEQUE,
      async function (_msg) {
        const msg = _msg as unknown as Message
        const raw = msg?.content?.toString()
        if (!raw) {
          channel.ack(msg)
          return
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
          .then(() => {
            channel.ack(msg)
          })
          .catch((err) => {
            console.error(err)
            channel.nack(msg)
          })
      },
      { noAck: false }
    )
  } catch (error) {
    console.log(error)
  }
}

export async function commandRouting(
  command: z.infer<typeof AVAILABLE_COMMAND>,
  payload: TObjUnknown,
  channel: Channel,
  msg: ConsumeMessage | Message,
  socket: WASocket
) {
  function nackMsg() {
    console.log(msg)
    return channel.nack(msg, true, false)
  }

  try {
    if (!socket) return nackMsg()

    // Handle socket connection
    try {
      await socket?.waitForSocketOpen()
    } catch (error) {
      console.log({ err: "socket?.waitForSocketOpen()" })
      return nackMsg()
    }

    if (command === "MESSAGE.TEXT") {
      const { phoneNumber, message } = payload
      await socket.sendMessage(phoneToJid(String(phoneNumber)), {
        text: String(message),
      })

      const found = String(message)
        .toLowerCase()
        .split(" ")
        .some((r) => wording.indexOf(r) >= 0)

      if (found) {
        //   send to group
        await socket.sendMessage(groupJid, {
          text: "Halo ada yang butuh assist",
        })

        await socket.sendMessage(groupJid, {
          contacts: {
            displayName: "+" + String(phoneNumber),
            contacts: [{ vcard: VCARD_CUSTOMER_TEMPLATE(String(phoneNumber)) }],
          },
        })
      }
    }

    if (command === "MESSAGE.IMAGE") {
      const { phoneNumber, message, image } = payload
      await socket.sendMessage(phoneToJid(String(phoneNumber)), {
        image: Buffer.from(String(image), "base64"),
        caption: String(message),
      })
    }

    if (command === "MESSAGE.GROUP") {
      const { message } = payload
      await socket.sendMessage(groupJid, {
        text: String(message),
      })
    }

    if (command === "MESSAGE.BULK") console.log("Unreachable")
    // channel.ack(msg)
  } catch (error) {
    console.error(error)
    nackMsg()
  }
}
