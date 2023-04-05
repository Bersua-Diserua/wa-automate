import amq from "amqplib";
import config from "../../utils/config";

let amqConnection!: amq.Connection;

export async function connectAmq() {
  amqConnection = await amq.connect(config.env.RABBITMQ_URI);

  const channel = await amqConnection.createChannel();
  await channel.assertQueue("test", {
    durable: true,
  });

  await channel.consume(
    "test",
    function (msg) {
      var secs = msg.content.toString().split(".").length - 1;
      console.log(" [x] Received %s", msg.content.toString());
      setTimeout(function () {
        console.log(" [x] Done");
      }, secs * 1000);
    },
    { noAck: true }
  );
  return amqConnection;
}

connectAmq()
  .then(() => console.log("Estabilished Broker"))
  .catch(console.error);

export { amqConnection };
