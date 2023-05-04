import "./polyfill"

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@adiwajshing/baileys"

import { Boom } from "@hapi/boom"
import Logger from "./utils/logger"
import P from "pino"
import { SERUA_EVENT } from "./controller/event"
import { app } from "./server/server"
import config from "./utils/config"
import { connectAmq } from "./package/broker"
import { internalController } from "./controller/internal"
import { isGroupJid } from "./utils/parse-number-jid"
import { messageHandler } from "./controller/message-handler"
import { newHandlerBroker } from "./package/broker/handler"
import path from "path"
import { sendController } from "./controller/send"

const getFilePath = (file: string): string => path.resolve(process.cwd(), file)

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("session")
  const { version, isLatest } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: P({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    qrTimeout: 1000 * 60 * 4,
  })

  global.WA_SOCKET = sock

  // SERUA_EVENT.on("send", (data) => sendController(sock, data))
  // SERUA_EVENT.on("internal", (data) => internalController(sock, data))

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    try {
      const message = messages[0]
      if (!message.key.fromMe) {
        if (!isGroupJid(message.key.remoteJid!)) {
          await messageHandler(message)
        } else {
          // group handler; internal serua staff
        }
      }
    } catch (error) {
      console.log(error)
    }
  })

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update
    if (connection === "close") {
      if (
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut
      ) {
        startSock()
        Logger.activity(`Reconnected`)
      } else {
        Logger.error("Connection closed. You are logged out.", update)
      }
    }

    Logger.error(`Connection update`, update)
  })

  sock.ev.on("creds.update", saveCreds)

  return sock
}

const PORT = config.env.port || 4000
startSock()
  .then((sock) => {
    global.WA_SOCKET = sock
    Logger.activity(`Bot Running`)

    connectAmq()
      .then((x) => newHandlerBroker(x))
      .then(() => console.log("Estabilished Broker"))
      .catch(console.error)

    app.listen(PORT, () => {
      Logger.activity(`Bot started with config `, config)
    })
  })
  .catch(() => Logger.error("Bot failed to run"))

process.on("SIGINT", () => {
  //   HandleError("SIGNINT");
  process.exit(1)
})

process.on("uncaughtException", (err, origin) => {
  console.log(`uncaughtException`, JSON.stringify({ err, origin }))
  //   HandleError("uncaughtException");
  process.exit(1)
})

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled", JSON.stringify({ reason, promise })) //not sending to telegram
  //   HandleError("unhandledRejection");
  process.exit(1)
})
