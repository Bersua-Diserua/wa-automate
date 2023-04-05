import { redisClient } from "./connection";

const isKeyAlive = async (key: string) => {
  const key1 = await redisClient.ttl(key);
  console.log({ key1, key });
  return key1 > 0;
};

export { isKeyAlive };
