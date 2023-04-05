import type { WAMessage, WASocket } from "@adiwajshing/baileys";
import {
  handlerGetDefaultMessage,
  handlerGetResponseByCommand,
} from "../lib/handler-backend.lib";
import { jidToPhone, phoneToJid } from "../utils/parse-number-jid";

import Logger from "../utils/logger";
import { isKeyAlive } from "../packages/redis/utils";
import { redisClient } from "../packages/redis";
import { timeToExpire } from "./internal";

type SeruaMessage = { commandCode?: number } & WAMessage;

const messageHandler = async (socket: WASocket, message: WAMessage) => {
  const jid = message.key.remoteJid!;

  try {
    const parsedMessage: SeruaMessage = getParseMessage(message);

    if (await isKeyAlive(jidToPhone(jid))) {
      console.log("alive");
      redisClient.set(jidToPhone(jid), "live-assist", "EX", timeToExpire);
      return;
    } else {
      console.log("die");
      if (parsedMessage) {
        await handlerGetResponseByCommand(
          jidToPhone(jid),
          parsedMessage.commandCode
        );
        return;
      } else {
        await handlerGetDefaultMessage(jidToPhone(jid));
        return;
      }
    }
  } catch (error) {
    Logger.error(`Message error with jid: ${jid}`, message);
    if (error instanceof Error) {
      Logger.error(`Message handler error: ${error.name}`, error);
    } else {
      Logger.error(`Message handler error`, new Error(error));
    }
  }
};

const getParseMessage = (msg: WAMessage): SeruaMessage => ({
  ...msg,
  commandCode:
    Number(
      msg.message &&
        (msg.message.conversation?.trim() ||
          msg.message.extendedTextMessage?.text?.trim())
    ) ?? undefined,
});

export { messageHandler };
