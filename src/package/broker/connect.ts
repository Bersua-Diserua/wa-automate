import amq from "amqplib"
import config from "../../utils/config"
import { newHandlerBroker } from "./handler"

let amqConnection!: amq.Connection

export async function connectAmq() {
  amqConnection = await amq.connect(config.env.RABBITMQ_URI)
  return amqConnection
}

connectAmq()
  .then((x) => newHandlerBroker(x))
  .then(() => console.log("Estabilished Broker"))
  .catch(console.error)

export { amqConnection }
