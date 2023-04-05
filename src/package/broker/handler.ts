import type { Connection, Channel, ConsumeMessage } from "amqplib";
import { z } from "zod";

const KEY_QUEQUE = "task_backend";

const AVAILABLE_COMMAND = z.enum([
  "MESSAGE.SINGLE",
  "MESSAGE.BULK",
  "RESERVATION.TICKET",
  "RESERVATION.SUCCESS",
  "RESERVATION.MESSAGE",
  "RESERVATION.REJECT",
]);

export async function newHandlerBroker(connection: Connection) {
  const channel = await connection.createChannel();
  await channel.assertQueue(KEY_QUEQUE, {
    durable: true,
  });

  channel.prefetch(1);

  await channel.consume(
    KEY_QUEQUE,
    async function (msg) {
      const raw = msg?.content?.toString();
      if (!raw) {
        channel.ack(msg);
      }

      const parsed = JSON.parse(raw);
      const validateCommand = AVAILABLE_COMMAND.safeParse(parsed?.command);

      if (!validateCommand.success) {
        console.log(`${parsed?.command} not available`);
        channel.ack(msg);
        return;
      }

      await commandRouting(validateCommand.data, parsed.payload, channel, msg);
    },
    { noAck: false }
  );
}

export async function commandRouting(
  command: z.infer<typeof AVAILABLE_COMMAND>,
  payload: any,
  channel: Channel,
  msg: ConsumeMessage
) {
  console.log({
    command,
    payload,
  });

  channel.ack(msg);
}
