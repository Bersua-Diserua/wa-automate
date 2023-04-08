import amq from "amqplib"
import config from "../../utils/config"
import { newHandlerBroker } from "./handler"

let amqConnection!: amq.Connection

export async function connectAmq() {
  amqConnection = await amq.connect(config.env.RABBITMQ_URI)
  return amqConnection
}

export { amqConnection }
