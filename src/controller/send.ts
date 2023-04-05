import Logger from "../utils/logger";
import { SeruaEventMap } from "../types/event";
import { WASocket } from "@adiwajshing/baileys";
import { phoneToJid } from "../utils/parse-number-jid";

const sendController = async (
  socket: WASocket,
  data: SeruaEventMap["send"]
) => {
  try {
    if (data.type == "general-text") {
      const jid = phoneToJid(data.data.phone);
      socket.sendMessage(jid, {
        text: data.data.message,
      });
      // console.log("Success send")
    }

    if (data.type == "attach-media") {
      socket.sendMessage(phoneToJid(data.data.phone), {
        image: Buffer.from(data.data.image, "base64"),
        caption: data.data.message,
      });
      // console.log("Success send")
    }
  } catch (err) {
    if (err instanceof Error) {
      Logger.error(err.message, err.stack);
    } else {
      Logger.error("error", new Error(err));
    }
  }
};

export { sendController };
