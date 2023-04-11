import type { Connection, Channel, ConsumeMessage } from "amqplib"
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
        ).catch((err) => {
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
  msg: ConsumeMessage,
  socket: WASocket
) {
  function nackMsg() {
    return channel.nack(msg)
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
        await redisClient.set(
          String(phoneNumber),
          "live-assist",
          "EX",
          timeToExpire
        )

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
      channel.ack(msg)
      return
    }

    if (command === "MESSAGE.IMAGE") {
      const { phoneNumber, message, image } = payload
      await socket
        .sendMessage(phoneToJid(String(phoneNumber)), {
          image: Buffer.from(String(image), "base64"),
          caption: String(message),
        })
        .then(() => channel.ack(msg))
      return
    }

    if (command === "MESSAGE.GROUP") {
      const { message } = payload
      await socket.sendMessage(groupJid, {
        text: String(message),
      })
    }

    if (command === "MESSAGE.BULK") console.log("Unreachable")
  } catch (error) {
    console.error(error)
    nackMsg()
  }
}
