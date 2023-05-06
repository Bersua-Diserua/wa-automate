import { redisClient } from "./connection"

const isKeyAlive = async (key: string) => {
  const _key = await redisClient.ttl(key)
  return _key > 0
}

export { isKeyAlive }
