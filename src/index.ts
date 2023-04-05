import "./package/broker";
// import { HandleError } from "./controller/order.controller";
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@adiwajshing/baileys";

import { Boom } from "@hapi/boom";
import { SERUA_EVENT } from "./controller/event";
import { app } from "./server/server";
import config from "./utils/config";
import { messageHandler } from "./controller/message-handler";
import path from "path";
import { sendController } from "./controller/send";

const getFilePath = (file: string): string => path.resolve(process.cwd(), file);

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    // logger: P({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    qrTimeout: 1000 * 60 * 4,
  });

  SERUA_EVENT.on("send", (data) => sendController(sock, data));

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (!messages[0].key.fromMe) {
      messageHandler(sock, messages[0]);
    }
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut
      ) {
        startSock();
        console.log("Reconnected");
        // Logger.activity(`Reconnected`)
      } else {
        console.log("Connection closed. You are logged out.");
        // Logger.error("Connection closed. You are logged out.", update)
      }
    }

    // Logger.error(`Connection update`, update)
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
};

const PORT = config.env.port || 4000;
startSock()
  .then(() => {
    // Logger.activity(`Bot Running`);
    app.listen(PORT, () => {
      console.log(`Server starting on http://localhost:${PORT}`);
      //   Logger.activity(`Bot started with config `, config);
    });
  })
  //   .catch(() => Logger.error("Bot failed to run"));
  .catch(() => console.log("Bot failed to run"));

process.on("SIGINT", () => {
  //   HandleError("SIGNINT");
  process.exit(0);
});
process.on("uncaughtException", (err, origin) => {
  console.log(`uncaughtException`, JSON.stringify({ err, origin }));
  //   HandleError("uncaughtException");
});
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled", JSON.stringify({ reason, promise })); //not sending to telegram
  //   HandleError("unhandledRejection");
});
