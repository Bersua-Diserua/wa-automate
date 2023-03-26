import { MessageTemplate, TemplateMessage } from "../message";
import type { WAMessage, WASocket } from "@adiwajshing/baileys";

import { DEFAULT_RESPONSE } from "../message/response-message";

type SeruaMessage = { commandCode?: number } & WAMessage;

const messageHandler = async (socket: WASocket, message: WAMessage) => {
  const jid = message.key.remoteJid!;
  try {
    const { conversation = "", extendedTextMessage } = message?.message!;
    const msg = (conversation || extendedTextMessage?.text || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s/g, "")
      .split("-");

    if (msg[1] && msg[1].length !== 6) {
      socket.sendMessage(jid, { text: DEFAULT_RESPONSE });
      return;
    }

    if (msg[0] == "bisa" || msg[0] == "tidak") {
      // EVENT.emit("order"});
      return;
    }

    const parsedMessage: SeruaMessage = getParseMessage(message);
    if (!parsedMessage.commandCode) {
      socket.sendMessage(jid, { text: DEFAULT_RESPONSE });
      return;
    }

    const repliedMessage = getRepliedMessage(parsedMessage.commandCode);
    if (!repliedMessage) {
      socket.sendMessage(jid, { text: DEFAULT_RESPONSE });
      return;
    }

    socket.sendMessage(jid, {
      text: repliedMessage["message"],
    });

    // if (parsedMessage.commandCode == 5 || parsedMessage.commandCode == 6) {
    //   socket.sendMessage(jid, {
    //     contacts: {
    //       displayName: "OKE",
    //       contacts: [{ vcard: VCARD_OPERATOR }],
    //     },
    //   });
    // }
  } catch (error) {
    console.log({
      message: `Message error with jid: ${jid}`,
      context: message,
    });
    if (error instanceof Error) {
      console.log({
        message: `Message handler error: ${error.name}`,
        context: error,
      });
    } else {
      console.log({
        message: `Message handler error`,
        context: new Error(error),
      });
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

const getRepliedMessage = (commandCode: number): MessageTemplate | undefined =>
  TemplateMessage.find((val) => val.commandCode == commandCode);

export { messageHandler };
