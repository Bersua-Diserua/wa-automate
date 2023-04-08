import { redisClient } from "./connection"

const isKeyAlive = async (key: string) => {
  const key1 = await redisClient.ttl(key)
  return key1 > 0
}

export { isKeyAlive }
